/* Kódolabky — hráč, postup a body. Iba localStorage, nič neodchádza zo zariadenia.

   Hráč je jeden a je to prezývka, ktorú dieťa zadá na začiatku. Tá istá
   prezývka ide aj do rebríčka — dve mená pre to isté dieťa (volací znak zvlášť,
   prezývka zvlášť) boli len mätúce.

   Bodovanie odmeňuje to isté, čo hra učí: krátky plán, pozornosť k mape
   a premyslenie plánu pred spustením. Zámerne NEODMEŇUJE rýchlosť ani počet
   pokusov — inak by sa dieťa naučilo klikať namiesto rozmýšľať.
   Body sa dajú za level získať raz; opakovaním sa nefarmia, drží sa najlepší
   výsledok. */

import { cleanNick } from './nick.js';

const KEY = 'codepaws.progress';
const VERSION = 3;

/* `predict` je za trafenú predpoveď a je zámerne najdrahšie ocenenie hneď po
   dokončení misie: správny tip pred spustením je najčistejší dôkaz, že dieťa
   si program prehralo v hlave. Dá sa získať len v leveloch typu `predict`. */
export const AWARDS = [
  { id: 'finish',  points: 100, label: 'Misia splnená' },
  { id: 'predict', points:  80, label: 'Jasnovidec' },
  { id: 'rows',    points:  60, label: 'Krátky plán' },
  { id: 'bones',   points:  40, label: 'Všetky kosti' },
  { id: 'clean',   points:  50, label: 'Bez jediného nárazu' },
];

export const RANKS = [
  { at: 0,    name: 'Šteniatko' },
  { at: 150,  name: 'Pomocník' },
  { at: 400,  name: 'Dispečer' },
  { at: 700,  name: 'Veliteľ zmeny' },
  { at: 1000, name: 'Hlavný dispečer' },
];

export const pointsFor = (awardIds) =>
  AWARDS.reduce((sum, a) => sum + (awardIds.includes(a.id) ? a.points : 0), 0);

/** Ktoré ocenenia sa v danom leveli vôbec dajú získať. V Predpovedi je plán daný,
    takže „krátky plán“ ani „bez nárazu“ nie sú zásluha dieťaťa. */
export const awardIdsForLevel = (level) =>
  level?.type === 'predict' ? ['finish', 'predict'] : ['finish', 'rows', 'bones', 'clean'];

export function rankFor(points) {
  let rank = RANKS[0];
  for (const r of RANKS) if (points >= r.at) rank = r;
  return rank;
}

/** Koľko bodov ešte chýba do ďalšej hodnosti (null = najvyššia). */
export function nextRank(points) {
  return RANKS.find((r) => r.at > points) ?? null;
}

/** `nick: null` znamená, že hra sa ešte nepredstavila — hru to nespustí. */
const empty = () => ({
  version: VERSION,
  nick: null,
  levels: {},
  submitted: 0,        // koľko bodov už odišlo do rebríčka
  settings: { mode: 'absolute', speed: 330 },
});

let cache = null;

function load() {
  if (cache) return cache;
  let raw = null;
  try { raw = JSON.parse(localStorage.getItem(KEY) ?? 'null'); } catch { /* poškodené dáta */ }

  if (raw?.version === VERSION) {
    cache = raw;
  } else {
    cache = migrate(raw);
    save();   // nech sa prevod nerobí znova pri každom otvorení
  }

  return cache;
}

/** Postup z predošlých verzií sa nezahadzuje — dieťa oň neprišlo ničím vlastným.
    v1 = bez posádky, v2 = viac profilov (z tých prežije ten, ktorý bol aktívny).
    Exportované kvôli testom: tichá strata postupu je chyba, ktorú nikto nenahlási. */
export function migrate(old) {
  const store = empty();
  if (!old) return store;

  store.settings = { ...store.settings, ...(old.settings ?? {}) };

  if (old.version === 2) {
    const active = old.profiles?.find((p) => p.id === old.activeId) ?? old.profiles?.[0];
    store.nick = cleanNick(active?.callsign) || null;
    store.levels = active?.levels ?? {};
    return store;
  }

  for (const [levelId, rec] of Object.entries(old.levels ?? {})) {
    const stars = rec.stars ?? rec.awards ?? [];
    store.levels[levelId] = { awards: stars, points: pointsFor(stars) };
  }
  return store;
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch { /* súkromný režim — hrá sa ďalej */ }
}

/* ── Nastavenia (spoločné pre celé zariadenie) ─────────────────── */

export const getSetting = (name) => load().settings[name];

export function setSetting(name, value) {
  load().settings[name] = value;
  save();
}

/* ── Hráč ──────────────────────────────────────────────────────── */

export const getNick = () => load().nick;

/** Kým je prázdna, hra sa nespustí — najprv sa treba predstaviť. */
export const hasNick = () => Boolean(load().nick);

export function setNick(text) {
  const nick = cleanNick(text);
  if (!nick) return null;
  load().nick = nick;
  save();
  return nick;
}

/* ── Výsledky ──────────────────────────────────────────────────── */

export const awardsFor = (levelId) => load().levels[levelId]?.awards ?? [];

export const isSolved = (levelId) => awardsFor(levelId).includes('finish');

/** Uloží len zlepšenie — raz získaná kosť ani bod sa nedajú stratiť. */
export function recordResult(levelId, awardIds) {
  const store = load();
  const prev = new Set(store.levels[levelId]?.awards ?? []);
  for (const id of awardIds) prev.add(id);
  const awards = [...prev];
  store.levels[levelId] = { awards, points: pointsFor(awards) };
  save();
  return awards;
}

export function totals() {
  const levels = Object.values(load().levels);
  return {
    points: levels.reduce((sum, l) => sum + (l.points ?? 0), 0),
    missions: levels.filter((l) => l.awards?.includes('finish')).length,
    bones: levels.reduce((sum, l) => sum + (l.awards ?? []).filter((a) => a !== 'clean').length, 0),
    clean: levels.filter((l) => l.awards?.includes('clean')).length,
  };
}

/* ── Zápis do rebríčka ─────────────────────────────────────────────
   Do rebríčka sa body PRIPOČÍTAVAJÚ, preto sa musí pamätať, čo už bolo
   zapísané. Inak by druhý klik na „Zapísať“ pridal celý súčet znova. */

export const submittedPoints = () => load().submitted ?? 0;

/** Koľko bodov ešte nebolo zapísaných — presne toľko sa pripočíta. */
export const pendingPoints = () => Math.max(0, totals().points - submittedPoints());

export function markSubmitted(points = totals().points) {
  const store = load();
  store.submitted = Math.max(store.submitted ?? 0, points);
  save();
  return store.submitted;
}
