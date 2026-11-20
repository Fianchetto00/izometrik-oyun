// Character creation screen (HTML overlay): nickname, class and gender.
// All texts and choices come from data/characters.json.
// Resolves with { nick, classId, gender, outfitId } when the player starts.

import { drawAsset } from './render/assets.js';

const PREVIEW_SCALE = 3;

export function showCharacterCreation(root, data, outfits, title) {
  const ui = data.ui;
  const state = { classId: data.classes[0].id, gender: data.genders[0].id };
  const outfitId = () => data.outfitPattern
    .replace('{class}', state.classId)
    .replace('{gender}', state.gender);

  const panel = el('div', 'menu-panel');
  panel.append(el('h1', 'menu-title', title), el('p', 'menu-subtitle', ui.subtitle));

  const nick = el('input', 'menu-input');
  nick.type = 'text';
  nick.maxLength = data.nick.max;
  nick.placeholder = ui.nickPlaceholder;
  panel.append(field(ui.nickLabel, nick));

  const classDesc = el('p', 'menu-desc');
  const classRow = choiceRow(data.classes, state, 'classId', () => update());
  const genderRow = choiceRow(data.genders, state, 'gender', () => update());
  panel.append(field(ui.classLabel, classRow, classDesc), field(ui.genderLabel, genderRow));

  const preview = el('canvas', 'menu-preview');
  preview.width = 40 * PREVIEW_SCALE;
  preview.height = 60 * PREVIEW_SCALE;
  const error = el('p', 'menu-error');
  const startBtn = el('button', 'menu-start', ui.start);
  panel.append(preview, error, startBtn);

  const overlay = el('div', 'menu-overlay');
  overlay.append(panel);
  root.append(overlay);

  function update() {
    classDesc.textContent = data.classes.find((c) => c.id === state.classId).description;
    drawPreview(preview, outfits[outfitId()]);
  }
  update();
  nick.focus();

  return new Promise((resolve) => {
    function submit() {
      const value = nick.value.trim();
      if (value.length < data.nick.min || value.length > data.nick.max) {
        error.textContent = ui.errorNick.replace('{min}', data.nick.min).replace('{max}', data.nick.max);
        nick.focus();
        return;
      }
      overlay.remove();
      resolve({ nick: value, classId: state.classId, gender: state.gender, outfitId: outfitId() });
    }
    startBtn.addEventListener('click', submit);
    overlay.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter') return;
      e.preventDefault(); // Enter on a focused choice button starts the game too
      submit();
    });
    nick.addEventListener('input', () => { error.textContent = ''; });
  });
}

// A row of toggle buttons; clicking one stores its id in state[key].
function choiceRow(options, state, key, onChange) {
  const row = el('div', 'menu-choices');
  const buttons = options.map((opt) => {
    const btn = el('button', 'menu-choice', opt.name);
    btn.type = 'button';
    btn.addEventListener('click', () => {
      state[key] = opt.id;
      buttons.forEach((b, i) => b.classList.toggle('selected', options[i].id === opt.id));
      onChange();
    });
    btn.classList.toggle('selected', state[key] === opt.id);
    return btn;
  });
  row.append(...buttons);
  return row;
}

function field(label, ...children) {
  const wrap = el('div', 'menu-field');
  wrap.append(el('label', 'menu-label', label), ...children);
  return wrap;
}

function drawPreview(canvas, outfit) {
  const ctx = canvas.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.setTransform(PREVIEW_SCALE, 0, 0, PREVIEW_SCALE, 0, 0);
  drawAsset(ctx, 'player', 20, 54, { outfit, moving: false, walkTime: 0, facing: 1 });
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}
