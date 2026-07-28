# Kódolabky — TODO

Konkrétne úlohy na najbližšie sedenia. Fázový pohľad je v [ROADMAP](docs/ROADMAP.md),
toto je zoznam vecí, ktoré sa dajú zobrať a spraviť.

---

## 0. Najprv toto — otestovať s dieťaťom

**Toto je najdôležitejšia položka celého zoznamu a blokuje rozhodnutia nižšie.**
Zatiaľ hru nevidelo ani jedno dieťa. Ďalších desať levelov postavených naslepo
môže byť desať levelov do koša.

- [ ] Posadiť k hre dieťa 5–7 r. a **iba pozerať** — nenapovedať, nekomentovať
- [ ] Zapísať: kde sa zaseklo, čo nepochopilo, čo ho bavilo, kedy odišlo
- [ ] **Rozhodnúť východiskový režim ovládania** — šípky (absolute) vs. otáčanie
      (relative). Dnes je východiskový `absolute`, ale je to odhad, nie zistenie.
      Zdroj: `docs/ROADMAP.md` → Otvorené otázky
- [ ] Overiť, či je „Vymazať“ nebezpečné (omylom stlačené pri dlhom pláne) →
      ak áno, doplniť „↶ Vrátiť“ na pár sekúnd do hlavičky plánu
- [ ] Overiť, či sedí sklon dosky (15°) a výška stien (15 px) — na tablete v ruke
      to môže byť iné než na monitore

---

## 1. Etapa 2 — Svet 1 kompletne

### Nové typy levelov
- [ ] **Typ `predict` (level 1.5 „Kde skončím?“)** — plán je hotový a zamknutý,
      dieťa klikne na políčko, kde podľa neho pes skončí, až potom sa spustí.
      Súbor už existuje: `levels/world1/1.5-kde-skoncim.json` (nie je v `index.json`).
      Treba: režim klikania na dlaždicu, vyhodnotenie, zamknutá tabuľka.
      **Nové ocenenie „Jasnovidec“ +80** — viac než čokoľvek okrem dokončenia,
      lebo správna predpoveď je najčistejší dôkaz, že dieťa simuluje program v hlave.
- [ ] **Typ `debug` (level 1.6 „Zlý riadok“)** — predvyplnená tabuľka, jeden riadok
      pokazený. Potrebuje podporu `preset` + `locked` riadkov v `TableView`.
- [ ] Levely **1.8 – 1.10** podľa `docs/CURRICULUM.md`

### UI
- [ ] **Mapa misií** namiesto rozbaľovacieho zoznamu — misie ako body na mape
      stanice, s kosťami a hodnosťou
- [ ] **Zvuky** — ťapkanie labiek pri kroku, cink pri kosti, zmätené „haf“ pri
      náraze, fanfára v cieli. Vypínateľné, východiskovo zapnuté.
- [ ] **Hlasové čítanie príkazov** (Web Speech API, `sk-SK`) — klik na riadok ho
      prečíta. Kvôli deťom, ktoré ešte nečítajú.
- [ ] **Ovládanie klávesnicou** — šípky na klávesnici pridávajú kroky, `Enter` = Štart,
      `Space` = Krok. Dnes sa D-pad ovláda len myšou/dotykom.

### Blokátory pre PWA
- [ ] **Self-hostovať fonty** (Baloo 2, Atkinson Hyperlegible, DM Mono) — dnes sa
      ťahajú z Google Fonts, takže offline padnú na systémové
- [ ] **PNG ikony** (192, 512, maskable) — `assets/icon.svg` na inštaláciu nestačí
- [ ] `manifest.json` + service worker, **pri každej zmene bumpnúť verziu cache**

---

## 2. Drobnosti a technický dlh

- [ ] **Indikátor smeru pri `Použi`** — v absolútnom režime pes mieri tam, kam
      naposledy kráčal, čo nie je vidno. Zvážiť šípku pred psom, keď je `use`
      v palete. (Pozadie: `docs/ARCHITECTURE.md` → pravidlo pre tvorbu levelov)
- [ ] **Konflikt dvoch design skillov** — `modern-web-design` a `frontend-design`
      sa oba spustia na „sprav peknú stránku“. Ak si začnú protirečiť, zúžiť
      `description:` jedného z nich.
- [ ] **Číslovanie levelov má dieru** — 1.1–1.4, potom 1.7. Vyrieši sa samo, keď
      pribudnú 1.5, 1.6 a 1.8–1.10.
- [ ] Skontrolovať kontrast a ovládanie klávesnicou naprieč celou hrou
- [ ] Otestovať na skutočnom tablete (nielen v zmenšenom okne prehliadača)

---

## 3. Neskôr — Etapy 3 až 7

Detaily v [ROADMAP](docs/ROADMAP.md). V skratke:

- **Svet 2** — `Opakuj n×` s blokom riadkov, odsadenie v tabuľke, limit riadkov
- **Svet 3** — `Ak … inak`, senzory, typ levelu **Zrkadlo**, náhodné bludisko (3.7)
- **Svet 4** — `Trik` = funkcia, druhá tabuľka
- **Svet 5** — debny, tlačidlá, dvere (stav sveta)
- **Svet 6** — počítadlo, `Opakuj kým…`
- **Svet 7** — dva psy naraz, `Čakaj` (súbežnosť)
- **Dielňa** (Etapa 7) — React + FastAPI + PostgreSQL: editor levelov, solver na
  automatický limit riadkov, generátor bludísk, učiteľský prehľad.
  Hra na nej nikdy nezávisí za behu — viď [ADR-001](docs/ADR-001-stack.md).

---

## Hotové

- [x] Etapa 1 — engine, UI, 5 levelov, oba režimy ovládania, tri kosti
- [x] 63 testov v prehliadači vrátane overenia, že každý level je riešiteľný
- [x] Redizajn — dispečerský pult v strede, 3D dioráma, prekreslení psíci
- [x] Jeden riadok = jeden krok (zrušený stĺpec „Koľko“)
- [x] Vlastné písmo a ikona
- [x] Body dispečera, hodnosti a Kniha služieb
- [x] Nasadenie na GitHub Pages
