# Kódolabky 🐾 (CodePaws)

Hra pre deti (5–10 rokov), v ktorej **záchranárske šteniatka** prechádzajú bludiskom podľa
programu, ktorý dieťa napíše do **tabuľky príkazov** — riadok po riadku, ako do databázy.

> Hlavná plocha = bludisko. Vpravo = tabuľka s očíslovanými riadkami.
> Dieťa poskladá príkazy do riadkov, stlačí **▶ Štart** a šteniatko vykonáva
> **jeden riadok = jeden krok**. Kurzor v tabuľke ukazuje, ktorý riadok práve beží.

Cieľ nie je len „prejsť bludisko“, ale naučiť sa **plánovať dopredu, predvídať výsledok
a hľadať chybu vo vlastnom pláne**.

## Stav projektu

📐 **Fáza návrhu.** Kód zatiaľ nie je — v repozitári je kompletný herný, pedagogický
a technický návrh + ukážkový formát levelu.

| Dokument | Obsah |
|---|---|
| [docs/DESIGN.md](docs/DESIGN.md) | Herný a pedagogický návrh, postavičky, typy levelov, prečo je to pútavé |
| [docs/CURRICULUM.md](docs/CURRICULUM.md) | Mapa 7 svetov a konceptov informatiky |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Technický návrh, formát levelu, virtuálny stroj |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Etapy vývoja (MVP → v1.0) |
| [levels/](levels/) | Ukážkové levely v JSON |

## Technológie

Čistý **HTML + CSS + JavaScript** (ES moduly), **žiadny build, žiadne závislosti**.
Otvorí sa dvojklikom na `index.html` alebo cez GitHub Pages. Neskôr PWA → funguje
offline na tablete.

## Zásady

- 🚫 žiadne reklamy, žiadne nákupy, žiadne účty, žiadne odosielanie dát o deťoch
- 📴 funguje offline, postup v `localStorage`
- ⏱️ žiadne časomiery a žiadny stres — dieťa má na premýšľanie neobmedzený čas
- 🔤 hrateľné aj bez čítania (ikony + hlasové čítanie príkazov)
- 🎨 vlastné originálne postavičky (viď [poznámka o právach](docs/DESIGN.md#pravna-poznamka))

## Licencia

Kód: MIT (`LICENSE`). Grafika a zvuky: vlastná tvorba, licencia sa doplní pri prvých assetoch.
