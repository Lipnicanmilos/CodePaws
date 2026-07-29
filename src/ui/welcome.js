/* Kódolabky — úvodné privítanie.

   Hra sa spustí až keď sa dieťa predstaví. Nie je to prihlásenie: prezývka
   nikam neodchádza, kým ju dieťa samo nezapíše do rebríčka. Ide o to, aby
   malo hru „svoju“ — a aby sa v rebríčku nemuselo vymýšľať meno druhýkrát. */

import * as progress from '../game/progress.js';
import { nickProblem, cleanNick } from '../game/nick.js';

export class WelcomeView {
  constructor() {
    this.box = document.getElementById('startBox');
    this.form = document.getElementById('startForm');
    this.input = document.getElementById('startNick');
    this.status = document.getElementById('startStatus');
    this.title = document.getElementById('startTitle');
    this.skip = document.getElementById('startSkip');
  }

  /** `change` = prezývku mení niekto, kto už hrá; vtedy sa dá aj cúvnuť.
      Vráti novú prezývku, alebo null keď dieťa cúvlo. */
  ask({ change = false } = {}) {
    this.title.textContent = change ? 'Nová prezývka' : 'Ako ti máme hovoriť?';
    this.input.value = change ? (progress.getNick() ?? '') : '';
    this.status.textContent = '';
    this.skip.hidden = !change;

    return new Promise((resolve) => {
      const finish = (nick) => {
        this.form.removeEventListener('submit', onSubmit);
        this.skip.removeEventListener('click', onSkip);
        this.box.removeEventListener('cancel', onCancel);
        this.box.close();
        resolve(nick);
      };

      const onSubmit = (e) => {
        e.preventDefault();
        const problem = nickProblem(this.input.value);
        if (problem) {
          this.status.textContent = problem;
          this.input.focus();
          return;
        }
        finish(progress.setNick(this.input.value));
      };

      // Bez prezývky sa ďalej nedá — Escape na prvom spustení nič nerobí.
      const onCancel = (e) => { if (!change) e.preventDefault(); else finish(null); };
      const onSkip = () => finish(null);

      this.form.addEventListener('submit', onSubmit);
      this.skip.addEventListener('click', onSkip);
      this.box.addEventListener('cancel', onCancel);

      this.box.showModal();
      this.input.focus();
    });
  }

  /** Živý náhľad — dieťa hneď vidí, ako bude prezývka naozaj vyzerať. */
  bindPreview() {
    const preview = document.getElementById('startPreview');
    this.input.addEventListener('input', () => {
      preview.textContent = cleanNick(this.input.value) || '—';
    });
  }
}
