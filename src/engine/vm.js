/* Kódolabky — interpret plánu.
   step() vykoná PRÁVE JEDEN takt a vráti zoznam udalostí. UI ich len prehráva,
   samo nič nepočíta. Vďaka tomu je krokovanie, replay aj testovanie zadarmo.

   Zásobník rámcov je pripravený na `Opakuj` a `Trik` (Etapa 3 a 4) —
   zatiaľ je v ňom vždy jediný rámec. */

import { DIRS } from './world.js';

const ABSOLUTE = { north: 'N', east: 'E', south: 'S', west: 'W' };

export const DEFAULT_STEP_LIMIT = 200;

export class VM {
  constructor(world, rows, { stepLimit = DEFAULT_STEP_LIMIT } = {}) {
    this.world = world;
    this.stack = [{ rows, pc: 0, left: null }];
    this.ticks = 0;
    this.stepLimit = stepLimit;
    this.status = 'running';   // running | won | lost | error
    this.errorCode = null;
    this.currentRowId = null;
    this.movesUsed = 0;
  }

  get actor() { return this.world.actor; }
  get done() { return this.status !== 'running'; }

  /** Sú všetky rámce dobehnuté? */
  exhausted() { return this.stack.every((f) => f.pc >= f.rows.length); }

  step() {
    if (this.done) return [];

    if (++this.ticks > this.stepLimit) {
      this.status = 'error';
      this.errorCode = 'stepLimit';
      return [{ type: 'error', code: 'stepLimit', rowId: this.currentRowId }];
    }

    let frame = this.stack.at(-1);
    while (frame && frame.pc >= frame.rows.length && this.stack.length > 1) {
      this.stack.pop();
      frame = this.stack.at(-1);
    }
    if (!frame || frame.pc >= frame.rows.length) return this.finish();

    const row = frame.rows[frame.pc];
    if (frame.left === null) frame.left = Math.max(1, Number(row.n ?? 1));
    this.currentRowId = row.id;

    const events = [{ type: 'row', rowId: row.id }];
    events.push(...this.exec(row));

    if (this.status === 'error') return events;

    frame.left -= 1;
    if (frame.left <= 0) {
      frame.pc += 1;
      frame.left = null;
      events.push({ type: 'rowDone', rowId: row.id });
    }

    if (this.world.goalsMet()) {
      this.status = 'won';
      events.push({ type: 'win' });
      return events;
    }

    if (this.exhausted()) events.push(...this.finish());
    return events;
  }

  finish() {
    if (this.world.goalsMet(true)) {
      this.status = 'won';
      return [{ type: 'win' }];
    }
    this.status = 'lost';
    this.errorCode = 'notFinished';
    return [{ type: 'lose', code: 'notFinished', rowId: this.currentRowId }];
  }

  exec(row) {
    const a = this.actor;
    const w = this.world;

    if (row.cmd === 'turnLeft' || row.cmd === 'turnRight') {
      const i = DIRS.indexOf(a.dir);
      a.dir = DIRS[(i + (row.cmd === 'turnRight' ? 1 : 3)) % 4];
      return [{ type: 'turn', dir: a.dir }];
    }

    if (row.cmd === 'use') {
      const [x, y] = w.ahead(a);
      if (w.itemAt(x, y) === 'fire') {
        w.take(x, y);
        return [{ type: 'extinguish', x, y }];
      }
      return [{ type: 'nothing', rowId: row.id }];
    }

    // V absolútnom režime príkaz najprv otočí psa, potom ho posunie.
    if (ABSOLUTE[row.cmd]) a.dir = ABSOLUTE[row.cmd];

    const [x, y] = w.ahead(a);
    if (w.isBlocked(x, y)) {
      this.status = 'error';
      this.errorCode = w.tileAt(x, y) === 'wall' ? 'wall' : 'fire';
      return [{ type: 'blocked', rowId: row.id, code: this.errorCode, dir: a.dir }];
    }

    a.x = x;
    a.y = y;
    this.movesUsed += 1;
    const events = [{ type: 'move', x, y, dir: a.dir }];

    if (w.itemAt(x, y) === 'bone') {
      w.take(x, y);
      a.bones += 1;
      events.push({ type: 'collect', x, y, item: 'bone' });
    }
    return events;
  }
}

/** Spustí celý program bez UI — pre testy a neskôr pre solver. */
export function run(world, rows, opts) {
  const vm = new VM(world, rows, opts);
  const events = [];
  while (!vm.done) events.push(...vm.step());
  return { vm, events };
}
