// NPCs from the map's "npcs" list. Entries with an outfit are characters:
// they are drawn, labelled with their name and block their tile.
// Entries without one (e.g. the dungeon entrance) are interaction points only.

const DEFAULT_ASSET = 'npc';

export function createNpcs(list, outfits, map) {
  const npcs = [];
  for (const def of list || []) {
    if (!def.outfit) continue;
    const outfit = outfits[def.outfit];
    if (!outfit) throw new Error(`NPC ${def.id}: bilinmeyen outfit '${def.outfit}'`);
    map.addBlocker(def.x, def.y);
    npcs.push({
      id: def.id,
      role: def.role,
      name: def.name,
      x: def.x + 0.5,
      y: def.y + 0.5,
      asset: def.asset || DEFAULT_ASSET,
      outfit,
      facing: def.facing || -1,
    });
  }
  return npcs;
}

export function npcEntity(npc) {
  return {
    x: npc.x,
    y: npc.y,
    asset: npc.asset,
    label: npc.name,
    opts: { outfit: npc.outfit, moving: false, walkTime: 0, facing: npc.facing },
  };
}
