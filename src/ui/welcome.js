/* Kódolabky — úvodné privítanie.

   Hra sa spustí až keď sa dieťa predstaví. Nie je to prihlásenie: prezývka
   nikam neodchádza, kým ju dieťa samo nezapíše do rebríčka. Ide o to, aby
   malo hru „svoju“ — a aby sa v rebríčku nemuselo vymýšľať meno druhýkrát. */

import * as progress from '../game/progress.js';
import { nickProblem, cleanNick } from '../game/nick.js';
import { CHARACTERS, dogSvg } from './icons.js';

export class WelcomeView {
  constructor() {
    this.box = document.getElementById('startBox');
    this.form = document.getElementById('startForm');
    this.input = document.getElementById('startNick');
    this.status = document.getElementById('startStatus');
    this.title = document.getElementById('startTitle');
    this.skip = document.getElementById('startSkip');
    this.dogs = document.getElementById('startDogs');
    this.buildDogs();
  }

  /** Šesť psíkov na výber — vybraný hrá v leveloch a ide aj do rebríčka. */
  buildDogs() {
    this.dogs.replaceChildren();
    for (const [id, look] of Object.entries(CHARACTERS)) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'startdog';
      btn.dataset.char = id;
      btn.setAttribute('role', 'radio');
      btn.setAttribute('aria-checked', 'false');
      btn.innerHTML = `${dogSvg(look)}<span class="startdog-name">${look.name}</span>`;
      btn.addEventListener('click', () => this.selectDog(id, true));
      this.dogs.append(btn);
    }
  }

  selectDog(id, byUser = false) {
    if (byUser) this.userPicked = true;
    this.selected = CHARACTERS[id] ? id : 'fifo';
    for (const btn of this.dogs.children) {
      const on = btn.dataset.char === this.selected;
      btn.classList.toggle('is-on', on);
      btn.setAttribute('aria-checked', String(on));
    }
  }

  /** Okno sa ukáže pri KAŽDOM spustení hry — dieťa sa vždy predstaví. Poslednú
      prezývku predvyplníme, takže kto sa vracia, len potvrdí „Poď hrať“.
      `change` = mení sa počas hry (cez rebríček); vtedy sa dá aj cúvnuť.
      Vráti prezývku, alebo null keď dieťa cúvlo. */
  ask({ change = false } = {}) {
    this.title.textContent = change ? 'Nová prezývka' : 'Ako ti máme hovoriť?';
    this.input.value = progress.getNick() ?? '';
    this.status.textContent = '';
    this.skip.hidden = !change;
    this.userPicked = false;
    this.selectDog(progress.getChar());             // predvyber psíka posledného hráča
    this.input.dispatchEvent(new Event('input'));   // hneď ukáž náhľad prezývky

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
        const nick = progress.setNick(this.input.value);
        // Psík patrí hráčovi, nie zariadeniu. Vracajúcemu sa hráčovi sa jeho
        // psík neprepíše, pokiaľ si v tomto okne výslovne nevybral iného.
        if (this.userPicked || !progress.charFor(nick)) progress.setChar(this.selected);
        finish(nick);
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
      // Vracajúci sa hráč hneď vidí svojho psíka — kým si sám nevyberie iného.
      if (!this.userPicked) {
        const saved = progress.charFor(this.input.value);
        if (saved) this.selectDog(saved);
      }
    });
  }
}
