// Player state, movement and tile collision.
// Position (x, y) is the foot point in grid units.

import { screenToGrid } from './iso.js';

const EPS = 0.001;

export function createPlayer(config, start, outfit) {
  return {
    x: start.x + 0.5,
    y: start.y + 0.5,
    speed: config.speed,   // screen pixels per second
    radius: config.radius, // half-size of the collision box, in tiles
    asset: config.asset,
    outfit,
    moving: false,
    walkTime: 0,
    facing: 1,             // 1 = facing screen-right, -1 = screen-left
    name: '',              // nickname, set by character creation
    classId: null,
    gender: null,
  };
}

// dir: normalised screen-space direction from input.
export function updatePlayer(p, dt, dir, map) {
  p.moving = dir.x !== 0 || dir.y !== 0;
  if (!p.moving) return;

  if (dir.x !== 0) p.facing = Math.sign(dir.x);
  p.walkTime += dt;

  // Constant speed on screen, converted to grid axes.
  const v = screenToGrid(dir.x * p.speed, dir.y * p.speed);
  moveAxis(p, 'x', v.x * dt, map);
  moveAxis(p, 'y', v.y * dt, map);
}

// Moves along one axis; on collision snaps flush against the blocking tile.
function moveAxis(p, axis, delta, map) {
  if (delta === 0) return;
  const next = p[axis] + delta;
  const r = p.radius;
  const other = axis === 'x' ? p.y : p.x;
  const lead = delta > 0 ? next + r : next - r;
  const leadTile = Math.floor(lead);
  const from = Math.floor(other - r);
  const to = Math.floor(other + r - EPS);

  for (let t = from; t <= to; t++) {
    const blocked = axis === 'x' ? map.isBlocked(leadTile, t) : map.isBlocked(t, leadTile);
    if (blocked) {
      p[axis] = delta > 0 ? leadTile - r - EPS : leadTile + 1 + r + EPS;
      return;
    }
  }
  p[axis] = next;
}
