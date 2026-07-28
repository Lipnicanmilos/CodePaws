/* Kódolabky — paleta príkazov. Klik = pridá nový riadok do tabuľky. */

import { iconOf, labelOf } from '../game/commands.js';

export class PaletteView {
  constructor(el, onPick) {
    this.el = el;
    this.el.addEventListener('click', (e) => {
      const btn = e.target.closest('.cmdbtn');
      if (btn) onPick(btn.dataset.cmd);
    });
  }

  render(commands) {
    this.el.replaceChildren();
    for (const cmd of commands) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cmdbtn';
      btn.dataset.cmd = cmd;
      btn.innerHTML = `${iconOf(cmd)}<span>${labelOf(cmd)}</span>`;
      this.el.append(btn);
    }
  }
}
