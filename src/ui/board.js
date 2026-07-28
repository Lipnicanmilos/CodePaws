/* Kódolabky — vykreslenie bludiska. Iba prehráva udalosti z VM. */

import { DIR_ROT } from '../engine/world.js';
import { ICONS, dogSvg, CHARACTERS } from './icons.js';

const key = (x, y) => `${x},${y}`;

export class BoardView {
  constructor(el) {
    this.el = el;
    this.itemEls = new Map();
    this.actorEl = null;
  }

  render(world) {
    const { w, h } = world;
    this.el.style.setProperty('--cols', w);
    this.el.style.setProperty('--rows', h);
    this.el.classList.remove('is-won', 'is-error');
    this.el.replaceChildren();
    this.itemEls.clear();

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.dataset.tile = world.tileAt(x, y);
        if (world.tileAt(x, y) === 'goal') tile.innerHTML = ICONS.house();

        const item = world.itemAt(x, y);
        if (item) {
          const itemEl = document.createElement('span');
          itemEl.className = 'item';
          itemEl.dataset.item = item;
          itemEl.innerHTML = item === 'bone' ? ICONS.bone() : ICONS.fire();
          tile.append(itemEl);
          this.itemEls.set(key(x, y), itemEl);
        }
        this.el.append(tile);
      }
    }

    const actor = world.actor;
    const look = CHARACTERS[actor.char] ?? CHARACTERS.fifo;
    const actorEl = document.createElement('div');
    actorEl.className = 'actor is-idle';
    actorEl.innerHTML = `<div class="actor-body">${dogSvg(look)}</div>`;
    this.el.append(actorEl);
    this.actorEl = actorEl;
    this.bodyEl = actorEl.querySelector('.actor-body');
    this.place(actor);
  }

  place(actor) {
    this.actorEl.style.setProperty('--ax', actor.x);
    this.actorEl.style.setProperty('--ay', actor.y);
    this.bodyEl.style.setProperty('--arot', `${DIR_ROT[actor.dir]}deg`);
  }

  setSpeed(ms) { this.el.style.setProperty('--tick', `${Math.round(ms * 0.8)}ms`); }

  setRunning(on) { this.actorEl?.classList.toggle('is-idle', !on); }

  /** Prehrá jednu udalosť z VM. */
  play(event, world) {
    switch (event.type) {
      case 'move':
      case 'turn':
        this.place(world.actor);
        break;
      case 'collect':
      case 'extinguish': {
        const el = this.itemEls.get(key(event.x, event.y));
        if (el) {
          el.classList.add('is-gone');
          setTimeout(() => el.remove(), 340);
          this.itemEls.delete(key(event.x, event.y));
        }
        break;
      }
      case 'blocked':
        this.place(world.actor);
        this.flash(this.actorEl, 'is-bumped', 400);
        this.el.classList.add('is-error');
        break;
      case 'win':
        this.el.classList.add('is-won');
        this.flash(this.actorEl, 'is-happy', 1600);
        break;
      case 'lose':
      case 'error':
        this.el.classList.add('is-error');
        break;
    }
  }

  flash(el, cls, ms) {
    el.classList.remove(cls);
    void el.offsetWidth;          // reštart animácie
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), ms);
  }
}
