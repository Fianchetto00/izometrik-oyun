// Always-visible corner display: gold and key hints.

export function createHud(root, texts) {
  const box = document.createElement('div');
  box.className = 'hud';
  const gold = document.createElement('span');
  gold.className = 'hud-gold';
  const hint = document.createElement('span');
  hint.className = 'hud-hint';
  hint.textContent = texts.inventoryHint;
  box.append(gold, hint);
  root.append(box);

  return {
    setGold(value) {
      gold.textContent = `${texts.gold}: ${value}`;
    },
  };
}
