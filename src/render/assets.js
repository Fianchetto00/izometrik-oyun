// Asset manifest resolver. Every visual is looked up by key and drawn either
// by a shape function or from an image, so PNG sprites can replace shapes
// by editing data/assets.json only.

import { SHAPES } from './shapes.js';
import { drawCharacter } from './character.js';

const SHAPE_FNS = { ...SHAPES, character: drawCharacter };

let manifest = {};
const images = new Map();

export async function loadAssets(data) {
  manifest = data;
  const pending = Object.entries(data)
    .filter(([, def]) => def && def.type === 'image')
    .map(([key, def]) => loadImage(def.src).then((img) => images.set(key, img)));
  await Promise.all(pending);
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`${src} yüklenemedi`));
    img.src = src;
  });
}

// (sx, sy): tile ground centre for tiles, foot point for sprites.
// opts: per-instance data (tile coords for variation, outfit, animation...).
export function drawAsset(ctx, key, sx, sy, opts = {}) {
  const def = manifest[key];
  if (!def) return drawMissing(ctx, sx, sy);

  if (def.type === 'image') {
    const img = images.get(key);
    const [ax, ay] = def.anchor || [img.width / 2, img.height];
    ctx.drawImage(img, Math.round(sx - ax), Math.round(sy - ay));
    return;
  }

  const fn = SHAPE_FNS[def.shape];
  if (!fn) return drawMissing(ctx, sx, sy);
  fn(ctx, sx, sy, def, opts);
}

function drawMissing(ctx, sx, sy) {
  ctx.fillStyle = '#ff00ff';
  ctx.fillRect(sx - 6, sy - 6, 12, 12);
}
