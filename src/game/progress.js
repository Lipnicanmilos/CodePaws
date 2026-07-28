/* Kódolabky — postup hráča. Iba localStorage, nič neodchádza zo zariadenia. */

const KEY = 'codepaws.progress';
const VERSION = 1;

const empty = () => ({ version: VERSION, levels: {}, settings: { mode: 'absolute', speed: 330 } });

let cache = null;

function load() {
  if (cache) return cache;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    cache = raw?.version === VERSION ? { ...empty(), ...raw } : empty();
  } catch {
    cache = empty();
  }
  return cache;
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(cache)); } catch { /* súkromný režim — hrá sa ďalej */ }
}

export const getSetting = (name) => load().settings[name];

export function setSetting(name, value) {
  load().settings[name] = value;
  save();
}

export const starsFor = (levelId) => load().levels[levelId]?.stars ?? [];

/** Uloží len zlepšenie — raz získaná kosť sa nedá stratiť. */
export function recordStars(levelId, stars) {
  const store = load();
  const prev = new Set(store.levels[levelId]?.stars ?? []);
  for (const s of stars) prev.add(s);
  store.levels[levelId] = { stars: [...prev] };
  save();
  return [...prev];
}

export const isSolved = (levelId) => starsFor(levelId).includes('finish');
