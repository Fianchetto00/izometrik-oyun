// Scene drawing: ground layer first, then tall objects and entities sorted
// by depth (x + y of their foot point), so things behind buildings are hidden.

import { gridToScreen } from '../iso.js';
import { drawAsset } from './assets.js';

const BACKGROUND = '#141821';
const CULL_MARGIN = 96;
const LABEL_OFFSET = 50; // pixels above the foot point

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const view = { w: 0, h: 0 };

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    view.w = window.innerWidth;
    view.h = window.innerHeight;
    canvas.width = Math.round(view.w * dpr);
    canvas.height = Math.round(view.h * dpr);
    canvas.style.width = `${view.w}px`;
    canvas.style.height = `${view.h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  return { ctx, view };
}

export function drawMessage(renderer, text) {
  const { ctx, view } = renderer;
  ctx.fillStyle = BACKGROUND;
  ctx.fillRect(0, 0, view.w, view.h);
  ctx.fillStyle = '#e8e2d0';
  ctx.font = '20px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, view.w / 2, view.h / 2);
}

// entities: [{ x, y, asset, opts }] with x, y in grid units (foot point).
export function renderScene(renderer, map, camera, entities) {
  const { ctx, view } = renderer;
  ctx.fillStyle = BACKGROUND;
  ctx.fillRect(0, 0, view.w, view.h);

  // Visible world rectangle around the camera, in projected pixels.
  const zoom = camera.zoom;
  const halfW = view.w / 2 / zoom;
  const halfH = view.h / 2 / zoom;
  const left = camera.x - halfW - CULL_MARGIN;
  const right = camera.x + halfW + CULL_MARGIN;
  const top = camera.y - halfH - CULL_MARGIN;
  const bottom = camera.y + halfH + CULL_MARGIN;

  // Snap the camera to whole screen pixels to avoid shimmering seams.
  ctx.save();
  ctx.translate(Math.round(view.w / 2), Math.round(view.h / 2));
  ctx.scale(zoom, zoom);
  ctx.translate(-Math.round(camera.x * zoom) / zoom, -Math.round(camera.y * zoom) / zoom);

  const objects = [];
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      const p = gridToScreen(x + 0.5, y + 0.5);
      if (p.x < left || p.x > right || p.y < top || p.y > bottom) continue;
      const tile = map.tileAt(x, y);
      const opts = { tx: x, ty: y };
      drawAsset(ctx, tile.floor, p.x, p.y, opts);
      const depth = x + y + 1;
      if (tile.block) objects.push({ depth, asset: tile.block, sx: p.x, sy: p.y, opts });
      if (map.hasTree(x, y)) objects.push({ depth, asset: map.treeAsset, sx: p.x, sy: p.y, opts });
    }
  }

  for (const e of entities) {
    const p = gridToScreen(e.x, e.y);
    objects.push({ depth: e.x + e.y, asset: e.asset, sx: p.x, sy: p.y, opts: e.opts });
  }

  objects.sort((a, b) => a.depth - b.depth);
  for (const o of objects) drawAsset(ctx, o.asset, o.sx, o.sy, o.opts);

  // Name labels go on top of everything so they stay readable.
  for (const e of entities) {
    if (e.label) drawLabel(ctx, e.label, gridToScreen(e.x, e.y));
  }

  ctx.restore();
}

function drawLabel(ctx, text, p) {
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.lineWidth = 3;
  ctx.lineJoin = 'round'; // avoids spiky miter corners on glyph outlines
  ctx.strokeStyle = 'rgba(20,24,33,0.85)';
  ctx.strokeText(text, p.x, p.y - LABEL_OFFSET);
  ctx.fillStyle = '#f4efe0';
  ctx.fillText(text, p.x, p.y - LABEL_OFFSET);
}
