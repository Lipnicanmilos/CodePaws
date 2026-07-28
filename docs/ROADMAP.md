# Kódolabky — plán vývoja

## Etapa 0 · Návrh ✅
Herný, pedagogický a technický návrh, formát levelu, ukážkové levely.

## Etapa 1 · Hrateľné jadro (MVP)
Cieľ: **jeden level sa dá naozaj prejsť.**

- [ ] `world.js` + `vm.js` — mriežka, príkazy `move` / otáčanie / `use`, krokovanie
- [ ] `board.js` — vykreslenie mriežky a psa, animácia po políčkach
- [ ] `table.js` — tabuľka riadkov, pridať/zmazať/presunúť riadok, kurzor ▶
- [ ] `hud.js` — ▶ Štart, ⏭ Krok, ⟲ Reset, rýchlosť
- [ ] `levels/world1/*.json` — levely 1.1 – 1.4
- [ ] `tests/index.html` — prvé testy interpreta

Výstup: dá sa ukázať dieťaťu a sledovať, kde tápa. **Toto je najdôležitejší
míľnik celého projektu** — návrh sa po ňom bude prekresľovať.

## Etapa 2 · Svet 1 kompletne
- [ ] typy levelov **Predpoveď** a **Oprav chybu**
- [ ] tri kosti, mapa misií, ukladanie postupu do `localStorage`
- [ ] zvuky, idle animácie, oslava v cieli
- [ ] hlasové čítanie príkazov (`sk-SK`)
- [ ] mobil/tablet: dotyk, na výšku aj na šírku

## Etapa 3 · Cykly a podmienky (Svety 2–3)
- [ ] `repeat` s blokom riadkov + odsadenie v tabuľke
- [ ] limit riadkov a druhá kosť
- [ ] `if` / `else`, senzory, typ levelu **Zrkadlo**
- [ ] level 3.7 — náhodné bludisko

## Etapa 4 · Abstrakcia a stav (Svety 4–6)
- [ ] `call` + druhá tabuľka „Trik“
- [ ] debny, tlačidlá, dvere
- [ ] počítadlo, `while`, ochrana proti zacykleniu s vysvetlením

## Etapa 5 · Súbeh a Staviteľ (Svet 7 + editor)
- [ ] dve/tri tabuľky bežiace v jednom takte, `wait`
- [ ] editor levelov, zdieľanie cez odkaz

## Etapa 6 · Vydanie
- [ ] PWA (offline, inštalácia na tablet)
- [ ] rodičovský/učiteľský prehľad zvládnutých konceptov
- [ ] tlačiteľné kartičky príkazov (PDF) na hru pri stole
- [ ] EN/DE preklad (`i18n/`)
- [ ] otestovať s aspoň 5 deťmi mimo rodiny

## Otvorené otázky
- Cieľový vek pre prvé testovanie — od toho závisí, či je východiskový režim
  `absolute` alebo `relative`.
- Vlastná kresba postavičiek vs. generovaná grafika (rozhoduje o licencii assetov).
- Má byť Staviteľ dostupný od začiatku, alebo až po Svete 2?
