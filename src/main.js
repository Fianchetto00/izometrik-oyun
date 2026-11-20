// Entry point: load data, build the world, run the game loop.

import { loadAll, loadJSON, mapPath } from './loader.js';
import { createInput } from './input.js';
import { createMap } from './map.js';
import { createPlayer, updatePlayer } from './player.js';
import { createCamera, followTarget } from './camera.js';
import { createNpcs, npcEntity } from './npc.js';
import { showCharacterCreation } from './menu.js';
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
      characters: './data/characters.json',
    });
    data.map = await loadJSON(mapPath(data.game.startMap));
    await loadAssets(data.assets);
  } catch (err) {
    console.error(err);
    drawMessage(renderer, `Yükleme hatası: ${err.message}`);
    return;
  }

  const map = createMap(data.map, data.tiles);
  const npcs = createNpcs(data.map.npcs, data.outfits, map);
  const camera = createCamera(data.game.camera);

  // Village as a backdrop behind the character creation screen.
  followTarget(camera, { x: data.map.playerStart.x + 0.5, y: data.map.playerStart.y + 0.5 });
  renderScene(renderer, map, camera, npcs.map(npcEntity));
  const hero = await showCharacterCreation(document.body, data.characters, data.outfits, data.game.title);

  const cfg = data.game.player;
  const player = createPlayer(cfg, data.map.playerStart, data.outfits[hero.outfitId]);
  Object.assign(player, { name: hero.nick, classId: hero.classId, gender: hero.gender });
  const input = createInput();

  let last = performance.now();
  function frame(now) {
    const dt = Math.min((now - last) / 1000, MAX_DT);
    last = now;

    updatePlayer(player, dt, input.moveVector(), map);
    followTarget(camera, player);
    renderScene(renderer, map, camera, [...npcs.map(npcEntity), playerEntity(player)]);

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function playerEntity(p) {
  return {
    x: p.x,
    y: p.y,
    asset: p.asset,
    label: p.name,
    opts: { outfit: p.outfit, moving: p.moving, walkTime: p.walkTime, facing: p.facing },
  };
}

start();
