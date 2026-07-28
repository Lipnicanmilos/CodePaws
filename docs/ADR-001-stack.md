# ADR-001 · Voľba technológií (React + FastAPI + PostgreSQL?)

**Stav:** ✅ prijaté (2026-07-28) — variant „hra teraz, Dielňa neskôr“ · **Dátum:** 2026-07-28

> **Prijaté rozhodnutie:** Etapy 1–5 sa stavajú ako statická hra bez backendu
> (čistý JS engine + PWA). Po nej príde **Dielňa** — samostatná aplikácia
> React + FastAPI + PostgreSQL pre autora a učiteľov (editor levelov, solver,
> generátor bludísk, anonymná analytika). Hra na nej nikdy nezávisí za behu;
> levely sa z databázy exportujú do statických JSON pri builde.

## Otázka

Postaviť Kódolabky ako čistý HTML+CSS+JS klient (pôvodný návrh), alebo použiť
React + Python FastAPI + PostgreSQL?

## Čo z toho hra reálne potrebuje

Jadro hry — bludisko, tabuľka príkazov, interpret, animácie — je **na 100 % klientská
záležitosť**. Beží v prehliadači, nepotrebuje sieť a nemá čo poslať na server.
Ak by sme backend pridali len preto, že „hra má databázu“, dostaneme:

- ❌ hra nefunguje v aute, vo vlaku, na chate bez signálu
- ❌ dieťa čaká na odpoveď servera medzi krokmi programu
- ❌ mesačné náklady a niečo, čo môže spadnúť
- ❌ nedá sa poslať kamarátovi ako odkaz na GitHub Pages

> **Pozor na zámenu pojmov:** tabuľka vpravo v hre *vyzerá* ako databáza, ale je to
> **program**, nie perzistentné úložisko. Ukladať jednotlivé riadky programu do
> PostgreSQL by znamenalo sieťový round-trip pri každom kliknutí. Tá „databázovosť“
> je pedagogická metafora a má zostať metaforou.

## Čo by backend naozaj priniesol

Existujú štyri veci, ktoré sa bez servera spraviť nedajú, a všetky štyri sú hodnotné:

| Funkcia | Prečo potrebuje backend | Hodnota |
|---|---|---|
| **Učiteľský režim** | Učiteľ vidí 25 detí naraz, deti sedia pri rôznych tabletoch | vysoká — otvára školy |
| **Galéria vlastných levelov** | Zdieľanie mimo „pošli odkaz kamarátovi“, moderovanie | stredná |
| **Postup naprieč zariadeniami** | Tablet doma + PC u babky | nízka pre 6-ročné dieťa |
| **Analytika učenia** | Na ktorom leveli sa deti zasekávajú, ktorý koncept nesadol | **vysoká pre kvalitu hry** |

Analytika je najzaujímavejšia: bez nej sa krivka obtiažnosti ladí naslepo.
Ale dá sa robiť aj anonymne a dávkovo — nepotrebuje účty ani real-time.

## Právna prekážka, ktorá rozhoduje najviac

Akonáhle vznikne účet dieťaťa na serveri, projekt spadne pod GDPR čl. 8 —
spracúvanie údajov dieťaťa vyžaduje súhlas rodiča (na Slovensku je hranica 16 rokov).
To znamená overovanie rodičovského súhlasu, informačnú povinnosť, retenciu, mazanie
na žiadosť, zmluvu so spracovateľom. Pre hru pre päťročné deti je to neúmerná záťaž
a zároveň hlavný dôvod, prečo je „bez účtov, bez servera“ konkurenčná výhoda,
nie kompromis.

**Návrh:** deti nikdy nemajú účet. Účet má nanajvýš **učiteľ**, a triedy sa
identifikujú pseudonymne („Žiak 7“), bez mien detí.

## Prekážky v tomto prostredí

- **React vyžaduje Node** na build (Vite/webpack). Na tomto notebooku Node
  nainštalovaný nie je → nový blokátor hneď v prvej hodine vývoja.
- **PostgreSQL lokálne** = ďalšia inštalácia, alebo cloud s connection stringom.
  Presne táto konfigurácia už raz spôsobila, že sa iný projekt nedal spustiť lokálne
  (chýbajúce `.env` / `DATABASE_URL`) — u hry, ktorú chceme často ukazovať deťom,
  by to bolo obzvlášť nepríjemné.
- **Deploy** sa z „commitni a je to na Pages za 30 s“ zmení na frontend + API +
  databáza + migrácie + CORS + secrets.

## Rozhodnutie (navrhované): hybrid, v tomto poradí

### 1. Engine je vždy čistý JavaScript, bez frameworku
`vm.js`, `world.js`, `program.js` nesmú vedieť o Reacte ani o sieti. Tým sa voľba
UI frameworku stáva **zvratným rozhodnutím** — dá sa zmeniť za víkend.

### 2. Hra sa nasadí ako statická PWA
Offline, `localStorage`, GitHub Pages. Deti nikdy nekomunikujú so serverom.

### 3. FastAPI + PostgreSQL prídu ako *autorský a učiteľský nástroj*, nie ako hra
Toto je architektúra, v ktorej celý stack dáva zmysel:

```
  ┌──────────────────────────┐        ┌─────────────────────────┐
  │  Kódolabky (hra)         │        │  Dielňa (React + FastAPI)│
  │  statická PWA, offline   │        │  editor levelov,         │
  │  žiadny účet, žiadna sieť│        │  učiteľský prehľad       │
  └──────────┬───────────────┘        └───────────┬─────────────┘
             │                                    │
             │  levels/*.json  ◄──── build ───────┤  PostgreSQL
             │  (statický export)                 │  (levely, triedy,
             ▼                                    ▼   anonymná analytika)
        GitHub Pages                          FastAPI + SQLAlchemy
```

Databáza je **zdroj obsahu**, nie závislosť za behu. Levely sa z nej vyexportujú
do statických JSON súborov pri builde. Ak backend spadne, hra hrá ďalej.

### 4. Kde je Python naozaj silný
Nie na CRUD, ale na veci, ktoré v prehliadači robiť nechceme:

- **generátor bludísk** s garanciou riešiteľnosti a cieľovou obtiažnosťou
- **solver**, ktorý pre každý level nájde optimálne riešenie → automaticky nastaví
  limit riadkov pre druhú kosť (dnes by sa hádal ručne)
- **validátor** celej sady levelov v CI: „level 4.6 je po úprave mapy neriešiteľný“
- **analýza obtiažnosti** — koľko konceptov level vyžaduje, či nepreskakuje krok

Toto je backend, ktorý reálne zlepší hru. CRUD nad tabuľkou `progress` nie.

## Kedy to prehodnotiť

Ak je cieľom projektu **portfólio / precvičenie stacku**, nie čo najrýchlejšie
dostať hru k deťom, potom je React + FastAPI + PostgreSQL legitímna voľba od
prvého dňa — len s vedomím, že prvý hrateľný level príde neskôr.

## Návrh schémy, ak sa backend postaví

```sql
-- obsah
levels        (id, slug, world, type, spec jsonb, difficulty, published_at)
level_reviews (id, level_id, solver_steps, optimal_rows, solvable, checked_at)
characters    (id, slug, name_sk, concept)

-- autori a učitelia (dospelí, s účtom)
users         (id, email, role, created_at)          -- role: author | teacher
classes       (id, teacher_id, name, join_code)
students      (id, class_id, alias)                  -- „Žiak 7“, nikdy meno dieťaťa

-- anonymná analytika (bez väzby na identitu dieťaťa)
attempts      (id, level_id, class_id, rows_used, stars, attempts_count,
               gave_up, duration_s, created_at)
concept_stats (level_id, concept, success_rate, refreshed_at)
```

Žiadna tabuľka neobsahuje meno, e-mail ani zariadenie dieťaťa. `attempts` je
zámerne agregovateľné a bez cudzieho kľúča na `students`.
