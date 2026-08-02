/* Kódolabky — service worker. Vďaka nemu sa hra dá nainštalovať na plochu
   tabletu a hrať aj bez internetu (na chate, v aute, v škôlke).

   ZÁMERNE BEZ ČÍSLA VERZIE. Bežný postup je zoznam súborov + konštanta
   `CACHE_VERSION`, ktorú treba pri každej zmene ručne zvýšiť — a presne na to
   sa vždy zabudne, takže deťom mesiace beží stará hra a nikto nevie prečo.
   Tu je stratégia „najprv sieť, cache ako záloha“:

     · online  → vždy čerstvá verzia, odpoveď sa popri tom ticho uloží
     · offline → poslúži posledná uložená verzia
     · nasadenie novej verzie → nič sa nebumpuje, stačí push

   Zaplatí sa za to tým, že štart čaká na sieť. Pri tejto veľkosti hry je to
   pár desiatok kB, takže výmena je viac než výhodná.

   Zásoba sa naplní sama: `boot()` v app.js si pri každom spustení stiahne
   index.json aj VŠETKÝCH 30 levelov, takže po jedinom online spustení je
   v cache kompletná hra. */

const CACHE = 'kodolabky';

/* Kostra, ktorá musí byť v zásobe hneď po inštalácii. Nestačí čakať, kým si to
   hra stiahne sama za behu: service worker sa aktivuje až PO prvom načítaní
   stránky, takže cez neho vtedy ešte nič neprejde. Keby rodič appku nainštaloval
   a hneď stratil signál, hra by nenaštartovala.

   Zoznam modulov je ručný (projekt nemá build). Keď sa naň niekedy zabudne,
   nič sa nezrúti — chýbajúci súbor sa uloží pri prvom online spustení sám. */
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',

  './styles/base.css',
  './styles/board.css',
  './styles/console.css',
  './styles/table.css',

  './src/game/app.js',
  './src/game/commands.js',
  './src/game/config.js',
  './src/game/leaderboard.js',
  './src/game/nick.js',
  './src/game/progress.js',
  './src/game/sound.js',
  './src/engine/program.js',
  './src/engine/vm.js',
  './src/engine/world.js',
  './src/ui/board.js',
  './src/ui/hall.js',
  './src/ui/icons.js',
  './src/ui/palette.js',
  './src/ui/table.js',
  './src/ui/welcome.js',

  './assets/icon.svg',
  './assets/icon-192.png',
  './assets/icon-512.png',
  './assets/icon-maskable-512.png',
  './assets/apple-touch-icon.png',
];

/** Uloží kostru aj všetky levely podľa `levels/index.json`. Levely sa čítajú
    z manifestu, nie z ručného zoznamu — nový level tak netreba doplniť na dve
    miesta. `cache: 'reload'` obíde HTTP cache prehliadača, inak by sa do zásoby
    mohla uložiť práve tá stará verzia, ktorej sa chceme zbaviť. */
async function naplnZasobu() {
  const cache = await caches.open(CACHE);
  const req = (u) => new Request(u, { cache: 'reload' });

  await cache.addAll(SHELL.map(req)).catch(() => {});

  try {
    const res = await fetch(req('./levels/index.json'));
    await cache.put('./levels/index.json', res.clone());
    const { levels } = await res.json();
    await cache.addAll(levels.map((p) => req('./levels/' + p)));
  } catch { /* offline pri inštalácii — dotiahne sa pri prvom spustení */ }
}

self.addEventListener('install', (event) => {
  event.waitUntil(naplnZasobu().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/** Uloží kópiu odpovede, ak sa to oplatí. Neúspešné a čiastočné odpovede
    do zásoby nepatria — offline by potom hra dostala rozbitý súbor. */
function stash(request, response) {
  if (!response || response.status !== 200) return response;
  // `basic` = vlastný pôvod, `cors` = písma z Google Fonts. Odpoveď typu
  // `opaque` sa uložiť dá, ale nedá sa o nej zistiť, či nie je chybová.
  if (response.type !== 'basic' && response.type !== 'cors') return response;
  const copy = response.clone();
  caches.open(CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
  return response;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;
  // Zvonku nás zaujímajú len písma. Rebríček (Supabase) sa cachovať NESMIE —
  // stará výsledková listina je horšia než žiadna.
  const fonts = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (!sameOrigin && !fonts) return;

  event.respondWith(najprvSiet(request));
});

/** Ako dlho čakať na sieť, kým sa siahne do zásoby. Platí LEN vtedy, keď je
    z čoho brať — prvé stiahnutie hry sa nikdy neprerušuje. */
const STROP_MS = 3500;

/** Kedy naposledy sieť zlyhala, a ako dlho ju potom neotravovať. */
let sietNaposledyPadla = 0;
const PAUZA_MS = 10000;

function sietSoStropom(request) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), STROP_MS);
    fetch(request).then(
      (r) => { clearTimeout(t); resolve(r); },
      (e) => { clearTimeout(t); reject(e); }
    );
  });
}

/** Najprv sieť, zásoba ako záloha.

    Dve pasce, na ktoré sa tu dá naletieť, a obe vyzerajú v prehliadači rovnako
    ako „hra je pokazená“:

    1. `fetch()` sa NEODMIETNE vždy, keď je zle — odmietne sa len pri skutočnom
       výpadku spojenia. Keď server, proxy, captive portál na hotelovej wifi
       alebo zlé nasadenie odpovie chybou 5xx/404, fetch sa pokojne splní, len
       s chybovou stránkou. Bez kontroly `ok` by hra dostala tú chybovú stránku
       namiesto modulu a rozsypala by sa, hoci má v zásobe všetko potrebné.

    2. Spojenie sa nemusí ani prerušiť, ani odpovedať — proste VISÍ. Vtedy by
       `await fetch()` nikdy nedobehol a dieťa by donekonečna pozeralo na
       „Načítavam misiu…“. Preto strop: keď máme zálohu, po 3,5 s ju použijeme. */
async function najprvSiet(request) {
  const zaloha = await caches.match(request, { ignoreSearch: true });

  /* Keď sieť práve zlyhala, nemá zmysel čakať strop znova pri každom ďalšom
     súbore — štart hry by sa natiahol na desiatky sekúnd (kostra má vyše
     päťdesiat položiek). Po chvíli ticha sa to skúsi znova, takže návrat
     signálu netreba nijako ohlasovať. */
  if (zaloha && Date.now() - sietNaposledyPadla < PAUZA_MS) return zaloha;

  try {
    const response = await (zaloha ? sietSoStropom(request) : fetch(request));
    if (response && response.ok) return stash(request, response);
    return zaloha ?? response;
  } catch {
    sietNaposledyPadla = Date.now();
    if (zaloha) return zaloha;
    // Nie je v zásobe (napr. odkaz priamo na podstránku) — nech sa aspoň
    // otvorí hra, nie chybová hláška prehliadača.
    if (request.mode === 'navigate') {
      const shell = await caches.match('./index.html');
      if (shell) return shell;
    }
    return Response.error();
  }
}
