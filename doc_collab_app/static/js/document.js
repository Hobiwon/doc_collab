// document.js
import { renderComments } from './comments.js';

export function setActiveTab(id, openTabs, currentZoom) {
  window.activeDoc = id;
  window.parentCommentId = null;

  fetch(`/api/document/${id}`)
    .then(r => r.json())
    .then(data => {
      const contentEl = document.getElementById('document-content');
      contentEl.innerHTML = '';

      // Create document view container
      const docWrapper = document.createElement('div');
      docWrapper.className = 'doc-frame';
      docWrapper.style.transform = `scale(${currentZoom})`;
      docWrapper.innerHTML = `
        <h4 class="text-center mb-4">${openTabs[id]}</h4>
        <p>${data.content}</p>
      `;
      contentEl.appendChild(docWrapper);

      // Render authors
      document.getElementById('authors').innerHTML = data.authors
        .map(author => `<li>${author}</li>`)
        .join('');

      // Render references with dynamic click handlers
      const refList = document.getElementById('references');
      refList.innerHTML = data.references
        .map(r => `<li><a href="#" data-id="${r.id}" data-title="${r.title}">${r.title}</a></li>`)
        .join('');

      refList.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', e => {
          e.preventDefault();
          const { id, title } = link.dataset;
          if (window.openDocumentTab) {
            window.openDocumentTab(id, title);
          }
        });
      });

      // Render threaded comments
      renderComments(data.comments);
    });
}