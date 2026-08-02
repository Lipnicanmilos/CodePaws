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

🎮 **Hrateľné a nasadené.** 6 levelov sveta 1, oba režimy ovládania, kosti a body,
globálny rebríček, 85 testov. Etapa 2 je rozbehnutá — pribudol prvý level typu
**Predpoveď**.

⚠️ **Hru zatiaľ nevidelo ani jedno dieťa.** To je najbližšia úloha a blokuje
niekoľko rozhodnutí — viď [TODO](TODO.md).

## Ako sa to hrá

Pri každom spustení sa hra opýta na **prezývku** a až potom sa rozbehne. Poslednú si
pamätá, takže sa dá len potvrdiť. Tá istá prezývka ide neskôr aj do rebríčka —
zámerne to **nemá byť skutočné meno**.

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

### Typy levelov

| Typ | Čo dieťa robí | Čo sa tým učí |
|---|---|---|
| `path` | skladá vlastný plán a dovedie psíka do cieľa | sekvencia, plánovanie |
| `predict` | plán je **hotový a zamknutý**; dieťa klikne do bludiska na políčko, kde podľa neho pes zastane, a až potom sa program spustí | čítať cudzí kód a simulovať ho v hlave |

Predpoveď je pedagogické jadro hry: správny tip **pred** spustením je najčistejší
dôkaz, že dieťa program naozaj sleduje a nehádže kroky naslepo. Preto je ocenenie
zaň druhé najdrahšie a dá sa získať **len na prvý tip** — druhýkrát už odpoveď pozná.

### Kosti a body

Tri kosti za level: dôjsť do cieľa · zmestiť sa do limitu riadkov · pozbierať
všetky kosti na mape. K tomu **body dispečera**:

| Ocenenie | Body | Kde | Čo odmeňuje |
|---|---|---|---|
| Misia splnená | **100** | všade | riešenie existuje — dostane každý |
| **Jasnovidec** | **80** | `predict` | trafená predpoveď hneď **prvým** tipom |
| Krátky plán | **60** | `path` | optimalizácia, cesta k cyklu |
| Bez jediného nárazu | **50** | `path` | premyslenie plánu *pred* spustením |
| Všetky kosti | **40** | `path` | pozornosť k mape |

Posledné dve sa **nedajú vyklikať** — metóda pokus-omyl ich nikdy nedá. Zámerne tu
nie sú body za čas ani za počet pokusov; to by dieťa naučilo klikať namiesto rozmýšľať.

**Opakovanie levelu** dá **20 %** z bodov (`REPEAT_SHARE` v `progress.js`). Vracať sa
k obľúbenej misii sa má oplatiť, ale grindovať tú najľahšiu nie — päť opakovaní
neprebije jeden nový level. Základ za level sa pritom nikdy nezdvojí; opakovania
sa zbierajú vedľa. Raz získané ocenenie sa nedá stratiť.

Body sa zbierajú do hodností: *Šteniatko* → *Pomocník* (150) → *Dispečer* (400) →
*Veliteľ zmeny* (700) → *Hlavný dispečer* (1000).

### Rebríček

Odznak vpravo hore (prezývka a body) otvorí **rebríček prvých pätnástich**.
Po dohratí misie sa ponúkne aj priamo v okne s výsledkom — teda presne vtedy,
keď body pribudnú.

Body sa v rebríčku **pripočítavajú**: kto sa vráti a zahrá ďalšie kolo pod tou istou
prezývkou, tomu priečka narastie. Aby druhý klik na *Zapísať* body nezdvojnásobil,
posiela sa **len prírastok od posledného zápisu**, nie celý súčet. Zapisuje sa
**len vtedy, keď to hráč sám urobí** — nikdy automaticky.

Ukladá sa iba **prezývka, body, počet misií a dátum**. Žiadne mená, e-maily ani
IP adresy; prezývky prejdú filtrom na vulgarizmy a majú strop 10 znakov.

Rebríček je **globálny**, keď je vyplnený [`src/game/config.js`](src/game/config.js);
kým je prázdny, funguje lokálne na jednom zariadení. Nastavenie servera je
v [server/README.md](server/README.md).

> ⚠️ **Zmenu v [`server/supabase.sql`](server/supabase.sql) treba vždy ručne spustiť
> v Supabase.** Kód sa nasadí pushom, databázová funkcia nie. Hra si to po zápise
> sama overí a upozorní, keď body nepribudli.

## Vývoj

ES moduly nefungujú cez `file://`, takže dvojklik na `index.html` nestačí —
treba statický server:

```bash
python server/dev_server.py 8140 C:/Users/mlipnican/codepaws
```

Hra beží na `http://localhost:8140/`. V Claude Code stačí spustiť preview server
`kodolabky`.

Prečo vlastný server namiesto `python -m http.server`: ten neposiela
`Cache-Control`, takže si prehliadač podľa vlastného odhadu drží ES moduly a JSON
levelov aj po tom, čo sa súbor zmení. Beží potom stará verzia a hľadá sa
neexistujúca chyba. `dev_server.py` cache zakáže.

### Testy

```
http://localhost:8140/tests/
```

85 testov, bežia priamo v prehliadači — **žiadny Node netreba** (a na tomto stroji
ani nie je). Okrem interpreta, bodovania a prezývok overujú aj to, že **každý level
je riešiteľný**, že limit riadkov sedí na optimálne riešenie a že sa dajú pozbierať
všetky kosti — a to v oboch režimoch ovládania. Pri leveloch typu `predict` overujú,
že hotový plán dobehne presne na políčko odpovede a že sa predpoveď nevyhodnotí
skôr, než plán dobehne. To chráni pred tým, aby úprava mapy ticho rozbila level.

Testujú aj **prevod uloženého postupu** medzi verziami — dieťa oň nesmie prísť len
preto, že sa zmenil formát.

Rovnaké testy bežia aj naživo na
[lipnicanmilos.github.io/CodePaws/tests/](https://lipnicanmilos.github.io/CodePaws/tests/).

### Štruktúra

```
index.html            jediná stránka
styles/               base · board · console · table
src/
  engine/             bez akejkoľvek väzby na DOM → testovateľné
    world.js          mriežka, dlaždice, predmety, aktéri, vyhodnotenie cieľov
    vm.js             interpret: step() = jeden takt → udalosti
    program.js        model tabuľky, expandRows, limity riadkov
  ui/
    board.js          3D dioráma, animácie, konfety, tip a odpoveď v Predpovedi
    table.js          tabuľka plánu, kurzor programu, zamknutý plán
    palette.js        krížový D-pad na pulte
    welcome.js        úvodné okno s prezývkou
    hall.js           rebríček
    icons.js          všetky SVG vrátane psíkov
  game/
    app.js            spojenie enginu a UI
    commands.js       katalóg príkazov, paleta podľa režimu
    progress.js       postup, body, hodnosti, prezývka (localStorage)
    nick.js           čistenie prezývky a filter vulgarizmov
    leaderboard.js    rebríček — lokálne alebo Supabase, podľa config.js
    config.js         adresa a kľúč Supabase (prázdne = lokálny rebríček)
levels/               JSON, index.json je zoznam
server/
  dev_server.py       vývojový server bez cache
  supabase.sql        tabuľka a funkcia rebríčka
  README.md           návod na nastavenie Supabase
assets/icon.svg       značka: labka poskladaná z dlaždíc bludiska
tests/index.html      testy v prehliadači
```

### Nový level

Stačí JSON súbor v `levels/world<N>/` a riadok v `levels/index.json`.

Pozor pri leveloch s ohňom: v absolútnom režime sa pes otáča iba pohybom, takže
oheň musí ležať na konci rovného úseku a mať pred sebou voľné políčko, na ktorom
sa dá zastaviť a namieriť hadicu. Podrobnosti v `docs/ARCHITECTURE.md`.

Ak má level vyplnené `solutions`, testy automaticky overia, že je riešiteľný,
že limit riadkov sedí na optimálne riešenie a že sa dajú pozbierať všetky kosti.
Level typu `predict` namiesto toho potrebuje `preset` (hotový plán pre oba režimy)
a cieľ `{"type": "predict", "answer": {"x": …, "y": …}}`; testy overia, že oba
plány skončia presne na tom políčku.

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

Databázová časť sa **nenasadzuje pushom** — viď upozornenie pri rebríčku vyššie.

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

- 🚫 žiadne reklamy, žiadne nákupy, žiadne účty, žiadne prihlasovanie
- 📴 postup v `localStorage`; do rebríčka odíde len prezývka a body, a len keď to
  hráč sám urobí
- ⏱️ žiadne časomiery a žiadny stres — dieťa má na premýšľanie neobmedzený čas
- ❌ chyba nie je prehra, iba chybové hlásenie s miestom chyby
- 🚫 žiadne body za rýchlosť ani za počet pokusov
- 🎨 vlastné originálne postavičky (viď nižšie)

## Kľúčové rozhodnutia

| Rozhodnutie | Kde je zdôvodnené |
|---|---|
| Vlastné postavičky namiesto Labkovej patroly (ochranná známka Spin Master) | [DESIGN §9](docs/DESIGN.md#pravna-poznamka) |
| Každá postavička = jeden koncept informatiky | [DESIGN §3](docs/DESIGN.md) |
| Jeden riadok = jeden krok, príkazy nemajú počet opakovaní | [DESIGN §2](docs/DESIGN.md) |
| Statická hra bez backendu; React + FastAPI + PostgreSQL až na „Dielňu“ | [ADR-001](docs/ADR-001-stack.md) |
| Body odmeňujú premýšľanie, nie rýchlosť | [DESIGN §6b](docs/DESIGN.md) |
| Predpoveď sa vyhodnotí až keď plán dobehne, nie prechodom cez políčko | `world.goalsMet(atEnd)` |
| Do rebríčka sa posiela prírastok, nie celý súčet | `progress.pendingPoints()` |
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
| [server/README.md](server/README.md) | Nastavenie globálneho rebríčka na Supabase |

## Známe obmedzenia

- Fonty sa ťahajú z Google Fonts → bez internetu sa použije systémový záložný font.
  Pred PWA ich treba self-hostovať.
- Ikona je zatiaľ len SVG. Na inštaláciu PWA na tablet budú treba aj PNG veľkosti.
- `Použi` mieri vždy dopredu; v absolútnom režime teda tam, kam pes naposledy kráčal,
  a nie je to na mape vidno.
- Číslovanie levelov má dieru — chýba 1.6 („Oprav chybu“), ten typ ešte nie je
  naprogramovaný.
- Hra sa ovláda myšou a dotykom; klávesnicou zatiaľ len čiastočne.
- Body sa **neoverujú** — klient si vie poslať ľubovoľné číslo. Strop viazaný na
  počet levelov bol zrušený, lebo sa pri každom novom leveli zabudol zvýšiť
  a poctivému hráčovi potom zápis tíško padol; ostala len poistka proti absurditám.
- Bezplatný projekt Supabase sa po týždni nečinnosti uspí a rebríček dovtedy
  neodpovedá, kým ho v konzole neprebudíš.

## Licencia

Kód: MIT (`LICENSE`). Grafika a zvuky: vlastná tvorba, licencia sa doplní pri prvých assetoch.
