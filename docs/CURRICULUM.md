# Kódolabky — mapa konceptov

Pravidlo, ktoré sa nesmie porušiť: **jeden level = najviac jedna nová vec.**
Nový príkaz sa vždy najprv predvedie v triviálnom leveli, kde sa nedá spraviť chyba,
a až potom sa kombinuje s tým, čo dieťa už vie.

## Rytmus svetov

Prvé štyri svety idú po desiatich leveloch a držia sa jedného tvaru:

| pozícia | typ | prečo |
|---|---|---|
| x.1 – x.4 | **A. Cesta** | nová vec sa zavedie a natrénuje |
| x.5 | **E. Predpoveď** 🔮 | polčas — vieš povedať, kam pes dôjde, bez spustenia? |
| x.6 – x.9 | **A. Cesta** | to isté, ale ťažšie a dlhšie |
| x.10 | **C. Oprav chybu** 🐞 | záverečná skúška — prečítaj cudzí plán a nájdi v ňom chybu |

Dôvod: rebrík má byť zreteľný (jedna mechanika na svet), ale desať kôl toho istého
druhu za sebou deti unudí. Piaty a desiaty level preto ten rad vždy preruší
a zároveň sú to jediné dva typy, ktoré nemerajú klikanie, ale premýšľanie.

## Svet 1 · Dvor — *Fifo* 🚒 · sekvencia

| # | Level | Typ | Nová vec |
|---|---|---|---|
| 1.1 | Prvý krok | A | `Vpred`, tlačidlo ▶ Štart |
| 1.2 | Zákruta | A | zmena smeru |
| 1.3 | Pozor, stena! | A | náraz = pes sa zastaví a ukáže zlý riadok |
| 1.4 | Kosť navyše | A | zbieranie kostí (3 kosti) |
| 1.5 | Kde skončím? | **E** | predpoveď — dieťa len číta program |
| 1.6 | Kľukatá cesta | A | tri zmeny smeru v jednej chodbe |
| 1.7 | Krok za krokom | A | tlačidlo ⏭ Krok (ladenie po riadkoch) |
| 1.8 | Dlhá cesta | A | 16 riadkov — *zámerne otravné*, pripravuje cyklus |
| 1.9 | Misia dvor | A | obehni dvor, búdka je v strede |
| 1.10 | Zlý riadok | **C** | ladenie — jeden riadok vedie psa do steny |

Svet 1 zámerne **nemá oheň**: jediné, čo sa v ňom dá, je chodiť a zbierať kosti.
Vďaka tomu je `Použi` v Svete 2 naozaj nová vec, a nie siedma z desiatich.

## Svet 2 · Požiarny dvor — *Fifo* 🚒 · hadica

Prvý naozaj nový **príkaz**. `Použi` nehýbe psom — pôsobí na políčko, na ktoré sa
práve pozerá. To je celý svet: naučiť sa, že príkaz môže meniť mapu, nie len polohu.

> **Návrhové pravidlo sveta 2:** v absolútnom režime sa pes otáča *iba pohybom*,
> takže na oheň sa nedá namieriť inak než prísť k nemu rovno. Oheň preto musí vždy
> ležať na konci rovného úseku, ktorý má pred sebou aspoň jedno voľné políčko.
> Oheň hneď za zákrutou je neriešiteľný — a mapa sa len ticho zasekne.

| # | Level | Typ | Nová vec |
|---|---|---|---|
| 2.1 | Horí! | A | `Použi` — hadica hasí políčko pred psom |
| 2.2 | Dva ohne | A | hadica sa dá použiť viackrát |
| 2.3 | Kosť za ohňom | A | slepá ulička — treba sa vrátiť tou istou cestou |
| 2.4 | Ohnivá križovatka | A | oheň je jediná cesta, obísť sa nedá |
| 2.5 | Uhasí to? | **E** | predpoveď — hadica krok neposunie |
| 2.6 | Tri ohne | A | rovnaká trojica riadkov trikrát za sebou |
| 2.7 | Obchádzka | A | cez oheň 5 riadkov, okolo 8 a bez kostí — *rozhodnutie* |
| 2.8 | Dlhý zásah | A | 22 riadkov, tri opakované úseky — druhá príprava na cyklus |
| 2.9 | Veľký požiar | A | obvod dvora, búdka v strede |
| 2.10 | Zabudnutá hadica | **C** | ladenie — namiesto `Použi` je tam krok navyše |

## Svet 3 · Veža — čítanie programu

Žiadny nový príkaz. Celý svet je o tom, čo sa doteraz objavovalo len dvakrát za svet:
**prečítať program bez toho, aby bežal.** Prvá polovica sa pýta „kam dôjde“,
druhá „kde je chyba“. Náročnosť rastie dĺžkou plánu, nie novou mechanikou.

| # | Level | Typ | Nová vec |
|---|---|---|---|
| 3.1 | Kam dôjde? | **E** | prázdny dvor — nič neprekáža, ráta sa len počítanie políčok |
| 3.2 | Tam a späť | **E** | program sa vracia; koniec nie je na kraji |
| 3.3 | Hadica nekráča | **E** | `Použi` v pláne — riadok, ktorý neposúva |
| 3.4 | Okolo dokola | **E** | okruh takmer celý, ale nie celý |
| 3.5 | Dva ohne v hlave | **E** | dve hadice a zákruta na konci |
| 3.6 | Kam to zabočil? | **C** | zlý riadok = zabočenie na opačnú stranu |
| 3.7 | Opačná strana | **C** | to isté v dlhšom pláne |
| 3.8 | Chýba hadica | **C** | namiesto `Použi` je krok → pes vbehne do ohňa |
| 3.9 | Dva ohne, jedna chyba | **C** | prvá hadica je správne, druhá chýba — porovnávanie |
| 3.10 | Zastal inde | **C** | **nič nenarazí** — plán len dobehne a pes stojí inde |

> Level 3.10 je vrchol sveta: chyba sa neprejaví nárazom ani červeným riadkom.
> Dieťa musí porovnať, čo plán *robí*, s tým, čo *má robiť* — a to je presne to,
> čo robí programátor pri hľadaní chyby.

## Svet 4 · Majstrovstvo — dva typy naraz *(pripravuje sa)*

Každý level spája dve veci, ktoré sa doteraz cvičili oddelene: Predpoveď na mape
s ohňom, Oprava, kde chýbajúci riadok treba najprv *predpovedať*, dlhé misie
s viacerými ohňami aj kosťami naraz.

## Svet 5 · Park — *Bit* 🔧 · cyklus

| # | Level | Typ | Nová vec |
|---|---|---|---|
| 5.1 | Bitov trik | A | `Opakuj N×` nad jedným riadkom — päť riadkov sa zmestí do dvoch |
| 5.2 | Šesť riadkov | **B** | limit riadkov núti použiť opakovanie |
| 5.3 | Opakuj blok | A | `Opakuj N×` cez viac riadkov (odsadenie v tabuľke) |
| 5.4 | Štvorec | A | klasika: 4× (vpred, otoč) |
| 5.5 | Koľko kôl? | **E** | predpoveď s cyklom |
| 5.6 | Cyklus v cykle | A | vnorený `Opakuj` |
| 5.7 | O jeden viac | **C** | ladenie chyby „o jedna vedľa“ |
| 5.8 | Skrátiť! | **B** | ten istý level ako 1.8, ale na 4 riadky |
| 5.9 | Hasič v cykle | **B** | 2.8 znova — tri opakované úseky v jednom bloku |

## Svet 6 · Les — *Ajka* 🔭 · podmienka a senzor

| # | Level | Typ | Nová vec |
|---|---|---|---|
| 6.1 | Ajka sa pozerá | A | `Ak je predo mnou stena → otoč` |
| 6.2 | Dva štarty | **F** | jeden program, dva rôzne štarty — bez podmienky sa nedá |
| 6.3 | Ak vidíš kosť | A | senzor na políčko pod labkami |
| 6.4 | Ak horí | A | senzor na oheň — hadica len keď treba |
| 6.5 | Inak | A | vetva `inak` |
| 6.6 | Hmla | **E** | predpoveď s podmienkou (mapa je čiastočne skrytá) |
| 6.7 | Sleduj stenu | A | `Opakuj kým nie si v cieli` + podmienka = pravidlo pravej ruky |
| 6.8 | Náhodné bludisko | A | mapa sa pri každom spustení mení → **musí** byť univerzálny program |

> Level 6.8 je vrchol prvej polovice hry: dieťa prvýkrát napíše program, ktorý rieši
> **triedu úloh**, nie jednu konkrétnu mapu. To je moment, keď sa z klikania stáva
> programovanie.

## Svet 7 · Prístav — *Luna* 🧭 · funkcia

| # | Level | Typ | Nová vec |
|---|---|---|---|
| 7.1 | Lunin trik | A | druhá malá tabuľka `Trik 1`, volanie z hlavnej |
| 7.2 | Trikrát ten istý trik | **B** | opakované volanie = úspora riadkov |
| 7.3 | Trik v triku | A | `Trik 1` volá `Trik 2` |
| 7.4 | Pomenuj to | A | premenovanie triku (`Obehni strom`) → čitateľnosť |
| 7.5 | Rozbitý trik | **C** | chyba je v triku, nie v hlavnej tabuľke |
| 7.6 | Veľká výprava | **B** | 40-krokové riešenie na 8 riadkoch |

## Svet 8 · Stavenisko — *Rex* 🏗️ · stav sveta

| # | Level | Typ | Nová vec |
|---|---|---|---|
| 8.1 | Zatlač debnu | A | `Tlač` — svet sa mení, nie iba pes |
| 8.2 | Tlačidlo a dvere | A | debna na tlačidle drží dvere otvorené |
| 8.3 | Späť sa nedá | **E** | predpoveď — nezvratný ťah (Sokoban logika) |
| 8.4 | Poriadok krokov | A | záleží na poradí — ten istý plán v inom poradí zlyhá |
| 8.5 | Stavbárska misia | A | zhrnutie |

## Svet 9 · Sklad — *Cent* 🧮 · premenná

| # | Level | Typ | Nová vec |
|---|---|---|---|
| 9.1 | Počítadlo | A | `Počítadlo +1` pri každej kosti, panel Stav ho ukazuje |
| 9.2 | Toľkokrát | A | `Vpred ×(počítadlo)` — premenná ako argument |
| 9.3 | Kým nemáš 5 | A | `Opakuj kým počítadlo < 5` |
| 9.4 | Nekonečno | **C** | zacyklený program — hra ho po 200 krokoch zastaví a vysvetlí |
| 9.5 | Presne toľko | **B** | zaviezť presne toľko debien, koľko je značiek |

## Svet 10 · Spoločná misia — všetci 👯 · súbeh

| # | Level | Typ | Nová vec |
|---|---|---|---|
| 10.1 | Dvaja naraz | **G** | dve tabuľky, dva psy, jeden takt |
| 10.2 | Otvor mi | **G** | Rex drží tlačidlo, Fifo prebehne |
| 10.3 | Nezraz sa | **G** | zrážka = obaja sa zastavia → treba čakanie |
| 10.4 | Počkaj na mňa | **G** | príkaz `Čakaj` = synchronizácia |
| 10.5 | Veľká záchrana | **G** | finále: traja psi, všetky koncepty |

## Bonus · Staviteľ 🛠️

Editor levelov: mriežka, štetec na steny/kosti/oheň/debny, výber psov, limit riadkov.
Level sa zabalí do odkazu a pošle kamarátovi. Žiadny server, žiadne účty.

---

## Prehľad: čo sa dieťa naozaj naučí

| Herný pojem | Informatický pojem |
|---|---|
| tabuľka riadkov | program, sekvencia inštrukcií |
| kurzor ▶ v tabuľke | programový čítač (program counter) |
| tlačidlo ⏭ Krok | ladenie krokovaním |
| červený riadok pri náraze | chybové hlásenie s miestom chyby |
| hadica `Použi` | príkaz s vedľajším účinkom — mení mapu, nie polohu |
| `Opakuj N×` | cyklus s počítadlom |
| `Opakuj kým…` | cyklus s podmienkou |
| `Ak … inak` | vetvenie |
| `Trik` | funkcia / procedúra, abstrakcia |
| panel Stav | premenné, stav programu |
| debny a dvere | stav sveta, vedľajší účinok |
| dva psy naraz | súbežnosť, synchronizácia |
| náhodné bludisko (6.8) | všeobecný algoritmus namiesto konkrétneho riešenia |
| limit riadkov | optimalizácia, refaktoring |
| typ levelu „Predpoveď“ | mentálna simulácia, analýza kódu |
| typ levelu „Oprav chybu“ | ladenie, čítanie cudzieho kódu |
