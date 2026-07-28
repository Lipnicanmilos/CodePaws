# Kódolabky 🐾 (CodePaws)

### ▶ Hrať: **[lipnicanmilos.github.io/CodePaws](https://lipnicanmilos.github.io/CodePaws/)**

Hra pre deti (5–10 rokov), v ktorej **záchranárske šteniatka** prechádzajú bludiskom
podľa programu, ktorý dieťa napíše do **tabuľky príkazov** — riadok po riadku,
ako do databázy.

> Vľavo bludisko, v strede dispečerský pult so smerovými klávesami, vpravo tabuľka
> s očíslovanými riadkami. Dieťa poskladá kroky, stlačí **▶ Štart** a šteniatko
> vykonáva **jeden riadok = jeden krok**. Kurzor v tabuľke ukazuje, ktorý riadok
> práve beží.

Cieľ nie je len „prejsť bludisko“, ale naučiť sa **plánovať dopredu, predvídať výsledok
a hľadať chybu vo vlastnom pláne**. Preto sú v hre aj typy levelov, kde sa
neprogramuje, ale iba číta a predpovedá cudzí plán.

## Stav projektu

🎮 **Etapa 1 hotová a nasadená.** Hra je hrateľná: 5 levelov sveta 1, oba režimy
ovládania, tri kosti a body za level, Hráči, 63 testov.

⚠️ **Hru zatiaľ nevidelo ani jedno dieťa.** To je najbližšia úloha a blokuje
niekoľko rozhodnutí — viď [TODO](TODO.md).

## Ako sa to hrá

1. Hore vpravo je prepínač **Otáčanie**:
   - **vypnuté** = režim *Šteniatko* (5–6 r.) — klávesy `Hore/Dole/Doľava/Doprava`
     smerujú presne tam, kam na mape
   - **zapnuté** = režim *Záchranár* (7+) — `Vpred` + `Vľavo`/`Vpravo`, pes má svoj
     smer a treba myslieť z jeho pohľadu
2. Klikaním na pult pribúdajú riadky — **jeden riadok = jeden krok**. Príkazy nemajú
   počet opakovaní; „trikrát hore“ sú tri riadky. Skrátiť sa to bude dať až cyklom
   `Opakuj` v Svete 2, a to je zámer.
3. **▶ Štart** spustí plán, **⏭ Krok** ho posúva po jednom riadku (ladenie),
   **✕ Vymazať** zahodí celý plán a skladá sa odznova.
   Psíka na štart vracať netreba — Štart aj úprava ktoréhokoľvek riadku to spravia
   samy, takže sa dá donekonečna skúšať bez jediného kliku navyše.
4. Náraz do steny nie je prehra: pes zavrtí hlavou a v tabuľke sa **červeno označí
   ten riadok, ktorý za to môže**. Po druhom neúspechu sa ponúkne tip.

### Kosti a body

Tri kosti za level: dôjsť do cieľa · zmestiť sa do limitu riadkov · pozbierať
všetky kosti na mape. K tomu **body dispečera**:

| Ocenenie | Body | Čo odmeňuje |
|---|---|---|
| Misia splnená | **100** | riešenie existuje — dostane každý |
| Krátky plán | **60** | optimalizácia, cesta k cyklu |
| Všetky kosti | **40** | pozornosť k mape |
| **Bez jediného nárazu** | **50** | premyslenie plánu *pred* spustením |

To posledné sa **nedá vyklikať** — metóda pokus-omyl ho nikdy nedá. Zámerne tu nie sú
body za čas ani za počet pokusov; to by dieťa naučilo klikať namiesto rozmýšľať.
Body sa dajú získať raz, opakovaním sa nefarmia, a raz získané sa nedajú stratiť.

Zbierajú sa do hodností: *Šteniatko* → *Pomocník* (150) → *Dispečer* (400) →
*Veliteľ zmeny* (700) → *Hlavný dispečer* (1000).

### Hráči

Odznak vpravo hore otvorí posádku tohto zariadenia. Každý si napíše svoj **volací
znak** (`LABKA 1`, `NINKA Ľ`) a má vlastný postup, takže sa súrodenci na jednom
tablete neprepíšu. Nič z toho neopúšťa prehliadač.

### Rebríček

Rebríček drží **prvých pätnásť**. Po dohratí misie sa v okne s výsledkom ponúkne
tlačidlo **Zapísať do rebríčka** — teda presne vtedy, keď body pribudnú.
Otvoriť sa dá aj kedykoľvek zo zoznamu Hráči.

Hráč si zvolí prezývku a zapíše svoje body. Jedna prezývka je jedna priečka
a horší výsledok ten lepší neprepíše, takže rekord sa nedá pokaziť.
Zapisuje sa **len vtedy, keď to hráč sám urobí** — nikdy automaticky.

Ukladá sa iba **prezývka, body, počet misií a dátum**. Žiadne mená, e-maily ani
IP adresy; prezývky prejdú filtrom na vulgarizmy a majú strop 10 znakov.

Rebríček je **globálny**, keď je vyplnený [`src/game/config.js`](src/game/config.js);
kým je prázdny, funguje lokálne na jednom zariadení. Nastavenie servera je
v [server/README.md](server/README.md).

## Vývoj

ES moduly nefungujú cez `file://`, takže dvojklik na `index.html` nestačí —
treba statický server:

```bash
python -m http.server 8140 --directory C:/Users/mlipnican/codepaws
```

Hra beží na `http://localhost:8140/`. V Claude Code stačí spustiť preview server
`kodolabky`.

### Testy

```
http://localhost:8140/tests/
```

63 testov, bežia priamo v prehliadači — **žiadny Node netreba** (a na tomto stroji
ani nie je). Okrem interpreta a bodovania overujú aj to, že **každý level je
riešiteľný**, že limit riadkov sedí na optimálne riešenie a že sa dajú pozbierať
všetky kosti — a to v oboch režimoch ovládania. To chráni pred tým, aby úprava mapy
ticho rozbila level.

Rovnaké testy bežia aj naživo na
[lipnicanmilos.github.io/CodePaws/tests/](https://lipnicanmilos.github.io/CodePaws/tests/).

### Štruktúra

```
index.html            jediná stránka
styles/               base · board · console · table
src/
  engine/             bez akejkoľvek väzby na DOM → testovateľné
    world.js          mriežka, dlaždice, predmety, aktéri
    vm.js             interpret: step() = jeden takt → udalosti
    program.js        model tabuľky, expandRows, limity riadkov
  ui/
    board.js          3D dioráma, animácie, konfety
    table.js          tabuľka plánu, kurzor programu
    palette.js        krížový D-pad na pulte
    crew.js           Hráči
    icons.js          všetky SVG vrátane psíkov
  game/
    app.js            spojenie enginu a UI
    commands.js       katalóg príkazov, paleta podľa režimu
    progress.js       posádka, body, hodnosti (localStorage)
    leaderboard.js    Rebríček — lokálne alebo Supabase, podľa config.js
    config.js         adresa a kľúč Supabase (prázdne = lokálny rebríček)
levels/               JSON, index.json je zoznam
server/               SQL a návod na globálny rebríček (Supabase)
assets/icon.svg       značka: labka poskladaná z dlaždíc bludiska
tests/index.html      testy v prehliadači
```

### Nový level

Stačí JSON súbor v `levels/world1/` a riadok v `levels/index.json`.
Ak má level vyplnené `solutions`, testy automaticky overia, že je riešiteľný,
že limit riadkov sedí na optimálne riešenie a že sa dajú pozbierať všetky kosti.

## Nasadenie

Nasadené na GitHub Pages z vetvy `main`, priečinok `/ (root)`.
**Push do `main` = nasadenie.** Žiadny build, žiadny deploy krok.

```bash
git -C "C:/Users/mlipnican/codepaws" push
```

Priebeh je vidno v [Actions](https://github.com/Lipnicanmilos/CodePaws/actions)
ako workflow „pages build and deployment“; **Settings → Pages** ukazuje adresu
a čas posledného nasadenia a **Environments → `github-pages`** celú históriu.

Všetky cesty v kóde sú relatívne, takže hra funguje aj v podpriečinku.
`.nojekyll` bráni tomu, aby Pages súbory prehnali Jekyllom.

## Technológie a vzhľad

Čistý **HTML + CSS + JavaScript** (ES moduly), **žiadny build, žiadne závislosti**.
Engine nevie nič o DOM, takže sa dá testovať a neskôr použiť v solveri.

Vzhľad: **dispečerský pult záchrannej stanice**. Petrolejová `#16323F` s jantárovým
akcentom `#FFB01F` — paleta záchranárskeho vozidla. Sirénová `#F04E37` je vyhradená
výlučne pre chybu a oheň, nikdy ako dekorácia. Bludisko je naklonená dioráma
(`rotateX(15deg)`) s vytiahnutými stenami, aby dieťa videlo prekážku, a nie inak
zafarbený štvorček.

Písmo: **Baloo 2** (nadpisy), **Atkinson Hyperlegible** (text — navrhol Braille
Institute na maximálne rozlíšenie tvarov písmen, čo pre začínajúceho čitateľa nie je
ozdoba ale funkcia) a **DM Mono** (displej na pulte).

## Zásady

- 🚫 žiadne reklamy, žiadne nákupy, žiadne účty, žiadne odosielanie dát o deťoch
- 📴 postup v `localStorage`, nič neodchádza zo zariadenia
- ⏱️ žiadne časomiery a žiadny stres — dieťa má na premýšľanie neobmedzený čas
- ❌ chyba nie je prehra, iba chybové hlásenie s miestom chyby
- 🚫 žiadne body za rýchlosť ani za počet levelov, žiadny rebríček proti cudzím deťom
- 🎨 vlastné originálne postavičky (viď nižšie)

## Kľúčové rozhodnutia

| Rozhodnutie | Kde je zdôvodnené |
|---|---|
| Vlastné postavičky namiesto Labkovej patroly (ochranná známka Spin Master) | [DESIGN §9](docs/DESIGN.md#pravna-poznamka) |
| Každá postavička = jeden koncept informatiky | [DESIGN §3](docs/DESIGN.md) |
| Jeden riadok = jeden krok, príkazy nemajú počet opakovaní | [DESIGN §2](docs/DESIGN.md) |
| Statická hra bez backendu; React + FastAPI + PostgreSQL až na „Dielňu“ | [ADR-001](docs/ADR-001-stack.md) |
| Body odmeňujú premýšľanie, nie rýchlosť; Hráči nie je rebríček | [DESIGN §6b](docs/DESIGN.md) |
| `Použi` mieri vždy dopredu → levely s ohňom naň musia viesť čelne | [ARCHITECTURE §4](docs/ARCHITECTURE.md) |

## Dokumentácia

| Dokument | Obsah |
|---|---|
| [TODO.md](TODO.md) | Konkrétne úlohy na najbližšie sedenia |
| [docs/ROADMAP.md](docs/ROADMAP.md) | Etapy vývoja (MVP → v1.0 → Dielňa) |
| [docs/DESIGN.md](docs/DESIGN.md) | Herný a pedagogický návrh, postavičky, typy levelov, bodovanie |
| [docs/CURRICULUM.md](docs/CURRICULUM.md) | Mapa 7 svetov a konceptov informatiky, level po leveli |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Formát levelu, model tabuľky, virtuálny stroj |
| [docs/ADR-001-stack.md](docs/ADR-001-stack.md) | Prečo statická hra a nie React + FastAPI + PostgreSQL |

## Známe obmedzenia

- Fonty sa ťahajú z Google Fonts → bez internetu sa použije systémový záložný font.
  Pred PWA ich treba self-hostovať.
- Ikona je zatiaľ len SVG. Na inštaláciu PWA na tablet budú treba aj PNG veľkosti.
- `Použi` mieri vždy dopredu; v absolútnom režime teda tam, kam pes naposledy kráčal,
  a nie je to na mape vidno.
- Číslovanie levelov má dieru (1.1–1.4, potom 1.7) — 1.5 a 1.6 sú typy, ktoré ešte
  nie sú naprogramované.
- Hra sa ovláda myšou a dotykom; klávesnicou zatiaľ len čiastočne.
- **Rebríček je zatiaľ lokálna** — globálnou sa stane až po nastavení Supabase
  (viď [server/README.md](server/README.md)). Body sa zatiaľ neoverujú, klient si
  vie poslať ľubovoľné číslo; strop v SQL bráni aspoň absurditám.
- Bezplatný projekt Supabase sa po týždni nečinnosti uspí a rebríček dovtedy
  neodpovedá, kým ho v konzole neprebudíš.

## Licencia

Kód: MIT (`LICENSE`). Grafika a zvuky: vlastná tvorba, licencia sa doplní pri prvých assetoch.
