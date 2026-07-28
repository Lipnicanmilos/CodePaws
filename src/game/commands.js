/* Kódolabky — katalóg príkazov.
   Level v JSON deklaruje len *schopnosti* (`palette: ["walk", "use"]`).
   Konkrétne príkazy z nich odvodí režim ovládania:
     absolute … ↑ ↓ ← →            (režim Šteniatko, 5–6 r.)
     relative … Vpred + otáčanie   (režim Záchranár, 7+) */

import { ICONS } from '../ui/icons.js';

/* Jeden riadok tabuľky = jeden krok. Príkazy zámerne nemajú počet opakovaní:
   „choď trikrát hore“ sa píše ako tri riadky. Skrátiť sa to bude dať až
   cyklom `Opakuj` v Svete 2 — a práve to má byť ten aha-moment. */

export const COMMANDS = {
  move:      { label: 'Vpred',   icon: () => ICONS.arrow(0) },
  turnLeft:  { label: 'Vľavo',   icon: () => ICONS.turnLeft() },
  turnRight: { label: 'Vpravo',  icon: () => ICONS.turnRight() },

  north: { label: 'Hore',    icon: () => ICONS.arrow(0) },
  east:  { label: 'Doprava', icon: () => ICONS.arrow(90) },
  south: { label: 'Dole',    icon: () => ICONS.arrow(180) },
  west:  { label: 'Doľava',  icon: () => ICONS.arrow(270) },

  use:   { label: 'Použi',   icon: () => ICONS.drop() },
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

export const labelOf = (cmd) => COMMANDS[cmd]?.label ?? cmd;
export const iconOf = (cmd) => COMMANDS[cmd]?.icon?.() ?? '';
