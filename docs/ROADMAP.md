# Kódolabky — plán vývoja

## Etapa 0 · Návrh ✅
Herný, pedagogický a technický návrh, formát levelu, ukážkové levely.

## Etapa 1 · Hrateľné jadro (MVP) ✅
Cieľ: **jeden level sa dá naozaj prejsť.** Hotové 2026-07-28.

- [x] `world.js` + `vm.js` — mriežka, príkazy `move` / otáčanie / `use`, krokovanie
- [x] `board.js` — vykreslenie mriežky a psa, animácia po políčkach
- [x] `table.js` — tabuľka riadkov, pridať/zmazať/presunúť riadok, kurzor ▶
- [x] HUD — ▶ Štart, ⏭ Krok, ✕ Vymazať, tri rýchlosti
- [x] `levels/world1/*.json` — levely 1.1 – 1.4 a `Horí!` (dnes `2.1`)
- [x] `tests/index.html` — 57 testov vrátane overenia, že každý level je riešiteľný
- [x] navyše oproti plánu: oba režimy ovládania, tri kosti, ukladanie postupu,
      panel Stav, tip po druhom neúspechu

Výstup: dá sa ukázať dieťaťu a sledovať, kde tápa. **Toto je najdôležitejší
míľnik celého projektu** — návrh sa po ňom bude prekresľovať.

## Etapa 2 · Svety 1 a 2 kompletne
- [x] typy levelov **Predpoveď** (1.5) a **Oprav chybu** (1.6)
- [x] zvyšné levely sveta 1 (1.7 – 1.10) — Svet 1 je čisto chôdza a kosti
- [x] Svet 2 (2.1 – 2.10) — hadica `Použi`, vrátane Predpovede (2.5) a Opravy (2.6)
- [ ] mapa misií namiesto rozbaľovacieho zoznamu
- [ ] zvuky a oslava v cieli
- [ ] hlasové čítanie príkazov (`sk-SK`)
- [ ] mobil/tablet: dotyk, na výšku aj na šírku
- [ ] fonty self-hostovať (teraz sa ťahajú z Google Fonts → offline zlyhá)

## Etapa 3 · Cykly a podmienky (Svety 3–4)
- [ ] `repeat` s blokom riadkov + odsadenie v tabuľke
- [ ] limit riadkov a druhá kosť
- [ ] `if` / `else`, senzory, typ levelu **Zrkadlo**
- [ ] level 4.8 — náhodné bludisko

## Etapa 4 · Abstrakcia a stav (Svety 5–7)
- [ ] `call` + druhá tabuľka „Trik“
- [ ] debny, tlačidlá, dvere
- [ ] počítadlo, `while`, ochrana proti zacykleniu s vysvetlením

## Etapa 5 · Súbeh a Staviteľ (Svet 8 + editor)
- [ ] dve/tri tabuľky bežiace v jednom takte, `wait`
- [ ] editor levelov, zdieľanie cez odkaz

## Etapa 6 · Vydanie
- [x] PWA (offline, inštalácia na tablet) — `manifest.webmanifest` + `sw.js`.
      Service worker je zámerne **bez čísla verzie**: stratégia „najprv sieť,
      zásoba ako záloha“, takže sa pri nasadení nič nebumpuje a hra sa nedá
      zaseknúť na starej verzii. Levely sa predsťahujú podľa `levels/index.json`,
      nie z ručného zoznamu.
- [ ] fonty self-hostovať — offline zatiaľ padne na náhradné písmo, kým sa
      Google Fonts raz nestiahnu a neuložia do zásoby
- [ ] rodičovský/učiteľský prehľad zvládnutých konceptov
- [ ] tlačiteľné kartičky príkazov (PDF) na hru pri stole
- [ ] EN/DE preklad (`i18n/`)
- [ ] otestovať s aspoň 5 deťmi mimo rodiny

## Etapa 7 · Dielňa (React + FastAPI + PostgreSQL)
Samostatná aplikácia pre **autora a učiteľov** — nie pre deti. Hra na nej nikdy
nezávisí za behu, levely sa exportujú do statických JSON pri builde.
Podrobnosti a schéma: [ADR-001](ADR-001-stack.md).

- [ ] FastAPI + SQLAlchemy + Alembic, PostgreSQL (cloud free tier)
- [ ] **solver** — nájde optimálne riešenie levelu → automaticky nastaví limit
      riadkov pre druhú kosť
- [ ] **generátor bludísk** s garanciou riešiteľnosti a cieľovej obtiažnosti
- [ ] **validácia sady levelov v CI** — zachytí neriešiteľný level po úprave mapy
- [ ] React editor levelov pre autora
- [ ] učiteľský prehľad tried (pseudonymy „Žiak 7“, žiadne mená detí — GDPR)
- [ ] export `levels/*.json` z databázy do statického buildu hry

## Otvorené otázky
- Cieľový vek pre prvé testovanie — od toho závisí, či je východiskový režim
  `absolute` alebo `relative`.
- Vlastná kresba postavičiek vs. generovaná grafika (rozhoduje o licencii assetov).
- Má byť Staviteľ dostupný od začiatku, alebo až po Svete 2?
