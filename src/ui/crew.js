/* Kódolabky — Hráči.
   Nie je to rebríček proti cudzím deťom, ale zoznam posádky na tomto zariadení:
   súrodenci alebo trieda, každý s vlastným volacím znakom a vlastným postupom.
   Nič sa nikam neposiela. */

import * as progress from '../game/progress.js';

export class CrewView {
  constructor(onSwitch) {
    this.onSwitch = onSwitch;
    this.box = document.getElementById('crewBox');
    this.body = document.getElementById('crewBody');

    document.getElementById('crewChip').addEventListener('click', () => this.open());
    document.getElementById('crewClose').addEventListener('click', () => this.box.close());

    document.getElementById('crewAdd').addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('crewInput');
      if (progress.addProfile(input.value)) {
        input.value = '';
        this.refresh();
      }
    });

    this.body.addEventListener('click', (e) => {
      const row = e.target.closest('tr[data-id]');
      if (!row) return;
      if (e.target.closest('[data-act="pick"]')) {
        progress.setActive(row.dataset.id);
        this.refresh();
      } else if (e.target.closest('[data-act="del"]')) {
        if (progress.removeProfile(row.dataset.id)) this.refresh();
      }
    });

    this.body.addEventListener('change', (e) => {
      if (e.target.matches('.crew-rename')) {
        progress.renameActive(e.target.value);
        this.refresh();
      }
    });
  }

  open() {
    this.render();
    this.box.showModal();
  }

  refresh() {
    this.render();
    this.renderChip();
    this.onSwitch();
  }

  render() {
    const activeId = progress.activeProfile().id;
    const rows = progress.roster();
    const soloCrew = rows.length === 1;

    this.body.replaceChildren();
    for (const entry of rows) {
      const isActive = entry.profile.id === activeId;
      const tr = document.createElement('tr');
      tr.dataset.id = entry.profile.id;
      if (isActive) tr.className = 'is-active';

      tr.innerHTML = `
        <td>${isActive
          ? `<input class="crew-rename" value="${escapeHtml(entry.profile.callsign)}"
                    maxlength="10" aria-label="Premenovať volací znak">`
          : `<button type="button" class="crew-pick" data-act="pick">${escapeHtml(entry.profile.callsign)}</button>`}</td>
        <td class="crew-rank">${entry.rank.name}</td>
        <td class="num">${entry.points}</td>
        <td class="num">${entry.missions}</td>
        <td><button type="button" class="crew-del" data-act="del" aria-label="Zmazať volací znak"
                    ${soloCrew ? 'disabled' : ''}>✕</button></td>`;
      this.body.append(tr);
    }
  }

  renderChip() {
    const profile = progress.activeProfile();
    const { points } = progress.totals(profile);
    const rank = progress.rankFor(points);
    document.getElementById('crewCall').textContent = profile.callsign;
    document.getElementById('crewPts').textContent = `${points} b`;
    document.getElementById('crewChip').title = `${rank.name} · ${points} bodov`;
  }
}

const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
