// Isometric projection helpers for 2:1 diamond tiles.
// Grid point (gx, gy) -> screen point; tile (x, y) covers grid [x, x+1] x [y, y+1].

export const TILE_W = 64;
export const TILE_H = 32;
const HALF_W = TILE_W / 2;
const HALF_H = TILE_H / 2;

export function gridToScreen(gx, gy) {
  return { x: (gx - gy) * HALF_W, y: (gx + gy) * HALF_H };
}

// Inverse projection. Also works for direction vectors (it is linear).
export function screenToGrid(sx, sy) {
  return { x: sx / TILE_W + sy / TILE_H, y: sy / TILE_H - sx / TILE_W };
}
