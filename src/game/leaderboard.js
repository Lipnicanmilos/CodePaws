/* Kódolabky — Rebríček.

   Rovnaké dáta, dve úložiská: kým nie je nastavená adresa Workera, drží sa
   rebríček v localStorage a platí pre toto zariadenie. Po nastavení adresy
   ide všetko na server a rebríček je spoločný. Zvyšok hry o tom nevie. */

import { SUPABASE_URL, SUPABASE_ANON_KEY, HALL_SIZE } from './config.js';
import { cleanNick } from './nick.js';

const LOCAL_KEY = 'codepaws.hall';

export const isGlobal = () => Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const authHeaders = () => ({
  apikey: SUPABASE_ANON_KEY,
  authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  'content-type': 'application/json',
});

/** Supabase vracia chybu z `raise exception` v poli `message`. */
async function failure(response) {
  const detail = await response.json().catch(() => ({}));
  return new Error(detail.message ?? detail.error ?? `Server odpovedal ${response.status}`);
}

/* ── Rebríček ───────────────────────────────────────────────────── */

/** Zoradí a oreže na HALL_SIZE. Pri rovnosti bodov je vyššie skorší zápis. */
export function topOf(entries) {
  return [...entries]
    .sort((a, b) => b.points - a.points || String(a.at).localeCompare(String(b.at)))
    .slice(0, HALL_SIZE);
}

/** Jeden hráč = jedna priečka, ale body sa PRIPOČÍTAVAJÚ: kto sa vráti a zahrá
    ďalšie kolo pod tou istou prezývkou, tomu priečka narastie. Preto sa posielajú
    len nové body (`progress.pendingPoints`), nie celý súčet — druhý zápis toho
    istého tak nepridá nič. Misie sú počet vyriešených levelov, tie sa neskladajú. */
export function mergeEntry(entries, entry) {
  const rest = entries.filter((e) => e.nick !== entry.nick);
  const previous = entries.find((e) => e.nick === entry.nick);
  const merged = previous
    ? { ...entry,
        points: previous.points + entry.points,
        missions: Math.max(previous.missions ?? 0, entry.missions ?? 0) }
    : entry;
  return topOf([...rest, merged]);
}

/* ── Úložisko ───────────────────────────────────────────────────── */

const readLocal = () => {
  try { return JSON.parse(localStorage.getItem(LOCAL_KEY) ?? '[]'); }
  catch { return []; }
};

const writeLocal = (entries) => {
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(entries)); } catch { /* súkromný režim */ }
  return entries;
};

export async function fetchTop() {
  if (!isGlobal()) return topOf(readLocal());

  const query = `select=nick,points,missions,dog,at&order=points.desc,at.asc&limit=${HALL_SIZE}`;
  const response = await fetch(`${SUPABASE_URL}/rest/v1/hall?${query}`, { headers: authHeaders() });
  if (!response.ok) throw await failure(response);
  return topOf(await response.json());
}

export async function submit({ nick, points, missions, dog = 'fifo' }) {
  const entry = {
    nick: cleanNick(nick),
    points: Math.max(0, Math.floor(points)),
    missions: Math.max(0, Math.floor(missions)),
    dog,
    at: new Date().toISOString().slice(0, 10),
  };

  if (!isGlobal()) return writeLocal(mergeEntry(readLocal(), entry));

  // Nezapisuje sa priamo do tabuľky — anon kľúč na to nemá právo.
  // Volá sa funkcia, ktorá si všetko overí sama a vráti nový rebríček.
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/submit_score`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      p_nick: entry.nick,
      p_points: entry.points,
      p_missions: entry.missions,
      p_dog: entry.dog,
    }),
  });
  if (!response.ok) throw await failure(response);
  return topOf(await response.json());
}
