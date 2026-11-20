// Tile map: parses map JSON, answers walkability, places seeded trees.

export function createMap(mapData, tileDefs) {
  const { width, height, rows, legend } = mapData;
  if (rows.length !== height) throw new Error(`${mapData.id}: ${rows.length} satır, ${height} bekleniyordu`);

  const tiles = rows.map((row, y) => {
    if (row.length !== width) throw new Error(`${mapData.id}: ${y}. satır ${row.length} karakter`);
    return [...row].map((ch) => {
      const type = legend[ch];
      if (!type || !tileDefs[type]) throw new Error(`${mapData.id}: bilinmeyen karo '${ch}'`);
      return type;
    });
  });

  const trees = placeTrees(mapData.trees, tiles, width, height);
  const blockers = new Set(); // tiles occupied by NPCs
  const inBounds = (x, y) => x >= 0 && y >= 0 && x < width && y < height;

  return {
    id: mapData.id,
    width,
    height,
    treeAsset: mapData.trees ? mapData.trees.asset : null,

    tileType: (x, y) => (inBounds(x, y) ? tiles[y][x] : null),
    tileAt: (x, y) => (inBounds(x, y) ? tileDefs[tiles[y][x]] : null),
    hasTree: (x, y) => trees.has(key(x, y)),
    addBlocker: (x, y) => blockers.add(key(x, y)),

    isBlocked(x, y) {
      if (!inBounds(x, y)) return true;
      const k = key(x, y);
      return !tileDefs[tiles[y][x]].walkable || trees.has(k) || blockers.has(k);
    },
  };
}

function key(x, y) {
  return `${x},${y}`;
}

// Same seed -> same forest. The RNG advances for every candidate tile, so
// editing the clear zones does not reshuffle trees elsewhere.
function placeTrees(cfg, tiles, width, height) {
  const result = new Set();
  if (!cfg) return result;
  const rng = mulberry32(cfg.seed);
  const clear = cfg.clear || [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (!cfg.tileTypes.includes(tiles[y][x])) continue;
      const roll = rng();
      const cleared = clear.some((r) => x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h);
      if (!cleared && roll < cfg.density) result.add(key(x, y));
    }
  }
  return result;
}

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
