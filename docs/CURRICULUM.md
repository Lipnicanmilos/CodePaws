# Kódolabky — mapa konceptov

Pravidlo, ktoré sa nesmie porušiť: **jeden level = najviac jedna nová vec.**
Nový príkaz sa vždy najprv predvedie v triviálnom leveli, kde sa nedá spraviť chyba,
a až potom sa kombinuje s tým, čo dieťa už vie.

## Svet 1 · Dvor — *Fifo* 🚒 · sekvencia

| # | Level | Typ | Nová vec |
|---|---|---|---|
| 1.1 | Prvý krok | A | `Vpred`, tlačidlo ▶ Štart |
| 1.2 | Zákruta | A | zmena smeru |
| 1.3 | Pozor, stena! | A | náraz = pes sa zastaví a ukáže zlý riadok |
| 1.4 | Kosť navyše | A | zbieranie kostí (3. kosť) |
| 1.5 | Kde skončím? | **E** | predpoveď — dieťa len číta program |
| 1.6 | Zlý riadok | **C** | ladenie — jeden riadok je pokazený |
| 1.7 | Kľukatá cesta | A | tri zmeny smeru v jednej chodbe |
| 1.8 | Krok za krokom | A | tlačidlo ⏭ Krok (ladenie po riadkoch) |
| 1.9 | Dlhá cesta | A | 16 riadkov — *zámerne otravné*, pripravuje cyklus |
| 1.10 | Misia dvor | A | zhrnutie — obehni dvor, búdka je v strede |

Svet 1 zámerne **nemá oheň**: jediné, čo sa v ňom dá, je chodiť a zbierať kosti.
Vďaka tomu je nový príkaz `Použi` v Svete 2 naozaj nová vec, a nie siedma z desiatich.

## Svet 2 · Požiarny dvor — *Fifo* 🚒 · hadica

Prvý naozaj nový **príkaz**. `Použi` nehýbe psom — pôsobí na políčko, na ktoré sa
práve pozerá. To je celý svet: naučiť sa, že príkaz môže meniť mapu, nie len polohu.

> **Návrhové pravidlo sveta 2:** v absolútnom režime sa pes otáča *iba pohybom*,
> takže na oheň sa nedá namieriť inak než prísť k nemu rovno. Oheň preto musí vždy
> ležať na konci rovného úseku, ktorý má pred sebou aspoň jedno voľné políčko.
> Oheň hneď za zákrutou je neriešiteľný — a testy to nezachytia, mapa sa len ticho zasekne.

| # | Level | Typ | Nová vec |
|---|---|---|---|
| 2.1 | Horí! | A | `Použi` — hadica hasí políčko pred psom |
| 2.2 | Dva ohne | A | hadica sa dá použiť viackrát |
| 2.3 | Kosť za ohňom | A | slepá ulička — treba sa vrátiť tou istou cestou |
| 2.4 | Ohnivá križovatka | A | oheň je jediná cesta, obísť sa nedá |
| 2.5 | Uhasí to? | **E** | predpoveď — hadica krok neposunie |
| 2.6 | Zabudnutá hadica | **C** | ladenie — namiesto `Použi` je tam krok navyše |
| 2.7 | Tri ohne | A | rovnaká trojica riadkov trikrát za sebou |
| 2.8 | Obchádzka | A | cez oheň 5 riadkov, okolo 8 a bez kostí — *rozhodnutie* |
| 2.9 | Dlhý zásah | A | 22 riadkov, tri opakované úseky — druhá príprava na cyklus |
| 2.10 | Veľký požiar | A | finále: obvod dvora, búdka v strede |

## Svet 3 · Park — *Bit* 🔧 · cyklus

| # | Level | Typ | Nová vec |
|---|---|---|---|
| 3.1 | Bitov trik | A | `Opakuj N×` nad jedným riadkom — päť riadkov sa zmestí do dvoch |
| 3.2 | Šesť riadkov | **B** | limit riadkov núti použiť opakovanie |
| 3.3 | Opakuj blok | A | `Opakuj N×` cez viac riadkov (odsadenie v tabuľke) |
| 3.4 | Štvorec | A | klasika: 4× (vpred, otoč) |
| 3.5 | Koľko kôl? | **E** | predpoveď s cyklom |
| 3.6 | Cyklus v cykle | A | vnorený `Opakuj` |
| 3.7 | O jeden viac | **C** | ladenie chyby „o jedna vedľa“ |
| 3.8 | Skrátiť! | **B** | ten istý level ako 1.9, ale na 4 riadky |
| 3.9 | Hasič v cykle | **B** | 2.9 znova — tri opakované úseky sa zmestia do jedného bloku |

## Svet 4 · Les — *Ajka* 🔭 · podmienka a senzor

| # | Level | Typ | Nová vec |
|---|---|---|---|
| 4.1 | Ajka sa pozerá | A | `Ak je predo mnou stena → otoč` |
| 4.2 | Dva štarty | **F** | jeden program, dva rôzne štarty — bez podmienky sa nedá |
| 4.3 | Ak vidíš kosť | A | senzor na políčko pod labkami |
| 4.4 | Ak horí | A | senzor na oheň — hadica len keď treba |
| 4.5 | Inak | A | vetva `inak` |
| 4.6 | Hmla | **E** | predpoveď s podmienkou (mapa je čiastočne skrytá) |
| 4.7 | Sleduj stenu | A | `Opakuj kým nie si v cieli` + podmienka = pravidlo pravej ruky |
| 4.8 | Náhodné bludisko | A | mapa sa pri každom spustení mení → **musí** byť univerzálny program |

> Level 4.8 je vrchol prvej polovice hry: dieťa prvýkrát napíše program, ktorý rieši
> **triedu úloh**, nie jednu konkrétnu mapu. To je moment, keď sa z klikania stáva
> programovanie.

## Svet 5 · Prístav — *Luna* 🧭 · funkcia

| # | Level | Typ | Nová vec |
|---|---|---|---|
| 5.1 | Lunin trik | A | druhá malá tabuľka `Trik 1`, volanie z hlavnej |
| 5.2 | Trikrát ten istý trik | **B** | opakované volanie = úspora riadkov |
| 5.3 | Trik v triku | A | `Trik 1` volá `Trik 2` |
| 5.4 | Pomenuj to | A | premenovanie triku (`Obehni strom`) → čitateľnosť |
| 5.5 | Rozbitý trik | **C** | chyba je v triku, nie v hlavnej tabuľke |
| 5.6 | Veľká výprava | **B** | 40-krokové riešenie na 8 riadkoch |

## Svet 6 · Stavenisko — *Rex* 🏗️ · stav sveta

| # | Level | Typ | Nová vec |
|---|---|---|---|
| 6.1 | Zatlač debnu | A | `Tlač` — svet sa mení, nie iba pes |
| 6.2 | Tlačidlo a dvere | A | debna na tlačidle drží dvere otvorené |
| 6.3 | Späť sa nedá | **E** | predpoveď — nezvratný ťah (Sokoban logika) |
| 6.4 | Poriadok krokov | A | záleží na poradí — ten istý plán v inom poradí zlyhá |
| 6.5 | Stavbárska misia | A | zhrnutie |

## Svet 7 · Sklad — *Cent* 🧮 · premenná

| # | Level | Typ | Nová vec |
|---|---|---|---|
| 7.1 | Počítadlo | A | `Počítadlo +1` pri každej kosti, panel Stav ho ukazuje |
| 7.2 | Toľkokrát | A | `Vpred ×(počítadlo)` — premenná ako argument |
| 7.3 | Kým nemáš 5 | A | `Opakuj kým počítadlo < 5` |
| 7.4 | Nekonečno | **C** | zacyklený program — hra ho po 200 krokoch zastaví a vysvetlí |
| 7.5 | Presne toľko | **B** | zaviezť presne toľko debien, koľko je značiek |

## Svet 8 · Spoločná misia — všetci 👯 · súbeh

| # | Level | Typ | Nová vec |
|---|---|---|---|
| 8.1 | Dvaja naraz | **G** | dve tabuľky, dva psy, jeden takt |
| 8.2 | Otvor mi | **G** | Rex drží tlačidlo, Fifo prebehne |
| 8.3 | Nezraz sa | **G** | zrážka = obaja sa zastavia → treba čakanie |
| 8.4 | Počkaj na mňa | **G** | príkaz `Čakaj` = synchronizácia |
| 8.5 | Veľká záchrana | **G** | finále: traja psi, všetky koncepty |

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
| `Opakuj N×` | cyklus s počítadlom |
| `Opakuj kým…` | cyklus s podmienkou |
| `Ak … inak` | vetvenie |
| `Trik` | funkcia / procedúra, abstrakcia |
| panel Stav | premenné, stav programu |
| hadica `Použi` | príkaz s vedľajším účinkom — mení mapu, nie polohu |
| debny a dvere | stav sveta, vedľajší účinok |
| dva psy naraz | súbežnosť, synchronizácia |
| náhodné bludisko (4.8) | všeobecný algoritmus namiesto konkrétneho riešenia |
| limit riadkov | optimalizácia, refaktoring |
| typ levelu „Predpoveď“ | mentálna simulácia, analýza kódu |
