# Sieň slávy — serverová časť (Supabase)

Globálny rebríček prvých pätnástich. Jedna tabuľka a jedna funkcia — pätnásť
riadkov dát, takže nič zložitejšie netreba.

**Node ani žiadne CLI netreba** — všetko sa naklikáva vo webovom rozhraní.

> **Na čo si dať pozor:** bezplatné projekty Supabase sa **po týždni nečinnosti
> uspia** a rebríček dovtedy neodpovedá, kým projekt v konzole neprebudíš.
> Pri hre, ktorú niekto otvorí raz za čas, s tým treba rátať.

---

## Nasadenie (~10 minút)

### 1. Projekt
Založ si bezplatný účet na [supabase.com](https://supabase.com) a nový projekt.

- Región: **Frankfurt (eu-central-1)** — najbližšie
- Heslo k databáze si odlož, ale do hry ho **nikdy nedávaj**

### 2. Tabuľka a funkcia
**SQL Editor → New query**, vlož celý obsah [`supabase.sql`](supabase.sql) a spusti.
Dá sa spustiť opakovane, nič nepokazí.

Vytvorí sa tabuľka `hall`, zapne sa RLS (čítať smie ktokoľvek, zapisovať nikto)
a pridá sa funkcia `submit_score`, ktorá je jediná cesta, ako sa dá zapísať.

### 3. Kľúče do hry
**Project Settings → API Keys**, skopíruj **Project URL** a **publishable** kľúč
(`sb_publishable_…`; v starších projektoch sa volá **anon public** a začína `eyJ…`)
do [`src/game/config.js`](../src/game/config.js):

```js
export const SUPABASE_URL = 'https://xxxxxxxx.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_...';
```

Ponuku **Connect → Server / Build APIs** s `npm install @supabase/server`
ignoruj — tá je pre backend v Node. Kódolabky sú statický klient a volajú
REST rozhranie priamo, žiadny balík netreba.

Commitni a pushni — Pages sa nasadia samy a rebríček je globálny.
**Kým sú polia prázdne, hra funguje ďalej**, len je Sieň slávy lokálna.

### Overenie

```bash
curl "https://xxxxxxxx.supabase.co/rest/v1/hall?select=*" -H "apikey: TVOJ_ANON_KLUC"
```

Má vrátiť `[]`.

---

## Kľúče: čo je verejné a čo nie

Supabase kľúče premenoval, v konzole sa dajú vidieť oba názvy:

| Kľúč | Starší názov | Kam patrí |
|---|---|---|
| `sb_publishable_…` | `anon` public | **do kódu stránky** — je verejný zámerne |
| `sb_secret_…` | `service_role` | **nikam** okrem konzoly Supabase |

Publishable kľúč dáta nechráni — chráni ich RLS v databáze. Preto sa pokojne
commituje a preto je dôležité, že tabuľka `hall` nemá žiadnu politiku na zápis.

**Secret kľúč obchádza RLS.** Keby sa dostal do repozitára, ktokoľvek by mohol
rebríček prepísať alebo zmazať. Ak sa to raz stane, treba ho v konzole otočiť
(**API Keys → Rotate**), nestačí ho z kódu vymazať — v histórii gitu ostane.

## Čo funkcia robí a nerobí

**Robí:** klientovi neverí nič. Prezývku si prečistí nanovo (veľké písmená,
max 10 znakov, preč s interpunkciou), odmietne vulgarizmy aj keď sú schované
v inom slove, skontroluje body proti stropu, zabrzdí opakované zápisy do piatich
sekúnd a nechá len pätnásť najlepších. Jedna prezývka = jedna priečka a horší
výsledok ten lepší neprepíše.

**Neukladá:** žiadne mená, e-maily ani IP adresy. Iba **prezývka, body, počet
misií a dátum**.

**Nerobí zatiaľ:** neoveruje, či hráč body naozaj získal. Klientská hra si vie
poslať ľubovoľné číslo a otvorená konzola je otvorená konzola. Strop
`v_max_points` bráni aspoň absurditám typu milión bodov.

> **Pri každom pridaní levelu zvýš `v_max_points` v SQL** — je to
> `250 × počet levelov`. Dnes je levelov päť, teda `1250`. Ak sa zabudne,
> poctivý hráč sa v istom momente prestane vedieť zapísať.

Ak podvádzanie raz začne prekážať, riešenie je pripravené v architektúre: engine
(`src/engine/`) nevie nič o DOM a je to čistý JavaScript, takže beží aj v Edge
Function. Klient by potom neposielal body, ale samotné plány, a server by ich
prehral tým istým interpretom a body si vypočítal sám. Podvrhnutý plán do cieľa
jednoducho nedôjde.

## Údržba

```sql
delete from public.hall where nick = 'PREZYVKA';  -- zmazať jednu priečku
truncate public.hall;                             -- vynulovať rebríček
```
