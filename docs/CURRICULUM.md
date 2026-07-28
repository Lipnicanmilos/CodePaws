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
| 1.7 | Horí! | A | `Použi` (uhasí oheň, otvorí bránu) |
| 1.8 | Krok za krokom | A | tlačidlo ⏭ Krok (ladenie po riadkoch) |
| 1.9 | Dlhá cesta | A | 14 riadkov — *zámerne otravné*, pripravuje cyklus |
| 1.10 | Misia dvor | A | zhrnutie |

## Svet 2 · Park — *Bit* 🔧 · cyklus

| # | Level | Typ | Nová vec |
|---|---|---|---|
| 2.1 | Bitov trik | A | `Vpred ×3` — počet opakovaní v stĺpci „Koľko“ |
| 2.2 | Šesť riadkov | **B** | limit riadkov núti použiť opakovanie |
| 2.3 | Opakuj blok | A | `Opakuj N×` cez viac riadkov (odsadenie v tabuľke) |
| 2.4 | Štvorec | A | klasika: 4× (vpred, otoč) |
| 2.5 | Koľko kôl? | **E** | predpoveď s cyklom |
| 2.6 | Cyklus v cykle | A | vnorený `Opakuj` |
| 2.7 | O jeden viac | **C** | ladenie chyby „o jedna vedľa“ |
| 2.8 | Skrátiť! | **B** | ten istý level ako 1.9, ale na 4 riadky |

## Svet 3 · Les — *Ajka* 🔭 · podmienka a senzor

| # | Level | Typ | Nová vec |
|---|---|---|---|
| 3.1 | Ajka sa pozerá | A | `Ak je predo mnou stena → otoč` |
| 3.2 | Dva štarty | **F** | jeden program, dva rôzne štarty — bez podmienky sa nedá |
| 3.3 | Ak vidíš kosť | A | senzor na políčko pod labkami |
| 3.4 | Inak | A | vetva `inak` |
| 3.5 | Hmla | **E** | predpoveď s podmienkou (mapa je čiastočne skrytá) |
| 3.6 | Sleduj stenu | A | `Opakuj kým nie si v cieli` + podmienka = pravidlo pravej ruky |
| 3.7 | Náhodné bludisko | A | mapa sa pri každom spustení mení → **musí** byť univerzálny program |

> Level 3.7 je vrchol prvej polovice hry: dieťa prvýkrát napíše program, ktorý rieši
> **triedu úloh**, nie jednu konkrétnu mapu. To je moment, keď sa z klikania stáva
> programovanie.

## Svet 4 · Prístav — *Luna* 🧭 · funkcia

| # | Level | Typ | Nová vec |
|---|---|---|---|
| 4.1 | Lunin trik | A | druhá malá tabuľka `Trik 1`, volanie z hlavnej |
| 4.2 | Trikrát ten istý trik | **B** | opakované volanie = úspora riadkov |
| 4.3 | Trik v triku | A | `Trik 1` volá `Trik 2` |
| 4.4 | Pomenuj to | A | premenovanie triku (`Obehni strom`) → čitateľnosť |
| 4.5 | Rozbitý trik | **C** | chyba je v triku, nie v hlavnej tabuľke |
| 4.6 | Veľká výprava | **B** | 40-krokové riešenie na 8 riadkoch |

## Svet 5 · Stavenisko — *Rex* 🏗️ · stav sveta

| # | Level | Typ | Nová vec |
|---|---|---|---|
| 5.1 | Zatlač debnu | A | `Tlač` — svet sa mení, nie iba pes |
| 5.2 | Tlačidlo a dvere | A | debna na tlačidle drží dvere otvorené |
| 5.3 | Späť sa nedá | **E** | predpoveď — nezvratný ťah (Sokoban logika) |
| 5.4 | Poriadok krokov | A | záleží na poradí — ten istý plán v inom poradí zlyhá |
| 5.5 | Stavbárska misia | A | zhrnutie |

## Svet 6 · Sklad — *Cent* 🧮 · premenná

| # | Level | Typ | Nová vec |
|---|---|---|---|
| 6.1 | Počítadlo | A | `Počítadlo +1` pri každej kosti, panel Stav ho ukazuje |
| 6.2 | Toľkokrát | A | `Vpred ×(počítadlo)` — premenná ako argument |
| 6.3 | Kým nemáš 5 | A | `Opakuj kým počítadlo < 5` |
| 6.4 | Nekonečno | **C** | zacyklený program — hra ho po 200 krokoch zastaví a vysvetlí |
| 6.5 | Presne toľko | **B** | zaviezť presne toľko debien, koľko je značiek |

## Svet 7 · Spoločná misia — všetci 👯 · súbeh

| # | Level | Typ | Nová vec |
|---|---|---|---|
| 7.1 | Dvaja naraz | **G** | dve tabuľky, dva psy, jeden takt |
| 7.2 | Otvor mi | **G** | Rex drží tlačidlo, Fifo prebehne |
| 7.3 | Nezraz sa | **G** | zrážka = obaja sa zastavia → treba čakanie |
| 7.4 | Počkaj na mňa | **G** | príkaz `Čakaj` = synchronizácia |
| 7.5 | Veľká záchrana | **G** | finále: traja psi, všetky koncepty |

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
| debny a dvere | stav sveta, vedľajší účinok |
| dva psy naraz | súbežnosť, synchronizácia |
| náhodné bludisko (3.7) | všeobecný algoritmus namiesto konkrétneho riešenia |
| limit riadkov | optimalizácia, refaktoring |
| typ levelu „Predpoveď“ | mentálna simulácia, analýza kódu |
