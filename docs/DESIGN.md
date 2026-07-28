# Kódolabky — herný a pedagogický návrh

## 1. Prečo vôbec ďalšia „hra na programovanie“

Existuje Code.org, Lightbot, ScratchJr, Box Island. Väčšina z nich učí **skladanie
príkazov**. Skoro žiadna neučí to, čo je v skutočnosti ťažké a čo si programátor nesie
celý život:

1. **Predvídať** — čo môj plán urobí *predtým*, než ho spustím.
2. **Nájsť chybu** — keď to nedopadlo, ktorý riadok za to môže.
3. **Zovšeobecniť** — napísať plán, ktorý funguje aj pre inú situáciu.

Kódolabky sú postavené presne okolo týchto troch vecí. Preto sú v hre typy levelov
„Predpoveď“, „Oprav chybu“ a „Zrkadlo“ (viď §5) — a preto je program **tabuľka
s očíslovanými riadkami a kurzorom**, a nie farebné bloky, ktoré sa len zacvaknú.

## 2. Základná slučka hry

```
 ┌─────────────────────────────┬──────────────────────────┐
 │                             │  #  PRÍKAZ               │
 │        B L U D I S K O      │  1  ↑ Vpred              │
 │        (mriežka 6×6…12×12)  │  2  ↑ Vpred              │
 │                             │▶ 3  ↻ Vpravo             │ ← kurzor ukazuje
 │        🐶 → → → 🎯          │  4  ↑ Vpred              │   práve bežiaci riadok
 │                             │  5  🔥 Použi             │
 │                             ├──────────────────────────┤
 │                             │  ▶ Štart  ⏭ Krok  ⟲ Znova│
 └─────────────────────────────┴──────────────────────────┘
```

1. Dieťa vidí bludisko: štart šteniatka, cieľ misie, prekážky, kosti (bonus).
2. Do tabuľky vpravo skladá príkazy — klikom na paletu alebo ťahaním.
3. **▶ Štart** = program beží riadok po riadku, šteniatko sa hýbe po jednom kroku,
   aktívny riadok tabuľky svieti.
4. Ak to nevyjde: **⟲ Reset**, oprav riadok, skús znova. Žiadny trest, žiadne životy.
5. **⏭ Krok** = ladenie. Dieťa si samo posúva program po jednom riadku a pozerá,
   čo sa deje. (Toto je v skutočnosti debugger — a deti ho milujú.)

### Tabuľka ako „databáza“
Tabuľka je zámerne štylizovaná ako záznamník / databáza misie: očíslované riadky,
možnosť riadok vložiť, zmazať, presunúť. Dieťa si tak prirodzene osvojí, že
**program je uložený zoznam inštrukcií, ktorý sa vykonáva zhora nadol** — a že poradie
riadkov je to, na čom všetko stojí. Pod tabuľkou je malý panel **Stav** (kde stojím,
kam pozerám, koľko mám kostí) — čo je vlastne watch okno.

### Jeden riadok = jeden krok
Príkazy zámerne **nemajú počet opakovaní**. „Choď trikrát hore“ sa napíše ako tri
riadky, nie ako jeden riadok s číslom 3. Sú na to dva dôvody:

1. **Pravidlo je bez výnimky.** Kurzor sa posunie o riadok, pes sa pohne o políčko.
   Šesťročné dieťa to pochopí na prvý raz a nemusí rozlišovať, ktoré príkazy
   počet majú a ktoré nie.
2. **Robí to miesto pre cyklus.** Keď je plán v Svete 1 zdĺhavý, `Opakuj n×`
   v Svete 2 je úľava, ktorú si dieťa naozaj odžije. Keby počet mali príkazy od
   začiatku, cyklus by bol len iný zápis toho istého a aha-moment by sa nekonal.

Interpret viactaktový riadok vie (`{cmd, n}`) — je to základ pre `Opakuj`. Do
tabuľky sa taký riadok zatiaľ nedá vložiť.

## 3. Postavičky — každá labka = jeden koncept informatiky

Toto je nosná myšlienka celého dizajnu: **nová postavička sa neodomkne ako odmena,
ale preto, že prináša novú programátorskú schopnosť.** Dieťa nezbiera skiny, zbiera
koncepty.

| Šteniatko | Povolanie | Prináša do tabuľky | Koncept |
|---|---|---|---|
| **Fifo** 🚒 | hasič, žltý labrador | `Vpred`, `Vľavo`, `Vpravo`, `Použi` | sekvencia, akcia |
| **Bit** 🔧 | technik, malý teriér | `Opakuj N×` (blok riadkov) | cyklus |
| **Ajka** 🔭 | prieskumníčka, border kólia | `Ak je predo mnou stena…` | podmienka, senzor |
| **Luna** 🧭 | navigátorka, husky | `Trik 1` = vlastná mini-tabuľka | funkcia, abstrakcia |
| **Rex** 🏗️ | silák, bernardín | `Tlač debnu`, tlačidlá a dvere | stav sveta, vedľajší účinok |
| **Cent** 🧮 | počtár, jazvečík | `Počítadlo +1`, `Opakuj kým…` | premenná, podmienený cyklus |

Vo vyšších leveloch sa dá poslať **viac šteniatok naraz** — každé s vlastnou tabuľkou,
bežia súbežne, musia si otvárať dvere a nezraziť sa. To je čistá synchronizácia
a plánovanie, a zároveň najzábavnejšia časť hry.

> **Pomenovanie:** mená sú krátke, dvojslabičné, ľahko vysloviteľné pre päťročné dieťa,
> a „Fifo“ / „Bit“ / „Cent“ sú zároveň milé programátorské vtipy pre rodiča.

## 4. Ovládanie pohybu — dva režimy

Absolútny vs. relatívny pohyb je najväčšia pasca v hrách tohto typu.

- **Režim Šteniatko (5–6 r.):** `↑ ↓ ← →` — dieťa klikne smer, pes tam ide. Žiadne
  otáčanie, žiadne premýšľanie „kde má pes ľavú stranu“.
- **Režim Záchranár (7+):** `Vpred`, `Otoč vľavo`, `Otoč vpravo` — pes má hlavu a smer.
  Toto je ťažšie (vyžaduje zmenu perspektívy), ale je to skutočná robotika.

Prepnutie je v nastaveniach a hra ho aj sama **ponúkne** na konci Sveta 1
(„Chceš skúsiť, keď sa Fifo bude otáčať sám?“). Nikdy sa nevnucuje.

## 5. Typy levelov — variabilita je to, čo drží pozornosť

Sedem svetov po ~12 levelov s jedinou úlohou „dojdi do cieľa“ deti unudí do smrti.
Preto sa striedajú:

| Typ | Zadanie | Čo trénuje |
|---|---|---|
| **A. Cesta** | Naprogramuj cestu do cieľa | sekvencia |
| **B. Úsporná misia** | Zmestíš sa do 6 riadkov? | optimalizácia, cykly |
| **C. Oprav chybu** 🐞 | Tabuľka je predvyplnená, jeden riadok je zlý | ladenie, analýza |
| **D. Doplň medzeru** | Program s dierami, doplň chýbajúce riadky | čítanie cudzieho kódu |
| **E. Predpoveď** 🔮 | Program je hotový, klikni na políčko kde pes skončí | mentálna simulácia |
| **F. Zrkadlo** 🪞 | Ten istý program musí prejsť **dva rôzne štarty** | zovšeobecnenie |
| **G. Duo misia** 👯 | Dva psy, dve tabuľky, bežia naraz | súbeh, plánovanie |
| **H. Staviteľ** 🛠️ | Postav vlastný level a daj ho kamarátovi | tvorivosť |

**Typ E (Predpoveď) je tajná zbraň.** Dieťa najprv označí, kde podľa neho pes skončí,
až potom sa program spustí. Za správnu predpoveď je zvláštna pečiatka „Jasnovidec“.
Presne toto premení klikanie na premýšľanie — a nedá sa to obísť metódou pokus-omyl.

**Typ F (Zrkadlo)** je zase jediný spôsob, ako dieťa pochopí, načo sú podmienky:
keď jeden pevný zoznam krokov proste nemôže vyriešiť obe situácie naraz.

## 6. Hodnotenie — tri kosti namiesto hviezdičiek

Každý level má tri odmeny:

- 🦴 **prvá kosť** — misia splnená (dôjdeš do cieľa)
- 🦴 **druhá kosť** — program má najviac N riadkov (nabáda na cykly a triky)
- 🦴 **tretia kosť** — pozbierané všetky kosti na mape

Dôležité: **prvú kosť dostane každý.** Druhá a tretia sú pozvánka vrátiť sa
a program vylepšiť — čo je refaktoring, len sa to tak nevolá. Nikdy nie je nič
zamknuté za tri kosti; ďalší level sa otvorí vždy po prvej.

## 7. Čo hru robí príťažlivou (kontrolný zoznam)

**Okamžitá odozva.** Kliknem príkaz → pes sa hýbe do 300 ms. Žiadne načítavanie, žiadne
potvrdzovacie okná.

**Šteniatka, ktoré reagujú.** Idle animácie (krúti chvostom, zíva), zvuk labiek,
zmätený štekot pri náraze do steny, oslavný skok v cieli. 80 % pocitu z hry je
v týchto detailoch, nie v mechanike.

**Chyba nie je prehra.** Náraz do steny = pes zavrtí hlavou, riadok v tabuľke sa
červeno podfarbí — a hneď vidno **ktorý riadok** za to môže. Žiadny „Game Over“.

**Hrateľné bez čítania.** Každý príkaz má ikonu; kliknutie na riadok ho nahlas
prečíta (Web Speech API, `sk-SK`). Šesťročné dieťa hru zvládne samo.

**Príbeh po kvapkách.** Krátka scénka pred svetom („V parku sa stratilo mača!“),
mapa misií s pečiatkami. Žiadne dlhé dialógy.

**Duchovia predchádzajúcich riešení.** Pri opakovaní levelu beží polopriehľadný
duch minulého riešenia — vidno, o koľko je nové lepšie.

**Zdieľanie bez servera.** Vlastný level sa zabalí do odkazu (`#level=…`), pošle sa
kamarátovi cez správu. Nula infraštruktúry, nula registrácií.

**Kartičky na stôl.** Tlačiteľné PDF s príkazovými kartičkami, aby sa dala tá istá
hra hrať na koberci s plyšovým psom. Učitelia a rodičia toto veľmi oceňujú a je to
najlacnejší marketing, aký existuje.

**Rodičovský/učiteľský režim.** Jedna obrazovka: ktoré koncepty už dieťa zvládlo
a kde sa zaseklo. Žiadne skóre, žiadne porovnávanie s inými deťmi.

## 8. Čomu sa vyhnúť

- ❌ časomiery, srdiečka, energiu, denné odmeny — vytvárajú stres, nie premýšľanie
- ❌ mikrotransakcie a reklamy v hre pre päťročné deti
- ❌ ukladanie čohokoľvek o dieťati na server (GDPR + zdravý rozum)
- ❌ skokovú obtiažnosť — každý level pridáva **práve jednu** novú vec
- ❌ text ako jediný nosič informácie
- ❌ trestanie za pokus-omyl — len ho robiť menej výhodným než premýšľanie (typ E a B)

<a id="pravna-poznamka"></a>
## 9. Právna poznámka k postavičkám

Pôvodná predstava bola použiť postavičky **Labkovej patroly**. Tie sú chránená ochranná
známka spoločnosti Spin Master a nesmú sa použiť vo verejnom repozitári ani v hre,
ktorá by sa zverejnila — ani pri neziskovom použití. Preto má hra **vlastnú šesticu
záchranárskych šteniatok** (§3) s vlastnými menami, farbami a povolaniami.

Zachovaná je tá istá emócia: parta pomenovaných šteniatok, každé má svoju úlohu,
každé má svoje vozidlo a spolu chodia na misie. Vlastné postavičky navyše znamenajú,
že hra sa dá zverejniť, zdieľať, dať do školy — a keby raz mala byť platená, aj to.

## 10. Cieľová skupina a jazyk

- **Primárne 5–8 rokov** (režim Šteniatko), **8–10 rokov** (režim Záchranár + svety 4–7)
- Jazyk UI: **slovenčina**; v kóde a v JSON sú kľúče anglicky, texty v `i18n/sk.json`,
  takže neskôr pribudne EN/DE bez zásahu do logiky
- Ovládanie: myš, dotyk (tablet je hlavné zariadenie), klávesnica ako alternatíva
