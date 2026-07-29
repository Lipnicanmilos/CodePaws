/* Kódolabky — tabuľka príkazov („databáza“ plánu misie).
   Presúvanie je cez šípky ▲▼, nie drag & drop: na tablete je to spoľahlivejšie
   a funguje to aj z klávesnice. */

import { iconOf, labelOf } from '../game/commands.js';

export class TableView {
  constructor(bodyEl, emptyEl, handlers) {
    this.body = bodyEl;
    this.empty = emptyEl;
    this.handlers = handlers;
    this.rows = [];

    this.body.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-act]');
      if (!btn) return;
      const id = btn.closest('tr').dataset.id;
      const index = this.rows.findIndex((r) => r.id === id);
      switch (btn.dataset.act) {
        case 'del':  this.handlers.onDelete(index); break;
        case 'up':   this.handlers.onMove(index, -1); break;
        case 'down': this.handlers.onMove(index, 1); break;
      }
    });
  }

  /** `locked` = celý plán dal level a dieťa ho nemení (typ `predict`).
      `fixedOrder` = poradie je dané a mení sa len obsah (typ `debug`):
      zamknuté riadky (`row.locked`) sú bez akcií, ostatné majú len ✕ —
      presúvať sa nedá, vymeniť áno. */
  render(rows, { locked = false, fixedOrder = false } = {}) {
    this.rows = rows;
    this.locked = locked;
    this.body.replaceChildren();
    this.body.classList.toggle('is-locked', locked);
    this.empty.hidden = rows.length > 0;

    rows.forEach((row, i) => {
      const tr = document.createElement('tr');
      tr.dataset.id = row.id;

      const acts = (locked || row.locked)
        ? '<span class="rowlock" title="Tento riadok sa nemení" aria-hidden="true"></span>'
        : fixedOrder
        ? `<span class="rowacts">
            <button type="button" class="del" data-act="del" aria-label="Zmazať riadok">✕</button>
          </span>`
        : `<span class="rowacts">
            <button type="button" data-act="up" aria-label="Posunúť vyššie" ${i === 0 ? 'disabled' : ''}>▲</button>
            <button type="button" data-act="down" aria-label="Posunúť nižšie" ${i === rows.length - 1 ? 'disabled' : ''}>▼</button>
            <button type="button" class="del" data-act="del" aria-label="Zmazať riadok">✕</button>
          </span>`;

      tr.innerHTML = `
        <td><span class="rownum">${i + 1}</span></td>
        <td><span class="cmdcell">${iconOf(row.cmd)}<span>${labelOf(row.cmd)}</span></span></td>
        <td>${acts}</td>`;
      this.body.append(tr);
    });
  }

  /** Kurzor programu — ktorý riadok práve beží. */
  setCurrent(rowId) {
    for (const tr of this.body.rows) {
      tr.classList.toggle('is-current', tr.dataset.id === rowId);
    }
    const active = this.body.querySelector('tr.is-current');
    if (active) this.scrollRowIntoView(active);
  }

  /** Posúva LEN vnútri tabuľky, nie celou stránkou. `scrollIntoView` by na
      mobile pri každom kroku stiahol viewport dolu k tabuľke a dieťa by nevidelo
      psíka na trati. Preto meníme scrollTop kontajnera ručne. */
  scrollRowIntoView(tr) {
    const box = this.body.closest('.table-scroll');
    if (!box) return;
    const top = tr.offsetTop;
    const bottom = top + tr.offsetHeight;
    const pad = 8;
    if (top < box.scrollTop) box.scrollTop = top - pad;
    else if (bottom > box.scrollTop + box.clientHeight) box.scrollTop = bottom - box.clientHeight + pad;
  }

  markDone(rowId) {
    this.body.querySelector(`tr[data-id="${rowId}"]`)?.classList.add('is-done');
  }

  markBad(rowId) {
    this.body.querySelector(`tr[data-id="${rowId}"]`)?.classList.add('is-bad');
  }

  clearMarks() {
    for (const tr of this.body.rows) tr.classList.remove('is-current', 'is-done', 'is-bad');
  }
}
