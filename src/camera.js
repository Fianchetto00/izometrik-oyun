// Camera centred on a target, in screen (projected) coordinates.
// zoom > 1 draws the world larger on screen.

import { gridToScreen } from './iso.js';

export function createCamera(config = {}) {
  return { x: 0, y: 0, zoom: config.zoom || 1 };
}

export function followTarget(camera, target) {
  const s = gridToScreen(target.x, target.y);
  camera.x = s.x;
  camera.y = s.y;
}
