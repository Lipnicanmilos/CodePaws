/* Kódolabky — spojenie enginu a UI. */

import { World, DIR_LABEL } from '../engine/world.js';
import { VM, DEFAULT_STEP_LIMIT } from '../engine/vm.js';
import { newRow, countRows, cloneRows, moveRow, rowLimitFor } from '../engine/program.js';
import { paletteFor } from './commands.js';
import { BoardView } from '../ui/board.js';
import { TableView } from '../ui/table.js';
import { PaletteView } from '../ui/palette.js';
import { ICONS } from '../ui/icons.js';
import * as progress from './progress.js';

const $ = (id) => document.getElementById(id);

const DIR_GLYPH = { N: '▲', E: '▶', S: '▼', W: '◀' };

const MESSAGES = {
  wall: 'Au! Tam je stena. Pozri sa na červený riadok.',
  fire: 'Cez oheň sa prejsť nedá — najprv ho uhas.',
  stepLimit: 'Plán beží donekonečna. Skús ho skrátiť.',
  notFinished: 'Plán sa minul, ale búdka je ešte ďaleko.',
  nothing: 'Tu nie je nič, čo by sa dalo použiť.',
};

class Game {
  constructor(levels) {
    this.levels = levels;
    this.index = 0;
    this.mode = progress.getSetting('mode') ?? 'absolute';
    this.speed = progress.getSetting('speed') ?? 330;
    this.rows = [];
    this.vm = null;
    this.timer = null;
    this.fails = 0;

    this.board = new BoardView($('board'));
    this.palette = new PaletteView($('palette'), (cmd) => this.addRow(cmd));
    this.table = new TableView($('programBody'), $('emptyHint'), {
      onDelete: (i) => this.editRows(this.rows.filter((_, k) => k !== i)),
      onMove: (i, d) => this.editRows(moveRow(this.rows, i, d)),
    });

    this.bindUI();
    this.buildPicker();
    this.loadLevel(0);
  }

  get level() { return this.levels[this.index]; }

  // ── UI ────────────────────────────────────────────────────────

  bindUI() {
    $('btnRun').addEventListener('click', () => this.run());
    $('btnStep').addEventListener('click', () => this.singleStep());
    $('btnReset').addEventListener('click', () => this.resetRun());

    $('prevLevel').addEventListener('click', () => this.loadLevel(this.index - 1));
    $('nextLevel').addEventListener('click', () => this.loadLevel(this.index + 1));
    $('levelPicker').addEventListener('change', (e) => this.loadLevel(Number(e.target.value)));

    const toggle = $('modeToggle');
    toggle.checked = this.mode === 'relative';
    toggle.addEventListener('change', () => {
      this.mode = toggle.checked ? 'relative' : 'absolute';
      progress.setSetting('mode', this.mode);
      this.loadLevel(this.index);
    });

    for (const btn of document.querySelectorAll('.speedbtn')) {
      btn.classList.toggle('is-on', Number(btn.dataset.speed) === this.speed);
      btn.addEventListener('click', () => {
        this.speed = Number(btn.dataset.speed);
        progress.setSetting('speed', this.speed);
        for (const b of document.querySelectorAll('.speedbtn')) b.classList.toggle('is-on', b === btn);
        this.board.setSpeed(this.speed);
      });
    }

    $('winRetry').addEventListener('click', () => { $('winBox').close(); this.resetRun(); });
    $('winNext').addEventListener('click', () => {
      $('winBox').close();
      this.loadLevel(Math.min(this.index + 1, this.levels.length - 1));
    });
  }

  buildPicker() {
    const picker = $('levelPicker');
    picker.replaceChildren();
    this.levels.forEach((lvl, i) => {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `${lvl.id} · ${lvl.title}${progress.isSolved(lvl.id) ? ' ✓' : ''}`;
      picker.append(opt);
    });
  }

  // ── Level ─────────────────────────────────────────────────────

  loadLevel(index) {
    if (index < 0 || index >= this.levels.length) return;
    this.stopTimer();
    this.index = index;
    this.fails = 0;
    this.rows = [];
    this.world = new World(this.level);
    this.vm = null;

    $('levelPicker').value = String(index);
    $('prevLevel').disabled = index === 0;
    $('nextLevel').disabled = index === this.levels.length - 1;
    $('levelTitle').textContent = this.level.title;
    $('levelStory').textContent = this.level.story ?? '';
    $('hintBar').hidden = true;

    this.board.render(this.world);
    this.board.setSpeed(this.speed);
    this.palette.render(paletteFor(this.level, this.mode));
    this.renderStars(progress.starsFor(this.level.id));
    this.editRows([]);
  }

  // ── Plán ──────────────────────────────────────────────────────

  addRow(cmd) {
    if (this.isRunning) return;
    this.editRows([...this.rows, newRow(cmd)]);
  }

  editRows(rows) {
    this.rows = rows;
    this.resetWorld();
    this.table.render(this.rows);
    this.updateRowCount();
    this.updateState();
  }

  updateRowCount() {
    const used = countRows(this.rows);
    const limit = rowLimitFor(this.level.stars?.find((s) => s.id === 'rows'), this.mode);
    const el = $('rowCount');
    el.textContent = limit ? `${used} / ${limit} riadkov` : `${used} riadkov`;
    el.classList.toggle('is-over', Boolean(limit) && used > limit);
  }

  // ── Beh ───────────────────────────────────────────────────────

  get isRunning() { return this.timer !== null; }

  resetWorld() {
    this.stopTimer();
    this.world.reset();
    this.vm = null;
    this.board.render(this.world);
    this.table.clearMarks();
    this.updateState();
  }

  resetRun() {
    this.resetWorld();
    this.table.render(this.rows);
    document.body.classList.remove('is-running');
    this.updateState();
  }

  ensureVM() {
    if (this.vm && !this.vm.done) return this.vm;
    this.resetWorld();
    this.table.render(this.rows);
    this.vm = new VM(this.world, cloneRows(this.rows), {
      stepLimit: this.level.limits?.steps ?? DEFAULT_STEP_LIMIT,
    });
    return this.vm;
  }

  run() {
    if (!this.rows.length) return this.toast('Najprv pridaj aspoň jeden príkaz.', true);
    if (this.isRunning) { this.stopTimer(); return; }
    const vm = this.ensureVM();
    if (vm.done) return;
    document.body.classList.add('is-running');
    this.board.setRunning(true);
    $('btnRun').innerHTML = '<span class="key-glyph" aria-hidden="true">❚❚</span><span class="key-word">Pauza</span>';
    this.timer = setInterval(() => this.tick(), this.speed);
    this.tick();
  }

  singleStep() {
    if (!this.rows.length) return this.toast('Najprv pridaj aspoň jeden príkaz.', true);
    this.stopTimer();
    const vm = this.ensureVM();
    if (!vm.done) this.tick();
  }

  tick() {
    const events = this.vm.step();
    for (const ev of events) this.applyEvent(ev);
    this.updateState();
    if (this.vm.done) this.stopTimer();
  }

  stopTimer() {
    if (this.timer !== null) clearInterval(this.timer);
    this.timer = null;
    this.board.setRunning?.(false);
    document.body.classList.remove('is-running');
    const btn = $('btnRun');
    if (btn) btn.innerHTML = '<span class="key-glyph" aria-hidden="true">▶</span><span class="key-word">Štart</span>';
  }

  applyEvent(ev) {
    this.board.play(ev, this.world);
    switch (ev.type) {
      case 'row': this.table.setCurrent(ev.rowId); break;
      case 'rowDone': this.table.markDone(ev.rowId); break;
      case 'nothing': this.toast(MESSAGES.nothing, true); break;
      case 'blocked':
        this.table.markBad(ev.rowId);
        this.fail(MESSAGES[ev.code] ?? MESSAGES.wall);
        break;
      case 'lose':
      case 'error':
        if (ev.rowId) this.table.markBad(ev.rowId);
        this.fail(MESSAGES[ev.code] ?? 'Skús to inak.');
        break;
      case 'win': this.win(); break;
    }
  }

  fail(message) {
    this.fails += 1;
    this.toast(message, true);
    if (this.fails >= 2 && this.level.hint) {
      $('hintBar').textContent = `Tip: ${this.level.hint}`;
      $('hintBar').hidden = false;
    }
  }

  // ── Výsledok ──────────────────────────────────────────────────

  earnedStars() {
    const stars = ['finish'];
    const rowStar = this.level.stars?.find((s) => s.id === 'rows');
    const limit = rowLimitFor(rowStar, this.mode);
    if (limit && countRows(this.rows) <= limit) stars.push('rows');
    if (this.world.totalBones > 0 && this.world.bonesCollected() === this.world.totalBones) stars.push('bones');
    else if (this.world.totalBones === 0) stars.push('bones');
    return stars;
  }

  win() {
    document.body.classList.add('is-celebrating');
    setTimeout(() => document.body.classList.remove('is-celebrating'), 2400);

    const stars = this.earnedStars();
    const all = progress.recordStars(this.level.id, stars);
    this.renderStars(all);
    this.buildPicker();
    $('levelPicker').value = String(this.index);

    const limit = rowLimitFor(this.level.stars?.find((s) => s.id === 'rows'), this.mode);
    const items = [
      ['finish', 'Misia splnená'],
      ['rows', limit ? `Plán má najviac ${limit} riadkov` : 'Krátky plán'],
      ['bones', `Pozbierané všetky kosti (${this.world.totalBones})`],
    ];
    $('winTitle').textContent = stars.length === 3 ? 'Perfektná misia!' : 'Misia splnená!';
    $('winStars').innerHTML = boneRow(stars.length);
    $('winList').innerHTML = items
      .map(([id, text]) => `<li class="${stars.includes(id) ? 'got' : ''}">${text}</li>`)
      .join('');
    $('winNext').disabled = this.index >= this.levels.length - 1;
    setTimeout(() => $('winBox').showModal(), 900);
  }

  renderStars(stars) {
    $('starRow').innerHTML = boneRow(stars.length);
  }

  // ── Panel stavu ───────────────────────────────────────────────

  updateState() {
    const a = this.world.actor;
    $('stPos').textContent = `${a.x + 1}·${a.y + 1}`;
    $('stDir').textContent = `${DIR_GLYPH[a.dir]} ${DIR_LABEL[a.dir]}`;
    $('stBones').textContent = `${this.world.bonesCollected()}/${this.world.totalBones}`;
  }

  toast(message, bad = false) {
    const el = $('toast');
    el.textContent = message;
    el.classList.toggle('is-bad', bad);
    el.hidden = false;
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => { el.hidden = true; }, 2600);
  }
}

const boneRow = (got) =>
  [0, 1, 2].map((i) => `<span class="bone ${i < got ? 'is-on' : ''}">${ICONS.bone()}</span>`).join('');

// ── Štart ───────────────────────────────────────────────────────

async function boot() {
  const manifest = await (await fetch('levels/index.json')).json();
  const levels = await Promise.all(
    manifest.levels.map(async (path) => (await fetch(`levels/${path}`)).json())
  );
  new Game(levels);
}

boot().catch((err) => {
  document.getElementById('levelStory').textContent =
    'Levely sa nepodarilo načítať. Hru treba spustiť cez lokálny server (pozri README).';
  console.error(err);
});
