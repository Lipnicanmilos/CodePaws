# Kódolabky 🐾 (CodePaws)

Hra pre deti (5–10 rokov), v ktorej **záchranárske šteniatka** prechádzajú bludiskom
podľa programu, ktorý dieťa napíše do **tabuľky príkazov** — riadok po riadku,
ako do databázy.

> Hlavná plocha = bludisko. Vpravo = tabuľka s očíslovanými riadkami.
> Dieťa poskladá príkazy do riadkov, stlačí **▶ Štart** a šteniatko vykonáva
> **jeden riadok = jeden krok**. Kurzor v tabuľke ukazuje, ktorý riadok práve beží.

Cieľ nie je len „prejsť bludisko“, ale naučiť sa **plánovať dopredu, predvídať výsledok
a hľadať chybu vo vlastnom pláne**.

## Stav projektu

🎮 **Etapa 1 hotová** — hra je hrateľná, 5 levelov sveta 1, oba režimy ovládania.
Ďalej pokračuje [ROADMAP](docs/ROADMAP.md) etapou 2.

## Spustenie

ES moduly nefungujú cez `file://`, takže dvojklik na `index.html` nestačí —
treba statický server:

```bash
python -m http.server 8140 --directory C:/Users/mlipnican/codepaws
```

Potom otvor `http://localhost:8140/`. Testy enginu bežia na
`http://localhost:8140/tests/` (žiadny Node netreba, testujú sa priamo v prehliadači).

V Claude Code stačí spustiť preview server `kodolabky`.

## Nasadenie online (GitHub Pages)

Hra je statická, takže ju GitHub Pages odslúži zadarmo a bez servera.
`gh` CLI sa na firemný notebook nedá nainštalovať, takže repozitár treba
založiť cez web na github.com (musí byť **verejný**, inak Pages vyžadujú Pro).

```bash
git -C "C:/Users/mlipnican/codepaws" remote add origin https://github.com/Lipnicanmilos/codepaws.git
```

```bash
git -C "C:/Users/mlipnican/codepaws" push -u origin main
```

Potom na GitHube: **Settings → Pages → Source: Deploy from a branch → `main` / `/ (root)`**.
Za pár minút beží na `https://lipnicanmilos.github.io/codepaws/`.

Všetky cesty v kóde sú relatívne, takže hra funguje aj v podpriečinku — netreba
nič prepisovať. `.nojekyll` je v repozitári preto, aby Pages súbory neprehnali
Jekyllom.

## Ako sa to hrá

1. Hore vpravo je prepínač **Otáčanie**:
   - **vypnuté** = režim *Šteniatko* (5–6 r.) — príkazy `Hore/Dole/Doľava/Doprava`
   - **zapnuté** = režim *Záchranár* (7+) — `Vpred` + `Vľavo`/`Vpravo`, pes má smer
2. Klikaním na paletu pribúdajú riadky — **jeden riadok = jeden krok**. Príkazy
   nemajú počet opakovaní; „trikrát hore“ sú tri riadky. Skrátiť sa to bude dať
   až cyklom `Opakuj` v Svete 2, a to je zámer.
3. **▶ Štart** spustí plán, **⏭ Krok** ho posúva po jednom riadku (ladenie),
   **✕ Vymazať** zahodí celý plán a skladá sa odznova.
   Psíka na štart vracať netreba — Štart aj úprava ktoréhokoľvek riadku to
   spravia samy, takže sa dá donekonečna skúšať bez jediného kliku navyše.
4. Tri kosti za level: dôjsť do cieľa · zmestiť sa do limitu riadkov ·
   pozbierať všetky kosti na mape.

## Dokumentácia

| Dokument | Obsah |
|---|---|
| [docs/DESIGN.md](docs/DESIGN.md) | Herný a pedagogický návrh, postavičky, typy levelov |
| [docs/CURRICULUM.md](docs/CURRICULUM.md) | Mapa 7 svetov a konceptov informatiky |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Formát levelu, model tabuľky, virtuálny stroj |
| [docs/ADR-001-stack.md](docs/ADR-001-stack.md) | Prečo statická hra a nie React + FastAPI + PostgreSQL |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Etapy vývoja (MVP → v1.0 → Dielňa) |

## Nový level

Stačí JSON súbor v `levels/world1/` a riadok v `levels/index.json`.
Ak má level vyplnené `solutions`, testy automaticky overia, že je riešiteľný,
že sa referenčné riešenie zmestí do limitu riadkov a že pozbiera všetky kosti —
v oboch režimoch ovládania.

## Technológie

Čistý **HTML + CSS + JavaScript** (ES moduly), **žiadny build, žiadne závislosti**.
Engine (`src/engine/`) nevie nič o DOM, takže sa dá testovať aj použiť neskôr
v solveri. Neskôr PWA → offline na tablete.

## Zásady

- 🚫 žiadne reklamy, žiadne nákupy, žiadne účty, žiadne odosielanie dát o deťoch
- 📴 postup v `localStorage`, nič neodchádza zo zariadenia
- ⏱️ žiadne časomiery a žiadny stres — dieťa má na premýšľanie neobmedzený čas
- ❌ chyba nie je prehra: pes zavrtí hlavou a v tabuľke sa červeno označí ten riadok,
  ktorý za to môže
- 🎨 vlastné originálne postavičky (viď [poznámka o právach](docs/DESIGN.md#pravna-poznamka))

## Známe obmedzenia

- Fonty sa zatiaľ ťahajú z Google Fonts → bez internetu sa použije systémový záložný
  font. Pred PWA ich treba self-hostovať.
- `Použi` mieri vždy dopredu; v absolútnom režime teda tam, kam pes naposledy kráčal.
  Levely s ohňom naň musia viesť čelne (viď ARCHITECTURE).

## Licencia

Kód: MIT (`LICENSE`). Grafika a zvuky: vlastná tvorba, licencia sa doplní pri prvých assetoch.
