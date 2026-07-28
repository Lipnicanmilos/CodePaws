# Kódolabky — technický návrh

## 1. Princípy

- **Bez build stepu.** ES moduly natívne v prehliadači, nasadenie na GitHub Pages
  bez čohokoľvek ďalšieho. (Na tomto stroji nie je Node — návrh s tým počíta.)
  **Pozor:** ES moduly a `fetch` nefungujú cez `file://`, takže dvojklik na
  `index.html` nestačí — treba statický server (`python -m http.server`).
  Pre offline hru na tablete to nevadí: PWA sa inštaluje z `https://`.
- **Bez závislostí.** Žiadny React, žiadny Phaser. Hra je mriežka — DOM a CSS grid
  na to stačia a sú prístupné z klávesnice zadarmo.
- **Engine je čistá funkcia.** Simulácia nevie nič o DOM. Dá sa testovať a je
  deterministická → to isté zadanie dá vždy ten istý výsledok.
- **Levely sú dáta.** Nový level = jeden JSON súbor, žiadny kód.

## 2. Štruktúra repozitára

```
index.html            # jediná stránka
styles/
  base.css            # premenné, typografia, farby
  board.css           # bludisko
  table.css           # tabuľka príkazov („databáza“)
src/
  engine/
    level.js          # načítanie + validácia levelu
    world.js          # mriežka, dlaždice, objekty, kolízie
    program.js        # model tabuľky: riadky, vnáranie, validácia
    vm.js             # interpret: step() → udalosť
    rng.js            # seedovaný generátor (náhodné bludiská, replikovateľné)
  ui/
    board.js          # vykreslenie mriežky a postavičiek
    table.js          # tabuľka príkazov, kurzor, drag & drop
    palette.js        # paleta dostupných príkazov
    hud.js            # ▶ Štart / ⏭ Krok / ⟲ Reset, rýchlosť, panel Stav
    speech.js         # hlasové čítanie príkazov (Web Speech API, sk-SK)
  game/
    progress.js       # localStorage: kosti, odomknuté svety, nastavenia
    router.js         # mapa misií ↔ level ↔ editor, stav v URL hash
    editor.js         # Staviteľ + zabalenie levelu do odkazu
  i18n/
    sk.json           # všetky texty (neskôr en.json, de.json)
levels/
  world1/*.json
assets/
  sprites/ sounds/
tests/
  index.html          # testy enginu bežia v prehliadači (netreba Node)
docs/
```

## 3. Formát levelu

```jsonc
{
  "id": "1.5",
  "title": "Kde skončím?",
  "world": 1,
  "type": "predict",          // path | limit | debug | gaps | predict | mirror | duo | build
  "mode": "absolute",         // absolute (šípky) | relative (vpred + otáčanie)
  "grid": {
    "legend": {
      ".": "empty", "#": "wall", "o": "bone", "f": "fire",
      "b": "box",   "p": "plate", "d": "door", "g": "goal", "~": "void"
    },
    "rows": [
      "######",
      "#....#",
      "#.##o#",
      "#...g#",
      "######"
    ]
  },
  "actors": [
    { "id": "a1", "char": "fifo", "x": 1, "y": 1, "dir": "E" }
  ],
  "goals": [
    { "type": "reach", "actor": "a1", "tile": "goal" }
  ],
  "palette": ["move", "turnLeft", "turnRight", "use"],
  "limits": { "rows": 6, "steps": 200 },
  "stars": [
    { "id": "finish" },
    { "id": "rows",  "max": 4 },
    { "id": "bones", "all": true }
  ],
  "preset": [                  // predvyplnená tabuľka (typy debug / gaps / predict)
    { "cmd": "move", "n": 2 },
    { "cmd": "turnRight" },
    { "cmd": "move", "n": 3, "locked": true }
  ],
  "hint": "Skús najprv spočítať políčka očami."
}
```

Poznámky:
- `rows` ako polia reťazcov sú zámerné — level sa dá napísať a prečítať ručne
  v textovom editore.
- `type: "mirror"` má viacero `variants` so štartovnými pozíciami; program musí
  prejsť **všetky**.
- Náhodné bludiská (3.7): `"generator": { "kind": "maze", "seed": null }` —
  `seed: null` = pri každom spustení iný, ale replikovateľný pre reklamáciu chyby.

## 4. Model programu (tabuľka)

**Jeden riadok = jeden krok.** Bežné príkazy nemajú počet opakovaní (dôvod je
v [DESIGN](DESIGN.md#jeden-riadok--jeden-krok)). Interpret pole `n` napriek tomu
podporuje — je to základ pre `Opakuj n×`, ktorý ho ako jediný bude používať.

Program je **strom riadkov**, nie plochý zoznam — `Opakuj` a `Ak` majú deti,
v tabuľke sa to zobrazí ako odsadenie s farebnou lištou vľavo:

```js
[
  { id: "r1", cmd: "move" },
  { id: "r2", cmd: "move" },
  { id: "r3", cmd: "repeat", n: 4, body: [
      { id: "r4", cmd: "move" },
      { id: "r5", cmd: "turnRight" }
  ]},
  { id: "r6", cmd: "if", cond: "wallAhead", body: [...], else: [...] },
  { id: "r7", cmd: "call", trick: "t1" }
]
```

V JSON leveloch sa referenčné riešenia píšu krátko cez `{cmd, n}` a pred
použitím sa rozbalia funkciou `expandRows()` — inak by boli súbory neúnosne dlhé.

Sada príkazov (rastie podľa `palette` levelu):

| `cmd` | Zobrazenie | Kto ho prináša |
|---|---|---|
| `move` | ↑ Vpred | Fifo |
| `turnLeft` / `turnRight` | ↺ / ↻ | Fifo (režim relative) |
| `north/south/east/west` | ↑ ↓ ← → | Fifo (režim absolute) |
| `use` | 🔥 Použi | Fifo |
| `repeat` | 🔁 Opakuj n× | Bit |
| `if` / `else` | ❓ Ak … inak | Ajka |
| `call` | 🧭 Trik 1 | Luna |
| `push` | 🏗️ Tlač | Rex |
| `counter` | 🧮 Počítadlo ±1 | Cent |
| `while` | 🔁 Opakuj kým… | Cent |
| `wait` | ⏳ Čakaj | Svet 7 |

Podmienky (`cond`): `wallAhead`, `boneHere`, `fireAhead`, `doorAhead`,
`counterLess:n`, `atGoal`.

### Pravidlo pre tvorbu levelov: `Použi` mieri dopredu
`use` pôsobí vždy na políčko, na ktoré sa pes práve pozerá. V **absolútnom režime**
sa ale pes nedá otočiť bez toho, aby sa pohol — pozerá tam, kam naposledy kráčal.
**Level s ohňom naň preto musí viesť čelne:** posledný krok pred ohňom musí smerovať
naň. Level `1.7 Horí!` je postavený presne takto a testy to strážia v oboch režimoch.
(Alternatívou by boli štyri smerové varianty `Použi`, čo by zbytočne nafúklo paletu.)

## 5. Virtuálny stroj

```js
const vm = new VM(world, programs);   // programs: { a1: [...], a2: [...] }

while (!vm.done) {
  const events = vm.step();           // JEDEN takt = jeden krok každého psa
  renderer.play(events);              // UI len prehráva, nič nepočíta
}
```

- `step()` vykoná **práve jednu primitívnu akciu** na aktéra a vráti pole udalostí:
  `{type:"enter", actor, row}`, `{type:"move", from, to}`, `{type:"blocked", row}`,
  `{type:"collect", item}`, `{type:"push", box}`, `{type:"win"}`,
  `{type:"error", code:"infiniteLoop", row}`.
- Vnútri je zásobník rámcov (`repeat` počítadlo, `call` návratová adresa) — presne
  tak, ako to robí skutočný interpret. Vďaka tomu je krokovanie zadarmo.
- `move ×3` sa rozloží na tri takty, aby animácia bola po políčkach a kurzor
  v tabuľke stál na tom istom riadku — dieťa vidí, že jeden riadok môže trvať dlhšie.
- Ochrana: `limits.steps` (default 200) → `infiniteLoop`, hra to vysvetlí
  („Bit sa zacyklil! Pozri sa na riadok 3.“).
- UI je len prehrávač udalostí → **replay, duch predchádzajúceho riešenia a undo
  sú zadarmo** (stačí uložiť zoznam udalostí).

## 6. Vykreslenie

- Bludisko = CSS grid, jedna `<div>` na dlaždicu, aktéri absolútne polohovaní,
  pohyb cez `transform: translate()` + `transition` (~250 ms, konfigurovateľné).
- Postavičky ako SVG alebo sprite sheet; idle animácia cez CSS.
- Rýchlosť: 🐢 / 🐇 / ⏭ krok. Nastavenie sa pamätá.
- `prefers-reduced-motion` → skoky bez animácie.
- Kontrast a farbosleposť: každý typ dlaždice má aj tvar/ikonu, nielen farbu.

## 7. Ukladanie a zdieľanie

- `localStorage["codepaws.progress"]` — kosti, odomknuté, nastavenia, verzia schémy.
- Nič sa neposiela na server. Export/import postupu ako súbor (pre rodiča).
- Vlastný level: JSON → deflate → base64url → `index.html#l=…`. Nula infraštruktúry.

## 8. Testovanie bez Node

`tests/index.html` importuje engine a spustí sadu tvrdení priamo v prehliadači
(zelená/červená tabuľka výsledkov). Testujú sa:

- interpret: každý príkaz, vnorené cykly, návraty z `call`, ochrana proti zacykleniu
- svet: kolízie, tlačenie debien, dvere a tlačidlá
- levely: každý JSON sa zvaliduje a **overí sa, že referenčné riešenie zo súboru
  level naozaj vyrieši** (chráni pred neriešiteľným levelom po úprave mapy)

Keď na stroji pribudne Node, tie isté moduly sa dajú spustiť cez `node --test`
bez zmeny kódu.

## 9. Nasadenie

GitHub Pages z vetvy `main`, priečinok `/` (root). Neskôr `manifest.json`
+ service worker → PWA, inštalovateľná na tablet, funguje offline.
Pri každej zmene v `styles/` alebo `src/` treba bumpnúť verziu cache v SW.
