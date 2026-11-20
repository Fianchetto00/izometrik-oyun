// Entry point: load data, build the world, run the game loop.

import { loadAll, loadJSON, mapPath } from './loader.js';
import { createInput } from './input.js';
import { createMap } from './map.js';
import { createPlayer, updatePlayer } from './player.js';
import { createCamera, followTarget } from './camera.js';
import { loadAssets } from './render/assets.js';
import { createRenderer, drawMessage, renderScene } from './render/renderer.js';

const MAX_DT = 0.05;

async function start() {
  const renderer = createRenderer(document.getElementById('game'));
  drawMessage(renderer, 'Yükleniyor...');

  let data;
  try {
    data = await loadAll({
      game: './data/game.json',
      tiles: './data/tiles.json',
      assets: './data/assets.json',
      outfits: './data/outfits.json',
    });
    data.map = await loadJSON(mapPath(data.game.startMap));
    await loadAssets(data.assets);
  } catch (err) {
    console.error(err);
    drawMessage(renderer, `Yükleme hatası: ${err.message}`);
    return;
  }

  const cfg = data.game.player;
  const map = createMap(data.map, data.tiles);
  const player = createPlayer(cfg, data.map.playerStart, data.outfits[cfg.outfit]);
  const input = createInput();
  const camera = createCamera(data.game.camera);

  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, MAX_DT);
    last = now;

    updatePlayer(player, dt, input.moveVector(), map);
    followTarget(camera, player);
    renderScene(renderer, map, camera, [playerEntity(player)]);

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function playerEntity(p) {
  return {
    x: p.x,
    y: p.y,
    asset: p.asset,
    opts: { outfit: p.outfit, moving: p.moving, walkTime: p.walkTime, facing: p.facing },
  };
}

start();
