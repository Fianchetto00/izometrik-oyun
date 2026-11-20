// Inventory panel (HTML overlay): gold, equipped slots, item grid, details.
// Opened and closed with I / Esc. Texts come from data/ui.json.

import { drawAsset } from './render/assets.js';
import { equip, unequip, isEquipped, equippedStats } from './inventory.js';

const ICON_SIZE = 40;

export function createInventoryUi(root, inv, db, texts, onChange) {
  const overlay = el('div', 'inv-overlay');
  const panel = el('div', 'inv-panel');
  overlay.append(panel);
  overlay.hidden = true;
  root.append(overlay);

  let selected = null;

  function render() {
    panel.replaceChildren();
    const header = el('div', 'inv-header');
    header.append(el('h2', 'inv-title', texts.title), el('span', 'inv-gold', `${texts.gold}: ${inv.gold}`));
    panel.append(header, renderEquipped(), renderGrid(), renderDetails(), el('p', 'inv-hint', texts.close));
  }

  function renderEquipped() {
    const box = el('div', 'inv-equipped');
    box.append(el('h3', 'inv-subtitle', texts.equipped));
    const slots = el('div', 'inv-slots');
    for (const slot of Object.keys(inv.equipped)) {
      const id = inv.equipped[slot];
      const cell = el('button', 'inv-slot');
      cell.type = 'button';
      cell.append(id ? iconCanvas(db.get(id).icon) : el('span', 'inv-slot-empty', '—'));
      const label = el('span', 'inv-slot-label');
      label.append(el('b', '', texts.slots[slot]), el('span', '', id ? db.get(id).name : texts.empty));
      cell.append(label);
      if (id) cell.addEventListener('click', () => select(id));
      slots.append(cell);
    }
    const stats = equippedStats(inv, db);
    const parts = Object.entries(stats).map(([k, v]) => `${db.statNames[k]} ${v}`);
    box.append(slots, el('p', 'inv-totals', `${texts.totals}: ${parts.join(' · ') || '—'}`));
    return box;
  }

  function renderGrid() {
    const grid = el('div', 'inv-grid');
    if (inv.items.length === 0) grid.append(el('p', 'inv-empty', texts.noItems));
    for (const { id, count } of inv.items) {
      const cell = el('button', 'inv-cell');
      cell.type = 'button';
      cell.title = db.get(id).name;
      cell.classList.toggle('selected', id === selected);
      cell.classList.toggle('equipped', isEquipped(inv, id));
      cell.append(iconCanvas(db.get(id).icon));
      if (count > 1) cell.append(el('span', 'inv-count', String(count)));
      cell.addEventListener('click', () => select(id));
      grid.append(cell);
    }
    return grid;
  }

  function renderDetails() {
    const box = el('div', 'inv-details');
    if (!selected) {
      box.append(el('p', 'inv-muted', texts.selectHint));
      return box;
    }
    const item = db.get(selected);
    const head = el('div', 'inv-details-head');
    head.append(iconCanvas(item.icon), el('div', 'inv-details-name', item.name));
    box.append(head, el('p', 'inv-type', db.types[item.type].name));
    for (const [k, v] of Object.entries(item.stats || {})) {
      box.append(el('p', 'inv-stat', `${db.statNames[k]}: ${v}`));
    }
    box.append(el('p', 'inv-desc', item.description));
    if (item.price) box.append(el('p', 'inv-muted', `${texts.price}: ${item.price} ${texts.gold}`));
    box.append(actionFor(item));
    return box;
  }

  function actionFor(item) {
    const slot = db.slotOf(item.id);
    if (slot) {
      const on = inv.equipped[slot] === item.id;
      const btn = el('button', 'inv-action', on ? texts.unequip : texts.equip);
      btn.type = 'button';
      btn.addEventListener('click', () => {
        if (on) unequip(inv, slot);
        else equip(inv, db, item.id);
        changed();
      });
      return btn;
    }
    if (item.type === 'consumable') return el('p', 'inv-muted', texts.notUsable);
    return el('span', '');
  }

  function select(id) {
    selected = id;
    render();
  }

  function changed() {
    render();
    onChange();
  }

  const api = {
    isOpen: () => !overlay.hidden,
    open() {
      if (selected && !inv.items.some((e) => e.id === selected)) selected = null;
      render();
      overlay.hidden = false;
    },
    close() { overlay.hidden = true; },
    toggle() { if (api.isOpen()) api.close(); else api.open(); },
  };

  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT') return;
    if (e.code === 'KeyI') api.toggle();
    else if (e.code === 'Escape') api.close();
  });
  overlay.addEventListener('click', (e) => { if (e.target === overlay) api.close(); });

  return api;
}

function iconCanvas(assetKey) {
  const dpr = window.devicePixelRatio || 1;
  const canvas = el('canvas', 'inv-icon');
  canvas.width = ICON_SIZE * dpr;
  canvas.height = ICON_SIZE * dpr;
  const ctx = canvas.getContext('2d');
  const scale = (ICON_SIZE / 32) * dpr;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  drawAsset(ctx, assetKey, 16, 16, {});
  return canvas;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
