// tabs.js
import { setActiveTab } from './document.js';

export function openDocumentTab(id, title, openTabs) {
  if (!openTabs[id]) {
    openTabs[id] = title;

    const tab = document.createElement('div');
    tab.className = 'tab';
    tab.dataset.id = id;
    tab.title = title;
    tab.innerHTML = `
      <span>📄 ${title}</span>
      <button class="close-btn" title="Close" onclick="window.closeTab('${id}')">&times;</button>
    `;

    tab.addEventListener('click', () => {
      setActiveTab(id, openTabs, window.currentZoom || 1);
      highlightTab(id);
    });

    document.getElementById('tabs').appendChild(tab);
  }

  setActiveTab(id, openTabs, window.currentZoom || 1);
  highlightTab(id);
}

export function closeTab(id, openTabs) {
  delete openTabs[id];

  const tab = document.querySelector(`.tab[data-id="${id}"]`);
  if (tab) tab.remove();

  const remainingIds = Object.keys(openTabs);
  if (remainingIds.length > 0) {
    const nextId = remainingIds[remainingIds.length - 1];
    setActiveTab(nextId, openTabs, window.currentZoom || 1);
    highlightTab(nextId);
  } else {
    document.getElementById('document-content').innerHTML = '';
  }
}

export function highlightTab(id) {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.id === id);
  });
}