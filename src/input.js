// Keyboard state. Uses physical key codes so WASD works on any layout.

const MOVE_KEYS = {
  KeyW: [0, -1],
  KeyS: [0, 1],
  KeyA: [-1, 0],
  KeyD: [1, 0],
};

export function createInput(target = window) {
  const down = new Set();

  target.addEventListener('keydown', (e) => {
    if (isTyping(e)) return; // let text fields receive W, A, S, D
    down.add(e.code);
    if (MOVE_KEYS[e.code]) e.preventDefault();
  });
  target.addEventListener('keyup', (e) => down.delete(e.code));
  target.addEventListener('blur', () => down.clear());

  return {
    isDown: (code) => down.has(code),

    // Normalised movement direction in SCREEN space (W = up on screen).
    moveVector() {
      let x = 0;
      let y = 0;
      for (const [code, [dx, dy]] of Object.entries(MOVE_KEYS)) {
        if (down.has(code)) { x += dx; y += dy; }
      }
      const len = Math.hypot(x, y);
      return len > 0 ? { x: x / len, y: y / len } : { x: 0, y: 0 };
    },
  };
}

function isTyping(e) {
  const tag = e.target && e.target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA';
}
