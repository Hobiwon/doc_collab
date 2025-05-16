// zoom.js
let currentZoom = 1;

export function adjustZoom(action) {
  const frame = document.querySelector('.doc-frame');
  if (!frame) return;
  const ZOOM_STEP = 0.1;
  const ZOOM_MIN = 0.5;
  const ZOOM_MAX = 2;

  if (action === 'reset') {
    currentZoom = 1;
  } else if (action === 'in') {
    currentZoom = Math.min(ZOOM_MAX, currentZoom + ZOOM_STEP);
  } else if (action === 'out') {
    currentZoom = Math.max(ZOOM_MIN, currentZoom - ZOOM_STEP);
  }

  frame.style.transform = `scale(${currentZoom})`;
  const label = document.getElementById('zoom-label');
  if (label) label.textContent = `${Math.round(currentZoom * 100)}%`;
}

export function getZoom() {
  return currentZoom;
}

export function setZoom(value) {
  currentZoom = value;
}