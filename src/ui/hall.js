/* Kódolabky — Rebríček: pätnásť najlepších a zápis do nej. */

import * as hall from '../game/leaderboard.js';
import * as progress from '../game/progress.js';

export class HallView {
  constructor() {
    this.box = document.getElementById('hallBox');
    this.body = document.getElementById('hallBody');
    this.note = document.getElementById('hallNote');
    this.status = document.getElementById('hallStatus');
    this.input = document.getElementById('hallNick');

    document.getElementById('hallOpen').addEventListener('click', () => this.open());
    document.getElementById('hallClose').addEventListener('click', () => this.box.close());
    document.getElementById('hallForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.send();
    });
  }

  async open() {
    const profile = progress.activeProfile();
    const { points, missions } = progress.totals(profile);
    this.pending = { points, missions };

    this.input.value = hall.cleanNick(profile.callsign);
    this.note.textContent = hall.isGlobal()
      ? 'Rebríček je spoločný pre všetkých, čo hru hrajú.'
      : 'Rebríček je zatiaľ len na tomto zariadení.';
    this.say(`Zapíšeš ${points} bodov za ${missions} ${plural(missions)}.`);
    this.box.showModal();
    await this.load();
  }

  async load() {
    this.renderMessage('Načítavam…');
    try {
      this.render(await hall.fetchTop());
    } catch (err) {
      this.renderMessage('Rebríček sa teraz nedá načítať. Skús o chvíľu.');
      console.error(err);
    }
  }

  async send() {
    const problem = hall.nickProblem(this.input.value);
    if (problem) return this.say(problem, true);

    const button = document.getElementById('hallSend');
    button.disabled = true;
    this.say('Zapisujem…');
    try {
      const entries = await hall.submit({ nick: this.input.value, ...this.pending });
      this.lastNick = hall.cleanNick(this.input.value);
      this.render(entries);
      const place = entries.findIndex((e) => e.nick === this.lastNick);
      this.say(place >= 0
        ? `Zapísané — si na ${place + 1}. mieste.`
        : 'Zapísané, ale na prvých pätnásť to zatiaľ nestačilo.');
    } catch (err) {
      this.say(`Zápis sa nepodaril: ${err.message}`, true);
    } finally {
      button.disabled = false;
    }
  }

  render(entries) {
    this.body.replaceChildren();
    if (!entries.length) return this.renderMessage('Rebríček je zatiaľ prázdny. Buď prvý!');

    entries.forEach((entry, i) => {
      const tr = document.createElement('tr');
      if (entry.nick === this.lastNick) tr.className = 'is-me';
      tr.innerHTML = `
        <td class="hall-place">${i + 1}</td>
        <td class="hall-nick">${escapeHtml(entry.nick)}</td>
        <td class="num">${entry.points}</td>
        <td class="num">${entry.missions}</td>
        <td class="hall-date">${escapeHtml(entry.at ?? '')}</td>`;
      this.body.append(tr);
    });
  }

  renderMessage(text) {
    this.body.replaceChildren();
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="5" class="hall-empty">${escapeHtml(text)}</td>`;
    this.body.append(tr);
  }

  say(text, bad = false) {
    this.status.textContent = text;
    this.status.classList.toggle('is-bad', bad);
  }
}

const plural = (n) => (n === 1 ? 'misiu' : n >= 2 && n <= 4 ? 'misie' : 'misií');

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
