// Inventory state and rules. State is plain data (easy to save later):
// { gold, items: [{ id, count }], equipped: { weapon, armor } }.
// Item definitions live in data/items.json; the inventory only stores ids.

export function createItemDb(data) {
  const byId = new Map(data.items.map((item) => [item.id, item]));
  return {
    types: data.types,
    statNames: data.statNames,
    get(id) {
      const item = byId.get(id);
      if (!item) throw new Error(`Bilinmeyen eşya: ${id}`);
      return item;
    },
    slotOf(id) {
      return data.types[this.get(id).type].slot || null;
    },
  };
}

export function createInventory(db, gold, start) {
  const inv = { gold, items: [], equipped: { weapon: null, armor: null } };
  for (const { id, count } of start.items || []) addItem(inv, db, id, count);
  for (const id of Object.values(start.equip || {})) equip(inv, db, id);
  return inv;
}

export function countOf(inv, id) {
  const entry = inv.items.find((e) => e.id === id);
  return entry ? entry.count : 0;
}

export function addItem(inv, db, id, count = 1) {
  db.get(id); // validates the id
  const entry = inv.items.find((e) => e.id === id);
  if (entry) entry.count += count;
  else inv.items.push({ id, count });
}

// Returns false if there are not enough items.
export function removeItem(inv, id, count = 1) {
  const entry = inv.items.find((e) => e.id === id);
  if (!entry || entry.count < count) return false;
  entry.count -= count;
  if (entry.count === 0) {
    inv.items = inv.items.filter((e) => e !== entry);
    for (const slot of Object.keys(inv.equipped)) {
      if (inv.equipped[slot] === id) inv.equipped[slot] = null;
    }
  }
  return true;
}

export function equip(inv, db, id) {
  const slot = db.slotOf(id);
  if (!slot || countOf(inv, id) === 0) return false;
  inv.equipped[slot] = id;
  return true;
}

export function unequip(inv, slot) {
  inv.equipped[slot] = null;
}

export function isEquipped(inv, id) {
  return Object.values(inv.equipped).includes(id);
}

// Sum of stats from equipped items, e.g. { damage: 3, defense: 1 }.
export function equippedStats(inv, db) {
  const total = {};
  for (const id of Object.values(inv.equipped)) {
    if (!id) continue;
    for (const [stat, value] of Object.entries(db.get(id).stats || {})) {
      total[stat] = (total[stat] || 0) + value;
    }
  }
  return total;
}
