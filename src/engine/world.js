/* Kódolabky — svet: mriežka, predmety, aktéri.
   Bez akejkoľvek väzby na DOM — aby sa dal testovať aj spúšťať bez UI. */

export const DIRS = ['N', 'E', 'S', 'W'];
export const DELTA = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] };
export const DIR_LABEL = { N: 'hore', E: 'doprava', S: 'dole', W: 'doľava' };
export const DIR_ROT = { N: 0, E: 90, S: 180, W: 270 };

/** Hodnoty legendy, ktoré nie sú dlaždicou ale predmetom na nej. */
const ITEM_KINDS = new Set(['bone', 'fire']);

export class World {
  constructor(level) {
    this.level = level;
    this.reset();
  }

  reset() {
    const { legend, rows } = this.level.grid;
    this.h = rows.length;
    this.w = rows[0].length;
    this.tiles = [];
    this.items = [];

    for (let y = 0; y < this.h; y++) {
      const tileRow = [];
      const itemRow = [];
      for (let x = 0; x < this.w; x++) {
        const kind = legend[rows[y][x]] ?? 'empty';
        if (ITEM_KINDS.has(kind)) { tileRow.push('empty'); itemRow.push(kind); }
        else { tileRow.push(kind); itemRow.push(null); }
      }
      this.tiles.push(tileRow);
      this.items.push(itemRow);
    }

    this.totalBones = this.items.flat().filter((i) => i === 'bone').length;
    this.actors = this.level.actors.map((a) => ({ ...a, bones: 0 }));
  }

  get actor() { return this.actors[0]; }

  inside(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }

  /** Mimo mapy sa správa ako stena — dieťa tak nikdy „nevypadne“ z bludiska. */
  tileAt(x, y) { return this.inside(x, y) ? this.tiles[y][x] : 'wall'; }
  itemAt(x, y) { return this.inside(x, y) ? this.items[y][x] : null; }

  isBlocked(x, y) { return this.tileAt(x, y) === 'wall' || this.itemAt(x, y) === 'fire'; }

  take(x, y) {
    if (!this.inside(x, y)) return null;
    const item = this.items[y][x];
    this.items[y][x] = null;
    return item;
  }

  /** Políčko, na ktoré sa aktér práve pozerá. */
  ahead(actor) {
    const [dx, dy] = DELTA[actor.dir];
    return [actor.x + dx, actor.y + dy];
  }

  goalsMet() {
    return (this.level.goals ?? []).every((goal) => {
      const actor = this.actors.find((a) => a.id === goal.actor) ?? this.actor;
      if (goal.type === 'reach') return this.tileAt(actor.x, actor.y) === (goal.tile ?? 'goal');
      return false;
    });
  }

  bonesCollected() { return this.actors.reduce((sum, a) => sum + a.bones, 0); }
}
