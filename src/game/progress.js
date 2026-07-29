/* Kódolabky — hráč, postup a body. Iba localStorage, nič neodchádza zo zariadenia.

   Hráč je prezývka, ktorú dieťa zadá na začiatku, a KAŽDÁ prezývka má svoj
   vlastný postup: nové meno začína od nuly, návrat k starému menu pokračuje
   tam, kde skončilo. Na jednom tablete sa tak vystrieda hoci celá rodina
   a body sa im nepomiešajú. Tá istá prezývka ide aj do rebríčka.

   Bodovanie odmeňuje to isté, čo hra učí: krátky plán, pozornosť k mape
   a premyslenie plánu pred spustením. Zámerne NEODMEŇUJE rýchlosť ani počet
   pokusov — inak by sa dieťa naučilo klikať namiesto rozmýšľať.
   Body sa dajú za level získať raz; opakovaním sa nefarmia, drží sa najlepší
   výsledok. */

import { cleanNick } from './nick.js';

const KEY = 'codepaws.progress';
const VERSION = 4;

/* `predict` je za trafenú predpoveď a je zámerne najdrahšie ocenenie hneď po
   dokončení misie: správny tip pred spustením je najčistejší dôkaz, že dieťa
   si program prehralo v hlave. Dá sa získať len v leveloch typu `predict`. */
export const AWARDS = [
  { id: 'finish',  points: 100, label: 'Misia splnená' },
  { id: 'predict', points:  80, label: 'Jasnovidec' },
  { id: 'rows',    points:  60, label: 'Krátky plán' },
  { id: 'bones',   points:  40, label: 'Všetky kosti' },
  { id: 'clean',   points:  50, label: 'Bez jediného nárazu' },
];

export const RANKS = [
  { at: 0,    name: 'Šteniatko' },
  { at: 150,  name: 'Pomocník' },
  { at: 400,  name: 'Dispečer' },
  { at: 700,  name: 'Veliteľ zmeny' },
  { at: 1000, name: 'Hlavný dispečer' },
];

export const pointsFor = (awardIds) =>
  AWARDS.reduce((sum, a) => sum + (awardIds.includes(a.id) ? a.points : 0), 0);

/** Ktoré ocenenia sa v danom leveli vôbec dajú získať. V Predpovedi je plán daný,
    takže „krátky plán“ ani „bez nárazu“ nie sú zásluha dieťaťa. V Oprave (`debug`)
    je dĺžka plánu daná, takže „krátky plán“ nedáva zmysel — no „bez nárazu“ áno:
    kto si plán prečíta a opraví PRED spustením, nenarazí ani raz. */
export const awardIdsForLevel = (level) =>
  level?.type === 'predict' ? ['finish', 'predict']
  : level?.type === 'debug' ? ['finish', 'bones', 'clean']
  : ['finish', 'rows', 'bones', 'clean'];

export function rankFor(points) {
  let rank = RANKS[0];
  for (const r of RANKS) if (points >= r.at) rank = r;
  return rank;
}

/** Koľko bodov ešte chýba do ďalšej hodnosti (null = najvyššia). */
export function nextRank(points) {
  return RANKS.find((r) => r.at > points) ?? null;
}

/** `nick: null` znamená, že hra sa ešte nepredstavila — hru to nespustí.
    `players` drží postup každej prezývky zvlášť; `legacy` je postup zo
    stariny bez prezývky — adoptuje si ho prvá prezývka, ktorá sa zadá. */
const empty = () => ({
  version: VERSION,
  nick: null,
  players: {},
  legacy: null,
  settings: { mode: 'absolute', speed: 330 },
});

/** `submitted` = koľko bodov už odišlo do rebríčka (per hráč). */
const emptyPlayer = () => ({ levels: {}, submitted: 0 });

/** Postup práve prihlásenej prezývky. Bez prezývky vráti prázdny záznam,
    ktorý sa nikam neukladá — hra sa aj tak bez predstavenia nespustí. */
function player() {
  const store = load();
  if (!store.nick) return emptyPlayer();
  return (store.players[store.nick] ??= emptyPlayer());
}

let cache = null;

function load() {
  if (cache) return cache;
  let raw = null;
  try { raw = JSON.parse(localStorage.getItem(KEY) ?? 'null'); } catch { /* poškodené dáta */ }

  if (raw?.version === VERSION) {
    cache = raw;
  } else {
    cache = migrate(raw);
    save();   // nech sa prevod nerobí znova pri každom otvorení
  }

  return cache;
}

/** Postup z predošlých verzií sa nezahadzuje — dieťa oň neprišlo ničím vlastným.
    v1 = bez posádky, v2 = viac profilov (prežije aktívny), v3 = jeden hráč na
    zariadenie. Postup bez prezývky ide do `legacy` a adoptuje si ho prvá zadaná.
    Exportované kvôli testom: tichá strata postupu je chyba, ktorú nikto nenahlási. */
export function migrate(old) {
  const store = empty();
  if (!old) return store;

  store.settings = { ...store.settings, ...(old.settings ?? {}) };

  if (old.version === 3) {
    store.nick = old.nick ?? null;
    const rec = { levels: old.levels ?? {}, submitted: old.submitted ?? 0 };
    if (store.nick) store.players[store.nick] = rec;
    else if (Object.keys(rec.levels).length) store.legacy = rec;
    return store;
  }

  if (old.version === 2) {
    const active = old.profiles?.find((p) => p.id === old.activeId) ?? old.profiles?.[0];
    store.nick = cleanNick(active?.callsign) || null;
    if (store.nick) store.players[store.nick] = { levels: active?.levels ?? {}, submitted: 0 };
    return store;
  }

  const levels = {};
  for (const [levelId, rec] of Object.entries(old.levels ?? {})) {
    const stars = rec.stars ?? rec.awards ?? [];
    levels[levelId] = { awards: stars, points: pointsFor(stars) };
  }
  if (Object.keys(levels).length) store.legacy = { levels, submitted: 0 };
  return store;
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch { /* súkromný režim — hrá sa ďalej */ }
}

/* ── Nastavenia (spoločné pre celé zariadenie) ─────────────────── */

export const getSetting = (name) => load().settings[name];

export function setSetting(name, value) {
  load().settings[name] = value;
  save();
}

/* ── Hráč ──────────────────────────────────────────────────────── */

export const getNick = () => load().nick;

/** Kým je prázdna, hra sa nespustí — najprv sa treba predstaviť. */
export const hasNick = () => Boolean(load().nick);

/** Nová prezývka začína od nuly; známa pokračuje, kde skončila. Postup zo
    stariny (bez prezývky) si adoptuje prvá prezývka, ktorá sa zadá. */
export function setNick(text) {
  const nick = cleanNick(text);
  if (!nick) return null;
  const store = load();
  store.nick = nick;
  if (!store.players[nick]) {
    store.players[nick] = store.legacy ?? emptyPlayer();
    store.legacy = null;
  }
  save();
  return nick;
}

/* ── Psík ──────────────────────────────────────────────────────── */

/** Vybraný psík hráča — ukladá sa per prezývka, súrodenci majú každý svojho. */
export const getChar = () => player().char ?? 'fifo';

/** Psík uloženej prezývky (null = taká prezývka ešte nehrala alebo psíka nemá).
    Úvodné okno podľa toho predvyberá psíka vracajúceho sa hráča. */
export const charFor = (nick) => load().players[cleanNick(nick)]?.char ?? null;

export function setChar(id) {
  const rec = player();
  rec.char = id;
  save();
  return id;
}

/* ── Výsledky ──────────────────────────────────────────────────── */

export const awardsFor = (levelId) => player().levels[levelId]?.awards ?? [];

export const isSolved = (levelId) => awardsFor(levelId).includes('finish');

/** Koľko z bodov sa pripíše za OPAKOVANÉ dohratie už vyriešeného levelu.
    Vracať sa k obľúbenej misii sa má oplatiť, ale grindovať tú najľahšiu nie —
    nový level dá vždy podstatne viac než päť opakovaní starého. */
export const REPEAT_SHARE = 0.2;

/** Ocenenia sa len zlepšujú — raz získaná kosť sa nedá stratiť. Základné body
    za level sa počítajú z najlepších ocenení, opakovania sa zbierajú vedľa
    v `bonus`, aby sa základ nikdy nezdvojil. */
export function recordResult(levelId, awardIds) {
  const rec = player();
  const record = rec.levels[levelId];
  const wasSolved = (record?.awards ?? []).includes('finish');

  const prev = new Set(record?.awards ?? []);
  for (const id of awardIds) prev.add(id);
  const awards = [...prev];

  const bonus = (record?.bonus ?? 0) +
    (wasSolved ? Math.round(pointsFor(awardIds) * REPEAT_SHARE) : 0);

  rec.levels[levelId] = { awards, points: pointsFor(awards), bonus };
  save();
  return awards;
}

export function totals() {
  const levels = Object.values(player().levels);
  return {
    points: levels.reduce((sum, l) => sum + (l.points ?? 0) + (l.bonus ?? 0), 0),
    missions: levels.filter((l) => l.awards?.includes('finish')).length,
    bones: levels.reduce((sum, l) => sum + (l.awards ?? []).filter((a) => a !== 'clean').length, 0),
    clean: levels.filter((l) => l.awards?.includes('clean')).length,
  };
}

/* ── Zápis do rebríčka ─────────────────────────────────────────────
   Do rebríčka sa body PRIPOČÍTAVAJÚ, preto sa musí pamätať, čo už bolo
   zapísané. Inak by druhý klik na „Zapísať“ pridal celý súčet znova. */

export const submittedPoints = () => player().submitted ?? 0;

/** Koľko bodov ešte nebolo zapísaných — presne toľko sa pripočíta. */
export const pendingPoints = () => Math.max(0, totals().points - submittedPoints());

export function markSubmitted(points = totals().points) {
  const rec = player();
  rec.submitted = Math.max(rec.submitted ?? 0, points);
  save();
  return rec.submitted;
}
