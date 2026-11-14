// Code-drawn shapes for tiles and props. Colours and sizes come from the
// asset manifest; a colour may be a list, picked per tile for variation.

import { TILE_W, TILE_H } from '../iso.js';

const HW = TILE_W / 2;
const HH = TILE_H / 2;

// Deterministic 0..1 value per tile (and optional salt).
export function tileHash(x = 0, y = 0, salt = 0) {
  let h = Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(salt, 2246822519);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function pick(value, o, salt = 0) {
  if (!Array.isArray(value)) return value;
  return value[Math.floor(tileHash(o.tx, o.ty, salt) * value.length)];
}

function diamondPath(ctx, cx, cy, lift = 0) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - HH - lift);
  ctx.lineTo(cx + HW, cy - lift);
  ctx.lineTo(cx, cy + HH - lift);
  ctx.lineTo(cx - HW, cy - lift);
  ctx.closePath();
}

// Fill + same-colour stroke hides anti-aliasing seams between tiles.
function fillSolid(ctx, color) {
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.fill();
  ctx.stroke();
}

function flat(ctx, cx, cy, def, o) {
  const c = def.colors;
  diamondPath(ctx, cx, cy);
  fillSolid(ctx, pick(c.fill, o));
  const pattern = PATTERNS[def.pattern];
  if (pattern) pattern(ctx, cx, cy, c, o);
}

const PATTERNS = {
  waves(ctx, cx, cy, c, o) {
    const off = (tileHash(o.tx, o.ty, 1) - 0.5) * 20;
    ctx.strokeStyle = c.detail;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx + off - 7, cy - 2);
    ctx.quadraticCurveTo(cx + off - 3, cy - 5, cx + off + 1, cy - 2);
    ctx.quadraticCurveTo(cx + off + 5, cy + 1, cx + off + 9, cy - 2);
    ctx.stroke();
  },
  planks(ctx, cx, cy, c) {
    // Seams parallel to the grid y axis: boards lie across an east-west bridge.
    ctx.strokeStyle = c.detail;
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      const t = i / 4;
      ctx.beginPath();
      ctx.moveTo(cx + t * HW, cy + (t - 1) * HH);
      ctx.lineTo(cx + (t - 1) * HW, cy + t * HH);
      ctx.stroke();
    }
  },
  stones(ctx, cx, cy, c, o) {
    ctx.fillStyle = c.detail;
    for (let i = 0; i < 3; i++) {
      const dx = (tileHash(o.tx, o.ty, 10 + i) - 0.5) * HW;
      const dy = (tileHash(o.tx, o.ty, 20 + i) - 0.5) * HH;
      ctx.fillRect(Math.round(cx + dx), Math.round(cy + dy), 3, 2);
    }
  },
  door(ctx, cx, cy, c) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(0.6, 0.6);
    diamondPath(ctx, 0, 0);
    ctx.fillStyle = c.detail;
    ctx.fill();
    ctx.restore();
  },
};

function blockHeight(def, o) {
  const h = def.height;
  if (!Array.isArray(h)) return h;
  return Math.round(h[0] + tileHash(o.tx, o.ty, 3) * (h[1] - h[0]));
}

function wall(ctx, cx, cy, side, h) {
  ctx.beginPath();
  ctx.moveTo(cx + side * HW, cy);
  ctx.lineTo(cx, cy + HH);
  ctx.lineTo(cx, cy + HH - h);
  ctx.lineTo(cx + side * HW, cy - h);
  ctx.closePath();
}

// Extruded tile: left (+y) face, right (+x) face, then the top.
function block(ctx, cx, cy, def, o) {
  const c = def.colors;
  const h = blockHeight(def, o);
  wall(ctx, cx, cy, -1, h);
  fillSolid(ctx, pick(c.left, o, 4));
  wall(ctx, cx, cy, 1, h);
  fillSolid(ctx, pick(c.right, o, 5));

  if (def.trimHeight && c.trim) {
    const top = cy - h;
    const t = def.trimHeight;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(cx + side * HW, top);
      ctx.lineTo(cx, top + HH);
      ctx.lineTo(cx, top + HH + t);
      ctx.lineTo(cx + side * HW, top + t);
      ctx.closePath();
      fillSolid(ctx, c.trim);
    }
  }

  diamondPath(ctx, cx, cy, h);
  fillSolid(ctx, pick(c.top, o, 6));
}

function ellipse(ctx, x, y, rx, ry) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function tree(ctx, cx, cy, def, o) {
  const c = def.colors;
  const s = 0.85 + tileHash(o.tx, o.ty, 7) * 0.3;
  ctx.fillStyle = c.shadow;
  ellipse(ctx, cx, cy, 18 * s, 8 * s);
  ctx.fillStyle = c.trunk;
  ctx.fillRect(Math.round(cx - 3 * s), Math.round(cy - 20 * s), Math.round(6 * s), Math.round(20 * s));
  ctx.fillStyle = pick(c.leaves, o, 8);
  ellipse(ctx, cx - 9 * s, cy - 28 * s, 12 * s, 11 * s);
  ellipse(ctx, cx + 9 * s, cy - 28 * s, 12 * s, 11 * s);
  ellipse(ctx, cx, cy - 38 * s, 15 * s, 14 * s);
  ctx.fillStyle = c.highlight;
  ellipse(ctx, cx - 4 * s, cy - 42 * s, 7 * s, 6 * s);
}

export const SHAPES = { flat, block, tree };
