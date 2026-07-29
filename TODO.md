# Kódolabky — TODO

Konkrétne úlohy na najbližšie sedenia. Fázový pohľad je v [ROADMAP](docs/ROADMAP.md),
toto je zoznam vecí, ktoré sa dajú zobrať a spraviť.

---

## 0. Najprv toto — otestovať s dieťaťom

**Toto je najdôležitejšia položka celého zoznamu a blokuje rozhodnutia nižšie.**
Zatiaľ hru nevidelo ani jedno dieťa. Ďalších desať levelov postavených naslepo
môže byť desať levelov do koša.

- [ ] Posadiť k hre dieťa 5–7 r. a **iba pozerať** — nenapovedať, nekomentovať
- [ ] Zapísať: kde sa zaseklo, čo nepochopilo, čo ho bavilo, kedy odišlo
- [ ] **Rozhodnúť východiskový režim ovládania** — šípky (absolute) vs. otáčanie
      (relative). Dnes je východiskový `absolute`, ale je to odhad, nie zistenie.
      Zdroj: `docs/ROADMAP.md` → Otvorené otázky
- [ ] Overiť, či je „Vymazať“ nebezpečné (omylom stlačené pri dlhom pláne) →
      ak áno, doplniť „↶ Vrátiť“ na pár sekúnd do hlavičky plánu
- [ ] Overiť, či sedí sklon dosky (15°) a výška stien (15 px) — na tablete v ruke
      to môže byť iné než na monitore

---

## 0b. Zapnúť globálny Rebríček

Kód je hotový, chýba už len účet — ten ti nikto nezaloží za teba.
Celý postup je v [server/README.md](server/README.md), trvá ~10 minút.

- [x] Založiť bezplatný projekt na [supabase.com](https://supabase.com)
- [x] Spustiť [`server/supabase.sql`](server/supabase.sql) v SQL Editore
- [x] Vložiť **publishable** kľúč do `src/game/config.js` → rebríček je globálny
- [x] Overiť: čítanie 200, priamy zápis zamietnutý RLS, funkcia validuje,
      zápis z prehliadača prejde vrátane CORS
- [x] Zmazať testovacie záznamy — tabuľka je prázdna a pripravená

- [x] **Spustiť aktualizovaný [`server/supabase.sql`](server/supabase.sql) znova**
      — spustené 2026-07-29, na Supabase beží verzia bez stropu, body sa pripočítavajú.

- [x] **Spustiť [`server/supabase.sql`](server/supabase.sql) ešte raz** — spustené
      2026-07-29: stĺpec `dog` a 4-parametrová `submit_score` sú na serveri.

Strop viazaný na počet levelov už neexistuje — pri každom novom leveli sa zabudol
zvýšiť a poctivému hráčovi potom zápis tíško padol. Ostáva len poistka proti
nezmyslu, ktorú hraním nedosiahneš.

## 1. Etapa 2 — Svet 1 kompletne

### Nové typy levelov
- [x] **Typ `predict` (level 1.5 „Kde skončím?“)** — hotové, v hre vrátane
      ocenenia „Jasnovidec“ +80.
- [x] **Typ `debug` (level 1.6 „Zlý riadok“)** — hotové: predvyplnený plán,
      správne riadky zamknuté (`locked` v presete prežíva `expandRows`),
      zlý riadok sa zmaže ✕ a nový príkaz sa vloží do diery (nie na koniec).
      Testy: pokazený plán musí zlyhať, opravený prejsť, výmena = rovnaká dĺžka.
- [ ] Levely **1.8 – 1.10** podľa `docs/CURRICULUM.md`

### UI
- [ ] **Mapa misií** namiesto rozbaľovacieho zoznamu — misie ako body na mape
      stanice, s kosťami a hodnosťou
- [x] **Zvuky** — ťapkanie labiek, cink pri kosti, „haf“ pri náraze, psst pri
      ohni, fanfára v cieli. Syntetizované cez Web Audio (žiadne súbory, offline OK),
      prepínač vedľa rýchlosti, voľba sa pamätá, východiskovo zapnuté.
- [ ] **Hlasové čítanie príkazov** (Web Speech API, `sk-SK`) — klik na riadok ho
      prečíta. Kvôli deťom, ktoré ešte nečítajú.
- [x] **Ovládanie klávesnicou** — šípky pridávajú kroky (podľa režimu),
      `Enter` = Štart, `Space` = Krok; pri otvorenom okne sa klávesy nechytajú.

### Blokátory pre PWA
- [ ] **Self-hostovať fonty** (Baloo 2, Atkinson Hyperlegible, DM Mono) — dnes sa
      ťahajú z Google Fonts, takže offline padnú na systémové
- [ ] **PNG ikony** (192, 512, maskable) — `assets/icon.svg` na inštaláciu nestačí
- [ ] `manifest.json` + service worker, **pri každej zmene bumpnúť verziu cache**

---

## 2. Drobnosti a technický dlh

- [ ] **Indikátor smeru pri `Použi`** — v absolútnom režime pes mieri tam, kam
      naposledy kráčal, čo nie je vidno. Zvážiť šípku pred psom, keď je `use`
      v palete. (Pozadie: `docs/ARCHITECTURE.md` → pravidlo pre tvorbu levelov)
- [ ] **Konflikt dvoch design skillov** — `modern-web-design` a `frontend-design`
      sa oba spustia na „sprav peknú stránku“. Ak si začnú protirečiť, zúžiť
      `description:` jedného z nich.
- [x] **Číslovanie levelov má dieru** — vyriešené: 1.1–1.7 sú kompletné,
      chýbajú už len 1.8–1.10.
- [ ] Skontrolovať kontrast a ovládanie klávesnicou naprieč celou hrou
- [ ] Otestovať na skutočnom tablete (nielen v zmenšenom okne prehliadača)

---

## 3. Neskôr — Etapy 3 až 7

Detaily v [ROADMAP](docs/ROADMAP.md). V skratke:

- **Svet 2** — `Opakuj n×` s blokom riadkov, odsadenie v tabuľke, limit riadkov
- **Svet 3** — `Ak … inak`, senzory, typ levelu **Zrkadlo**, náhodné bludisko (3.7)
- **Svet 4** — `Trik` = funkcia, druhá tabuľka
- **Svet 5** — debny, tlačidlá, dvere (stav sveta)
- **Svet 6** — počítadlo, `Opakuj kým…`
- **Svet 7** — dva psy naraz, `Čakaj` (súbežnosť)
- **Dielňa** (Etapa 7) — React + FastAPI + PostgreSQL: editor levelov, solver na
  automatický limit riadkov, generátor bludísk, učiteľský prehľad.
  Hra na nej nikdy nezávisí za behu — viď [ADR-001](docs/ADR-001-stack.md).

---

## Hotové

- [x] Výber psíka (2026-07-29) — v úvodnom okne si dieťa vyberie jedného zo
      šiestich psíkov; ten hrá v leveloch a je aj avatarom v rebríčku (stĺpec
      `dog`, server whitelistuje). Psík patrí prezývke; vracajúcemu sa hráčovi
      sa predvyberie jeho a neprepíše sa, kým si sám nevyberie iného.
      Zámerne VLASTNÉ postavičky, nie napodobenina Labkovej patroly (ochranná
      známka Spin Master) — spoločný je len žáner záchranárskeho tímu.
- [x] Body per hráč (2026-07-29) — každá prezývka má vlastný postup: nová začína
      od nuly, návrat k starej pokračuje; migrácia v3→v4 nič nestráca
- [x] Auto-zápis do rebríčka (2026-07-29) — nové body odchádzajú samé po každej
      dohratej misii (a pri štarte hry sa dozbierajú offline zvyšky); ručné
      „Zapísať“ v rebríčku ostáva ako záloha
- [x] Etapa 1 — engine, UI, 5 levelov, oba režimy ovládania, tri kosti
- [x] 63 testov v prehliadači vrátane overenia, že každý level je riešiteľný
- [x] Redizajn — dispečerský pult v strede, 3D dioráma, prekreslení psíci
- [x] Jeden riadok = jeden krok (zrušený stĺpec „Koľko“)
- [x] Vlastné písmo a ikona
- [x] Body dispečera, hodnosti a Hráči
- [x] Rebríček — rebríček prvých 15, filter prezývok, SQL a návod na Supabase
- [x] Nasadenie na GitHub Pages
