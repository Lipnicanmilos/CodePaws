/* Kódolabky — posádka, postup a body. Iba localStorage, nič neodchádza zo zariadenia.

   Bodovanie odmeňuje to isté, čo hra učí: krátky plán, pozornosť k mape
   a premyslenie plánu pred spustením. Zámerne NEODMEŇUJE rýchlosť ani počet
   pokusov — inak by sa dieťa naučilo klikať namiesto rozmýšľať.
   Body sa dajú za level získať raz; opakovaním sa nefarmia, drží sa najlepší
   výsledok. */

const KEY = 'codepaws.progress';
const VERSION = 2;

export const AWARDS = [
  { id: 'finish', points: 100, label: 'Misia splnená' },
  { id: 'rows',   points:  60, label: 'Krátky plán' },
  { id: 'bones',  points:  40, label: 'Všetky kosti' },
  { id: 'clean',  points:  50, label: 'Bez jediného nárazu' },
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

export function rankFor(points) {
  let rank = RANKS[0];
  for (const r of RANKS) if (points >= r.at) rank = r;
  return rank;
}

/** Koľko bodov ešte chýba do ďalšej hodnosti (null = najvyššia). */
export function nextRank(points) {
  return RANKS.find((r) => r.at > points) ?? null;
}

const newProfile = (callsign) => ({
  id: `p${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`,
  callsign,
  levels: {},
});

const empty = () => {
  const first = newProfile('LABKA 1');
  return {
    version: VERSION,
    activeId: first.id,
    profiles: [first],
    settings: { mode: 'absolute', speed: 330 },
  };
};

let cache = null;

function load() {
  if (cache) return cache;
  let raw = null;
  try { raw = JSON.parse(localStorage.getItem(KEY) ?? 'null'); } catch { /* poškodené dáta */ }

  if (raw?.version === VERSION) {
    cache = raw;
  } else {
    cache = raw?.version === 1 ? migrateV1(raw) : empty();
    save();   // nech sa prevod nerobí znova pri každom otvorení
  }

  return cache;
}

/** Verzia 1 nemala posádku — doterajší postup dostane prvý volací znak. */
function migrateV1(old) {
  const store = empty();
  store.settings = { ...store.settings, ...(old.settings ?? {}) };
  const levels = {};
  for (const [levelId, rec] of Object.entries(old.levels ?? {})) {
    const stars = rec.stars ?? [];
    levels[levelId] = { awards: stars, points: pointsFor(stars) };
  }
  store.profiles[0].levels = levels;
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

/* ── Posádka ───────────────────────────────────────────────────── */

export const profiles = () => load().profiles;

export function activeProfile() {
  const store = load();
  return store.profiles.find((p) => p.id === store.activeId) ?? store.profiles[0];
}

export function setActive(id) {
  const store = load();
  if (store.profiles.some((p) => p.id === id)) {
    store.activeId = id;
    save();
  }
  return activeProfile();
}

/** Volací znak ako v rádiu: krátky, veľkými písmenami, ľahko sa kričí. */
export function normalizeCallsign(text) {
  return (text ?? '')
    .toLocaleUpperCase('sk-SK')
    .replace(/[^\p{L}\p{N} -]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 10);
}

export function addProfile(callsign) {
  const name = normalizeCallsign(callsign);
  if (!name) return null;
  const store = load();
  const profile = newProfile(name);
  store.profiles.push(profile);
  store.activeId = profile.id;
  save();
  return profile;
}

export function renameActive(callsign) {
  const name = normalizeCallsign(callsign);
  if (!name) return null;
  activeProfile().callsign = name;
  save();
  return name;
}

export function removeProfile(id) {
  const store = load();
  if (store.profiles.length <= 1) return false;
  store.profiles = store.profiles.filter((p) => p.id !== id);
  if (!store.profiles.some((p) => p.id === store.activeId)) store.activeId = store.profiles[0].id;
  save();
  return true;
}

/* ── Výsledky ──────────────────────────────────────────────────── */

export const awardsFor = (levelId, profile = activeProfile()) =>
  profile.levels[levelId]?.awards ?? [];

export const isSolved = (levelId, profile = activeProfile()) =>
  awardsFor(levelId, profile).includes('finish');

/** Uloží len zlepšenie — raz získaná kosť ani bod sa nedajú stratiť. */
export function recordResult(levelId, awardIds) {
  const profile = activeProfile();
  const prev = new Set(profile.levels[levelId]?.awards ?? []);
  for (const id of awardIds) prev.add(id);
  const awards = [...prev];
  profile.levels[levelId] = { awards, points: pointsFor(awards) };
  save();
  return awards;
}

export function totals(profile = activeProfile()) {
  const levels = Object.values(profile.levels);
  return {
    points: levels.reduce((sum, l) => sum + (l.points ?? 0), 0),
    missions: levels.filter((l) => l.awards?.includes('finish')).length,
    bones: levels.reduce((sum, l) => sum + (l.awards ?? []).filter((a) => a !== 'clean').length, 0),
    clean: levels.filter((l) => l.awards?.includes('clean')).length,
  };
}

/** Hráči — posádka zoradená podľa bodov. */
export const roster = () =>
  profiles()
    .map((p) => ({ profile: p, ...totals(p), rank: rankFor(totals(p).points) }))
    .sort((a, b) => b.points - a.points || a.profile.callsign.localeCompare(b.profile.callsign, 'sk'));
