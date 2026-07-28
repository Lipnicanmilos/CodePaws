/* Kódolabky — model tabuľky príkazov.
   Riadky sú polia objektov; `body` sa použije až pri `Opakuj` a `Ak` (Etapa 3). */

let seq = 0;

/** Jeden riadok = jeden krok. Žiadny počet opakovaní. */
export function newRow(cmd) {
  return { id: `r${++seq}`, cmd };
}

/** Rozbalí zápis `{cmd, n}` na n samostatných riadkov.
    Používa sa na referenčné riešenia v leveloch, aby sa v JSON dali písať krátko. */
export function expandRows(rows) {
  return rows.flatMap(({ cmd, n = 1 }) => Array.from({ length: n }, () => newRow(cmd)));
}

/** Počet riadkov vrátane vnorených — to je to, čo sa porovnáva s limitom. */
export function countRows(rows) {
  return rows.reduce((sum, r) => sum + 1 + (r.body ? countRows(r.body) : 0), 0);
}

export function findRow(rows, id) {
  for (const row of rows) {
    if (row.id === id) return row;
    if (row.body) {
      const hit = findRow(row.body, id);
      if (hit) return hit;
    }
  }
  return null;
}

/** Hlboká kópia — VM mení `n` a `pc`, plán hráča musí zostať nedotknutý. */
export const cloneRows = (rows) => rows.map((r) => ({ ...r, ...(r.body ? { body: cloneRows(r.body) } : {}) }));

export function moveRow(rows, index, delta) {
  const target = index + delta;
  if (target < 0 || target >= rows.length) return rows;
  const copy = rows.slice();
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
}

/** Limit riadkov môže byť číslo alebo hodnota podľa režimu ovládania. */
export function rowLimitFor(star, mode) {
  if (star?.max == null) return null;
  return typeof star.max === 'object' ? star.max[mode] ?? null : star.max;
}
