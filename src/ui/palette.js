/* Kódolabky — ovládací pult. Krížový D-pad, klik = nový krok v pláne.

   Krížové rozloženie nie je ozdoba: v absolútnom režime sedí smer klávesy
   presne na smer na mape, takže dieťa nemusí nič prekladať. V režime otáčania
   je hore „Vpred“ a po stranách otáčanie — to je pohľad psíka, nie mapy. */

import { iconOf, labelOf } from '../game/commands.js';
import { ICONS } from './icons.js';

const SLOT = {
  north: 'up', south: 'down', west: 'left', east: 'right',
  move: 'up', turnLeft: 'left', turnRight: 'right',
};

export class PaletteView {
  constructor(el, onPick) {
    this.el = el;
    this.el.addEventListener('click', (e) => {
      const btn = e.target.closest('.key[data-cmd]');
      if (!btn) return;
      this.punch(btn);
      onPick(btn.dataset.cmd);
    });
  }

  /** Krátke fyzické stlačenie aj pri ovládaní z klávesnice. */
  punch(btn) {
    btn.classList.add('is-hit');
    setTimeout(() => btn.classList.remove('is-hit'), 110);
  }

  key(cmd, cls) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `key ${cls}`;
    btn.dataset.cmd = cmd;
    if (SLOT[cmd]) btn.dataset.slot = SLOT[cmd];
    btn.innerHTML = `${iconOf(cmd)}<span class="key-word">${labelOf(cmd)}</span>`;
    return btn;
  }

  render(commands) {
    this.el.replaceChildren();

    const pad = document.createElement('div');
    pad.className = 'pad';
    const emblem = document.createElement('span');
    emblem.className = 'pad-emblem';
    emblem.setAttribute('aria-hidden', 'true');
    emblem.innerHTML = ICONS.paw();
    pad.append(emblem);

    for (const cmd of commands) {
      if (SLOT[cmd]) pad.append(this.key(cmd, 'key-pad'));
    }
    this.el.append(pad);

    // `Použi` nie je pohyb, tak nesedí do kríža — dostáva vlastnú širokú klávesu.
    if (commands.includes('use')) this.el.append(this.key('use', 'key-use'));
  }
}
