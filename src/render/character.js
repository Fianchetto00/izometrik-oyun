// Humanoid figure drawn from an outfit object (colours + accessories).
// (cx, cy) is the foot point. Costumes = new outfit entries in data/outfits.json.

const ACCESSORIES = {
  belt(ctx, cx, top, acc) {
    ctx.fillStyle = acc.color;
    ctx.fillRect(cx - 7, top + 11, 14, 3);
  },
  hat(ctx, cx, top, acc) {
    ctx.fillStyle = acc.color;
    ctx.fillRect(cx - 8, top - 10, 16, 3);
    ctx.fillRect(cx - 5, top - 16, 10, 6);
  },
};

function rect(ctx, color, x, y, w, h) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

export function drawCharacter(ctx, cx, cy, def, o) {
  const f = o.outfit;
  const phase = o.moving ? o.walkTime * 12 : 0;
  const step = Math.sin(phase) * 2.5;
  const bob = o.moving ? Math.abs(Math.sin(phase)) * 1.5 : 0;
  const facing = o.facing || 1;
  const bodyTop = cy - 27 - bob; // top of the shirt

  // Shadow
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 11, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Legs and boots (alternate while walking)
  rect(ctx, f.pants, cx - 6, cy - 13 - step, 5, 11 + step);
  rect(ctx, f.pants, cx + 1, cy - 13 + step, 5, 11 - step);
  rect(ctx, f.boots, cx - 6, cy - 3 - Math.max(step, 0), 5, 3);
  rect(ctx, f.boots, cx + 1, cy - 3 - Math.max(-step, 0), 5, 3);

  // Body and arms
  rect(ctx, f.shirt, cx - 7, bodyTop, 14, 15);
  rect(ctx, f.shirt, cx - 10, bodyTop + 1 + step * 0.6, 3, 11);
  rect(ctx, f.shirt, cx + 7, bodyTop + 1 - step * 0.6, 3, 11);
  rect(ctx, f.skin, cx - 10, bodyTop + 12 + step * 0.6, 3, 3);
  rect(ctx, f.skin, cx + 7, bodyTop + 12 - step * 0.6, 3, 3);

  // Head, hair, eye
  const headY = bodyTop - 7;
  ctx.fillStyle = f.skin;
  ctx.beginPath();
  ctx.arc(cx, headY, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = f.hair;
  ctx.beginPath();
  ctx.arc(cx, headY - 1, 7.5, Math.PI, Math.PI * 2);
  ctx.fill();
  rect(ctx, '#1d1d1d', cx + facing * 3 - 1, headY, 2, 2);

  for (const acc of f.accessories || []) {
    const fn = ACCESSORIES[acc.type];
    if (fn) fn(ctx, cx, bodyTop, acc);
  }
}
