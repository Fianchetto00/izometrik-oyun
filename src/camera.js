// Camera centred on a target, in screen (projected) coordinates.

import { gridToScreen } from './iso.js';

export function createCamera() {
  return { x: 0, y: 0 };
}

export function followTarget(camera, target) {
  const s = gridToScreen(target.x, target.y);
  camera.x = s.x;
  camera.y = s.y;
}
