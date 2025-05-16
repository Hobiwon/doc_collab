// layout.js
export function toggleAccordion(panelId) {
  const panel = document.getElementById(panelId);
  panel.classList.toggle('collapsed-panel');
}