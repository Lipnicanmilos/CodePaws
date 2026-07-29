/* Kódolabky — spojenie enginu a UI. */

import { World, DIR_LABEL } from '../engine/world.js';
import { VM, DEFAULT_STEP_LIMIT } from '../engine/vm.js';
import { newRow, countRows, cloneRows, moveRow, rowLimitFor, expandRows } from '../engine/program.js';
import { paletteFor } from './commands.js';
import { BoardView } from '../ui/board.js';
import { TableView } from '../ui/table.js';
import { PaletteView } from '../ui/palette.js';
import { HallView } from '../ui/hall.js';
import { WelcomeView } from '../ui/welcome.js';
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
  constructor(levels, welcome) {
    this.levels = levels;
    this.welcome = welcome;
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

    this.hall = new HallView(() => this.renderChip());
    this.renderChip();

    this.bindUI();
    this.buildPicker();
    this.loadLevel(0);
  }

  get level() { return this.levels[this.index]; }

  /** Level typu „Predpoveď“ — plán je hotový a zamknutý, dieťa najprv ukáže,
      kde podľa neho pes zastane, a až potom sa program spustí. */
  get isPredict() { return this.level.type === 'predict'; }

  /** Ktoré ocenenia sa v tomto leveli vôbec dajú získať. Riadi aj počet
      kostičiek — dve z dvoch má vyzerať ako plný počet, nie ako 2/3. */
  levelAwardIds() {
    return this.isPredict ? ['finish', 'predict'] : ['finish', 'rows', 'bones', 'clean'];
  }

  /** `clean` je bonus navyše, kostičku za seba nedáva. */
  boneIds() { return this.levelAwardIds().filter((id) => id !== 'clean'); }

  // ── UI ────────────────────────────────────────────────────────

  bindUI() {
    $('btnRun').addEventListener('click', () => this.run());
    $('btnStep').addEventListener('click', () => this.singleStep());
    $('btnReset').addEventListener('click', () => this.clearPlan());

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

    // Rebríček je jediné okno navyše — odznak hráča vedie rovno doň.
    $('playerChip').addEventListener('click', () => this.hall.open());

    // Zápis do rebríčka sa ponúka presne vtedy, keď body pribudnú —
    // nie schovaný o dve okná ďalej.
    $('hallFromWin').addEventListener('click', () => {
      $('winBox').close();
      this.hall.open();
    });

    $('hallRename').addEventListener('click', async () => {
      $('hallBox').close();
      if (await this.welcome.ask({ change: true })) this.renderChip();
      this.hall.open();
    });

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
    this.guess = null;
    this.guessRight = false;
    this.guessTries = 0;

    $('levelPicker').value = String(index);
    $('prevLevel').disabled = index === 0;
    $('nextLevel').disabled = index === this.levels.length - 1;
    $('levelTitle').textContent = this.level.title;
    $('levelStory').textContent = this.level.story ?? '';
    $('hintBar').hidden = true;

    $('plateLabel').textContent = this.isPredict ? 'Kde zastane?' : 'Naplánuj krok';

    this.board.render(this.world);
    this.board.setSpeed(this.speed);
    this.renderStars(progress.awardsFor(this.level.id));

    if (this.isPredict) this.startPredict();
    else {
      this.board.setGuessMode(null);
      this.palette.render(paletteFor(this.level, this.mode));
      this.editRows([]);
    }
  }

  /** Rozbehne level typu „Predpoveď“: plán z levelu, zamknutá tabuľka,
      pult bez kláves a doska, do ktorej sa dá klikať. */
  startPredict() {
    this.palette.note('Plán je hotový. Klikni do bludiska na políčko, kde podľa teba pes zastane.');
    this.board.setGuessMode((x, y) => this.pickGuess(x, y));

    this.rows = expandRows(this.level.preset?.[this.mode] ?? []);
    this.resetWorld();
    this.renderTable();
    this.updateRowCount();
    $('btnReset').disabled = true;
    this.updateTransport();
  }

  pickGuess(x, y) {
    if (this.isRunning || this.vm) return;      // po spustení sa tip už nemení
    const first = this.guess === null;
    this.guess = { x, y };
    this.board.setGuess(x, y);
    this.updateState();
    this.updateTransport();
    if (first) this.toast('Tip zapísaný. Teraz stlač ▶ Štart a uvidíš.');
  }

  /** Bez tipu sa program nedá spustiť — inak by si dieťa odpoveď len pozrelo. */
  updateTransport() {
    const waiting = this.isPredict && !this.guess;
    $('btnRun').disabled = waiting;
    $('btnStep').disabled = waiting;
  }

  renderTable() { this.table.render(this.rows, { locked: this.isPredict }); }

  // ── Plán ──────────────────────────────────────────────────────

  addRow(cmd) {
    if (this.isRunning || this.isPredict) return;
    this.editRows([...this.rows, newRow(cmd)]);
  }

  editRows(rows) {
    this.rows = rows;
    this.resetWorld();
    this.renderTable();
    this.updateRowCount();
    this.updateState();
    this.updateTransport();
    $('btnReset').disabled = this.rows.length === 0;
  }

  /** Zmaže celý plán a dieťa ho skladá odznova.
      Vrátiť psíka na štart netreba riešiť zvlášť — ▶ Štart aj úprava
      ktoréhokoľvek riadku svet resetujú samy. */
  clearPlan() {
    if (!this.rows.length || this.isPredict) return;
    this.stopTimer();
    this.editRows([]);
    this.toast('Plán je prázdny. Poskladaj ho nanovo.');
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
    // Nový pokus v Predpovedi znamená aj nový tip — starý je už prezradený.
    if (this.isPredict) this.board.setGuessMode((x, y) => this.pickGuess(x, y));
    this.guess = null;
    this.renderTable();
    document.body.classList.remove('is-running');
    this.updateState();
    this.updateTransport();
  }

  ensureVM() {
    if (this.vm && !this.vm.done) return this.vm;
    this.resetWorld();
    this.renderTable();
    this.vm = new VM(this.world, cloneRows(this.rows), {
      stepLimit: this.level.limits?.steps ?? DEFAULT_STEP_LIMIT,
    });
    return this.vm;
  }

  run() {
    if (!this.canStart()) return;
    if (this.isRunning) { this.stopTimer(); return; }
    const vm = this.ensureVM();
    if (vm.done) return;
    document.body.classList.add('is-running');
    this.board.reveal();
    this.board.setRunning(true);
    $('btnRun').innerHTML = '<span class="key-glyph" aria-hidden="true">❚❚</span><span class="key-word">Pauza</span>';
    this.timer = setInterval(() => this.tick(), this.speed);
    this.tick();
  }

  /** Spoločná vstupná kontrola pre ▶ Štart aj ⏭ Krok. */
  canStart() {
    if (this.isPredict && !this.guess) {
      this.toast('Najprv klikni na políčko, kde podľa teba pes zastane.', true);
      return false;
    }
    if (!this.rows.length) {
      this.toast('Najprv pridaj aspoň jeden príkaz.', true);
      return false;
    }
    return true;
  }

  singleStep() {
    if (!this.canStart()) return;
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

  /** Ocenenia za práve dokončený level. `clean` je bonus za to, že plán
      vyšiel bez jediného nárazu — teda za premyslenie pred spustením. */
  earnedAwards() {
    // V Predpovedi je plán daný, takže „krátky plán“ ani „bez nárazu“ nie sú
    // zásluha dieťaťa. Ráta sa jediné: trafil tip, alebo nie.
    if (this.isPredict) {
      return this.guessRight && this.guessTries === 1 ? ['finish', 'predict'] : ['finish'];
    }

    const awards = ['finish'];
    const limit = rowLimitFor(this.level.stars?.find((s) => s.id === 'rows'), this.mode);
    if (limit && countRows(this.rows) <= limit) awards.push('rows');
    if (this.world.bonesCollected() === this.world.totalBones) awards.push('bones');
    if (this.fails === 0) awards.push('clean');
    return awards;
  }

  win() {
    document.body.classList.add('is-celebrating');
    setTimeout(() => document.body.classList.remove('is-celebrating'), 2400);

    if (this.isPredict) this.judgeGuess();

    const before = progress.totals().points;
    const awards = this.earnedAwards();
    const all = progress.recordResult(this.level.id, awards);
    const after = progress.totals().points;

    this.renderStars(all);
    this.renderChip();
    this.buildPicker();
    $('levelPicker').value = String(this.index);

    const limit = rowLimitFor(this.level.stars?.find((s) => s.id === 'rows'), this.mode);
    const text = {
      finish: this.isPredict ? 'Program dobehol' : 'Misia splnená',
      predict: 'Trafil si políčko hneď prvým tipom',
      rows: limit ? `Plán má najviac ${limit} riadkov` : 'Krátky plán',
      bones: `Pozbierané všetky kosti (${this.world.totalBones})`,
      clean: 'Bez jediného nárazu',
    };

    const ids = this.levelAwardIds();
    const boneIds = this.boneIds();
    const bones = all.filter((a) => boneIds.includes(a)).length;

    $('winTitle').textContent = this.predictTitle() ??
      (awards.length === 4 ? 'Bezchybná misia!' : 'Misia splnená!');
    $('winStars').innerHTML = boneRow(bones, boneIds.length);
    $('winList').innerHTML = progress.AWARDS
      .filter(({ id }) => ids.includes(id))
      .map(({ id, points }) =>
        `<li class="${awards.includes(id) ? 'got' : ''}">${text[id]}<span class="pts">+${points}</span></li>`)
      .join('');

    const gained = after - before;
    const rank = progress.rankFor(after);
    const next = progress.nextRank(after);
    $('winScore').innerHTML = gained > 0
      ? `<strong>+${gained} bodov</strong> · ${rank.name}` +
        (next ? ` <span class="toNext">(do hodnosti ${next.name} chýba ${next.at - after})</span>` : '')
      : `Tento level už máš vybodovaný · ${rank.name}`;

    $('winNext').disabled = this.index >= this.levels.length - 1;
    setTimeout(() => $('winBox').showModal(), 900);
  }

  /** Porovná tip s tým, kde pes naozaj zastal, a ukáže to na doske. */
  judgeGuess() {
    const a = this.world.actor;
    this.guessTries += 1;
    this.guessRight = this.guess?.x === a.x && this.guess?.y === a.y;
    this.board.setAnswer(a.x, a.y);
  }

  predictTitle() {
    if (!this.isPredict) return null;
    if (!this.guessRight) return 'Zastal inde!';
    return this.guessTries === 1 ? 'Jasnovidec!' : 'Trafil si to!';
  }

  /** Odznak hráča v hlavičke — prezývka, body a hodnosť v bublinke. */
  renderChip() {
    const { points } = progress.totals();
    $('playerNick').textContent = progress.getNick() ?? '—';
    $('playerPts').textContent = `${points} b`;
    $('playerChip').title = `${progress.rankFor(points).name} · ${points} bodov · otvoriť rebríček`;
  }

  renderStars(awards) {
    const ids = this.boneIds();
    $('starRow').innerHTML = boneRow(awards.filter((a) => ids.includes(a)).length, ids.length);
  }

  // ── Panel stavu ───────────────────────────────────────────────

  updateState() {
    const a = this.world.actor;
    $('stPos').textContent = `${a.x + 1}·${a.y + 1}`;
    $('stDir').textContent = `${DIR_GLYPH[a.dir]} ${DIR_LABEL[a.dir]}`;

    // V Predpovedi nie sú kosti — tretia bunka namiesto nich ukazuje tip,
    // aby displej neukazoval nezmyselné 0/0.
    if (this.isPredict) {
      $('stThirdKey').textContent = 'Tvoj tip';
      $('stBones').textContent = this.guess ? `${this.guess.x + 1}·${this.guess.y + 1}` : '–';
    } else {
      $('stThirdKey').textContent = 'Kosti';
      $('stBones').textContent = `${this.world.bonesCollected()}/${this.world.totalBones}`;
    }
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

const boneRow = (got, total = 3) =>
  Array.from({ length: total },
    (_, i) => `<span class="bone ${i < got ? 'is-on' : ''}">${ICONS.bone()}</span>`).join('');

// ── Štart ───────────────────────────────────────────────────────

async function boot() {
  const manifest = await (await fetch('levels/index.json')).json();
  const levels = await Promise.all(
    manifest.levels.map(async (path) => (await fetch(`levels/${path}`)).json())
  );

  // Najprv sa dieťa predstaví, až potom sa postaví hra. Bez prezývky by sa
  // nemalo čo zapísať do rebríčka a odznak v hlavičke by bol prázdny.
  const welcome = new WelcomeView();
  welcome.bindPreview();
  if (!progress.hasNick()) await welcome.ask();

  new Game(levels, welcome);
}

boot().catch((err) => {
  document.getElementById('levelStory').textContent =
    'Levely sa nepodarilo načítať. Hru treba spustiť cez lokálny server (pozri README).';
  console.error(err);
});
