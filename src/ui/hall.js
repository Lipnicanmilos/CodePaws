/* Kódolabky — Rebríček: pätnásť najlepších a zápis do nej. */

import * as hall from '../game/leaderboard.js';
import * as progress from '../game/progress.js';
import { cleanNick, nickProblem } from '../game/nick.js';
import { CHARACTERS, dogSvg } from './icons.js';

export class HallView {
  constructor(onNickChange = () => {}) {
    this.onNickChange = onNickChange;
    this.box = document.getElementById('hallBox');
    this.body = document.getElementById('hallBody');
    this.note = document.getElementById('hallNote');
    this.status = document.getElementById('hallStatus');
    this.input = document.getElementById('hallNick');

    document.getElementById('hallClose').addEventListener('click', () => this.box.close());
    document.getElementById('hallForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.send();
    });
  }

  async open() {
    const { missions } = progress.totals();
    // Posielajú sa len body od posledného zápisu — v rebríčku sa pripočítajú.
    const points = progress.pendingPoints();
    this.pending = { points, missions, dog: progress.getChar() };

    this.input.value = cleanNick(progress.getNick() ?? '');
    this.note.textContent = hall.isGlobal()
      ? 'Rebríček je spoločný pre všetkých, čo hru hrajú.'
      : 'Rebríček je zatiaľ len na tomto zariadení.';
    this.say(points > 0
      ? `Máš ${points} nezapísaných bodov — pripíšu sa tlačidlom nižšie.`
      : 'Body sa pripočítavajú samé po každej dohratej misii.');
    this.box.showModal();
    await this.load();
  }

  async load() {
    this.renderMessage('Načítavam…');
    try {
      this.entries = await hall.fetchTop();
      this.render(this.entries);
    } catch (err) {
      this.entries = null;
      this.renderMessage('Rebríček sa teraz nedá načítať. Skús o chvíľu.');
      console.error(err);
    }
  }

  /** Koľko bodov má daná prezývka práve teraz na serveri (null = nie je v prvých 15). */
  serverPoints(nick, entries = this.entries) {
    return entries?.find((e) => e.nick === nick)?.points ?? null;
  }

  async send() {
    const problem = nickProblem(this.input.value);
    if (problem) return this.say(problem, true);
    // Bez nových bodov niet čo zapísať — a server by druhý rýchly zápis aj tak pribrzdil.
    if (!this.pending.points) {
      return this.say('Všetky body už v rebríčku sú. Zahraj ďalšiu misiu.');
    }

    const button = document.getElementById('hallSend');
    button.disabled = true;
    this.say('Zapisujem…');
    const sent = this.pending.points;
    const nick = cleanNick(this.input.value);
    const pointsBefore = this.serverPoints(nick);

    try {
      const entries = await hall.submit({ nick: this.input.value, ...this.pending });
      this.lastNick = nick;
      // Prezývka v rebríčku a prezývka v hre majú byť tá istá.
      progress.setNick(this.lastNick);
      // Zapísané body sa už druhýkrát nepripočítajú.
      progress.markSubmitted();
      this.pending = { points: 0, missions: this.pending.missions };
      this.onNickChange();
      this.entries = entries;
      this.render(entries);

      // Server prijal zápis, ale body nepribudli? Potom na Supabase beží stará
      // verzia funkcie (drží najvyššiu hodnotu namiesto pripočítania). Bez tejto
      // kontroly to vyzerá ako záhada — priečka sa proste nehýbe.
      const pointsAfter = this.serverPoints(nick, entries);
      if (sent > 0 && pointsBefore !== null && pointsAfter !== null && pointsAfter <= pointsBefore) {
        return this.say(
          `Zápis prešiel, ale rebríček ${sent} bodov nepripočítal. Na serveri zrejme ` +
          'beží stará verzia funkcie — spusti znova server/supabase.sql.', true);
      }

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
      const look = CHARACTERS[entry.dog] ?? CHARACTERS.fifo;
      tr.innerHTML = `
        <td class="hall-place">${i + 1}</td>
        <td class="hall-nick"><span class="hall-dog" title="${look.name}">${dogSvg(look)}</span>${escapeHtml(entry.nick)}</td>
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
