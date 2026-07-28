/* Kódolabky — katalóg príkazov.
   Level v JSON deklaruje len *schopnosti* (`palette: ["walk", "use"]`).
   Konkrétne príkazy z nich odvodí režim ovládania:
     absolute … ↑ ↓ ← →            (režim Šteniatko, 5–6 r.)
     relative … Vpred + otáčanie   (režim Záchranár, 7+) */

import { ICONS } from '../ui/icons.js';

export const COMMANDS = {
  move:      { label: 'Vpred',   countable: true,  icon: () => ICONS.arrow(0) },
  turnLeft:  { label: 'Vľavo',   countable: false, icon: () => ICONS.turnLeft() },
  turnRight: { label: 'Vpravo',  countable: false, icon: () => ICONS.turnRight() },

  north: { label: 'Hore',    countable: true, icon: () => ICONS.arrow(0) },
  east:  { label: 'Doprava', countable: true, icon: () => ICONS.arrow(90) },
  south: { label: 'Dole',    countable: true, icon: () => ICONS.arrow(180) },
  west:  { label: 'Doľava',  countable: true, icon: () => ICONS.arrow(270) },

  use:   { label: 'Použi',   countable: false, icon: () => ICONS.drop() },
};

const BY_ABILITY = {
  walk: { absolute: ['north', 'east', 'south', 'west'], relative: ['move', 'turnLeft', 'turnRight'] },
  use:  { absolute: ['use'], relative: ['use'] },
};

/** Zoznam príkazov v palete pre daný level a režim. */
export function paletteFor(level, mode) {
  const abilities = level.palette?.length ? level.palette : ['walk'];
  const out = [];
  for (const ability of abilities) {
    for (const cmd of BY_ABILITY[ability]?.[mode] ?? []) {
      if (!out.includes(cmd)) out.push(cmd);
    }
  }
  return out;
}

export const isCountable = (cmd) => Boolean(COMMANDS[cmd]?.countable);
export const labelOf = (cmd) => COMMANDS[cmd]?.label ?? cmd;
export const iconOf = (cmd) => COMMANDS[cmd]?.icon?.() ?? '';
