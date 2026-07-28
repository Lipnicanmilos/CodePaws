/* Kódolabky — Sieň slávy.

   Rovnaké dáta, dve úložiská: kým nie je nastavená adresa Workera, drží sa
   rebríček v localStorage a platí pre toto zariadenie. Po nastavení adresy
   ide všetko na server a rebríček je spoločný. Zvyšok hry o tom nevie. */

import { SUPABASE_URL, SUPABASE_ANON_KEY, HALL_SIZE } from './config.js';

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

/* ── Prezývka ───────────────────────────────────────────────────
   Prezývka je jediné, čo o hráčovi ukladáme, a zámerne nemá byť meno.
   Preto krátka, bez interpunkcie a bez zjavných vulgarizmov. */

const BLOCKED = [
  'kokot', 'kurva', 'piced', 'picus', 'jebo', 'jebn', 'sral', 'sracka', 'hovno',
  'debil', 'idiot', 'kretén', 'kreten', 'mrdk', 'mrda', 'buzer', 'cigan',
  'fuck', 'shit', 'bitch', 'cunt', 'dick', 'nigg', 'rape', 'nazi', 'hitler',
];

export function cleanNick(text) {
  return (text ?? '')
    .toLocaleUpperCase('sk-SK')
    .replace(/[^\p{L}\p{N} -]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 10);
}

/** Vráti dôvod, prečo prezývka neprejde, alebo null keď je v poriadku. */
export function nickProblem(text) {
  const nick = cleanNick(text);
  if (nick.length < 2) return 'Prezývka musí mať aspoň dve písmená.';
  const flat = nick.toLocaleLowerCase('sk-SK').replace(/[^a-z0-9]/g, '');
  if (BLOCKED.some((bad) => flat.includes(bad))) return 'Takúto prezývku sem nedáme. Skús inú.';
  return null;
}

/* ── Rebríček ───────────────────────────────────────────────────── */

/** Zoradí a oreže na HALL_SIZE. Pri rovnosti bodov je vyššie skorší zápis. */
export function topOf(entries) {
  return [...entries]
    .sort((a, b) => b.points - a.points || String(a.at).localeCompare(String(b.at)))
    .slice(0, HALL_SIZE);
}

/** Jeden hráč = jedna priečka; nový zápis nahradí starý, len ak je lepší. */
export function mergeEntry(entries, entry) {
  const rest = entries.filter((e) => e.nick !== entry.nick);
  const previous = entries.find((e) => e.nick === entry.nick);
  const best = previous && previous.points >= entry.points ? previous : entry;
  return topOf([...rest, best]);
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

  const query = `select=nick,points,missions,at&order=points.desc,at.asc&limit=${HALL_SIZE}`;
  const response = await fetch(`${SUPABASE_URL}/rest/v1/hall?${query}`, { headers: authHeaders() });
  if (!response.ok) throw await failure(response);
  return topOf(await response.json());
}

export async function submit({ nick, points, missions }) {
  const entry = {
    nick: cleanNick(nick),
    points: Math.max(0, Math.floor(points)),
    missions: Math.max(0, Math.floor(missions)),
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
    }),
  });
  if (!response.ok) throw await failure(response);
  return topOf(await response.json());
}
