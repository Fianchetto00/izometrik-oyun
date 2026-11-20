// Item icons drawn as simple shapes in a 32x32 box centred on (cx, cy).
// Each manifest entry picks a glyph and its colours.

function line(ctx, color, width, x1, y1, x2, y2) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function circle(ctx, color, x, y, r) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function poly(ctx, color, points) {
  ctx.fillStyle = color;
  ctx.beginPath();
  points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  ctx.closePath();
  ctx.fill();
}

// Glyphs work in local coordinates: (0, 0) is the box centre.
const GLYPHS = {
  sword(ctx, c) {
    line(ctx, c.blade, 4, -9, 9, 10, -10);
    line(ctx, c.guard, 3, -9, 3, -3, 9);
    line(ctx, c.grip, 3, -11, 11, -8, 8);
  },
  dagger(ctx, c) {
    line(ctx, c.blade, 4, -4, 4, 8, -8);
    line(ctx, c.grip, 4, -9, 9, -5, 5);
  },
  staff(ctx, c) {
    line(ctx, c.shaft, 3, -9, 12, 7, -6);
    circle(ctx, c.head, 8, -8, 5);
  },
  armor(ctx, c) {
    poly(ctx, c.body, [[-12, -8], [-5, -11], [5, -11], [12, -8], [9, -1], [8, 11], [-8, 11], [-9, -1]]);
    line(ctx, c.trim, 2, -4, -10, 0, -5);
    line(ctx, c.trim, 2, 4, -10, 0, -5);
    line(ctx, c.trim, 2, -8, 5, 8, 5);
  },
  ore(ctx, c) {
    poly(ctx, c.rock, [[-11, 4], [-7, -7], [2, -10], [11, -3], [9, 8], [-4, 10]]);
    circle(ctx, c.spot, -3, -2, 2.5);
    circle(ctx, c.spot, 4, 3, 2);
    circle(ctx, c.spot, 3, -5, 1.5);
  },
  fang(ctx, c) {
    poly(ctx, c.fang, [[-7, -10], [7, -10], [2, 11]]);
    poly(ctx, c.shade, [[2, -10], [7, -10], [2, 11]]);
  },
  potion(ctx, c) { drawPotion(ctx, c, 8); },
  potion_big(ctx, c) { drawPotion(ctx, c, 11); },
  bread(ctx, c) {
    ctx.fillStyle = c.crust;
    ctx.beginPath();
    ctx.ellipse(0, 2, 12, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    line(ctx, c.top, 2, -6, -1, -3, 3);
    line(ctx, c.top, 2, -1, -2, 2, 2);
    line(ctx, c.top, 2, 4, -1, 7, 3);
  },
  key(ctx, c) {
    ctx.strokeStyle = c.metal;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(-6, -6, 5, 0, Math.PI * 2);
    ctx.stroke();
    line(ctx, c.metal, 3, -2, -2, 10, 10);
    line(ctx, c.metal, 3, 6, 6, 9, 3);
  },
  amulet(ctx, c) {
    ctx.strokeStyle = c.chain;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, -4, 9, Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
    poly(ctx, c.chain, [[0, -2], [8, 5], [0, 12], [-8, 5]]);
    poly(ctx, c.gem, [[0, 1], [5, 5], [0, 9], [-5, 5]]);
  },
};

function drawPotion(ctx, c, r) {
  circle(ctx, c.glass, 0, 4, r + 1.5);
  circle(ctx, c.liquid, 0, 4, r);
  ctx.fillStyle = c.glass;
  ctx.fillRect(-3, -r - 4, 6, 8);
  ctx.fillStyle = c.cork;
  ctx.fillRect(-3, -r - 7, 6, 4);
}

export function drawIcon(ctx, cx, cy, def) {
  const glyph = GLYPHS[def.glyph];
  if (!glyph) return;
  ctx.save();
  ctx.translate(cx, cy);
  glyph(ctx, def.colors);
  ctx.restore();
}
