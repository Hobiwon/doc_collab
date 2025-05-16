// init.js
import { openDocumentTab, highlightTab, closeTab } from './tabs.js';
import { setActiveTab } from './document.js';
import { bindSearch } from './search.js';
import { adjustZoom } from './zoom.js';
import { toggleAccordion } from './layout.js';
import { bindCommentBoxEvents, showCommentBox } from './comments.js';

window.openTabs = {};
window.currentZoom = 1;
window.activeDoc = null;

// Expose for inline HTML or external access
window.openDocumentTab = (id, title) => openDocumentTab(id, title, window.openTabs);
window.closeTab = (id) => closeTab(id, window.openTabs);
window.adjustZoom = adjustZoom;
window.toggleAccordion = toggleAccordion;
window.setActiveTab = setActiveTab;

window.addEventListener('DOMContentLoaded', () => {
  bindSearch(window.openDocumentTab);
  bindCommentBoxEvents();

  // Add comment button inserts at end of comment list
  document.getElementById('add-comment-btn')?.addEventListener('click', () => {
    const comments = document.getElementById('comments');
    const lastComment = comments.lastElementChild;
    showCommentBox(null, '', lastComment);
  });

  // Clear workspace confirmation
  document.getElementById('clear-workspace')?.addEventListener('click', () => {
    if (confirm("Are you sure you want to clear your workspace? This will close all open documents.")) {
      window.openTabs = {};
      document.getElementById('tabs').innerHTML = '';
      document.getElementById('document-content').innerHTML = '';
    }
  });

  document.addEventListener('click', (e) => {
    const box = document.getElementById('new-comment-box');
    const isBoxOpen = box?.classList.contains('visible');

    if (!isBoxOpen) return;

    const isClickInsideBox = box.contains(e.target);
    const isClickOnComment = e.target.classList.contains('comment-text');

    if (!isClickInsideBox && !isClickOnComment) {
      const cancelBtn = document.getElementById('cancel-comment');
      cancelBtn?.click(); // simulate cancel action
    }
  });
});

// document.getElementById('add-comment-btn').addEventListener('click', () => {
//   const comments = document.getElementById('comments');
//   const lastComment = comments.lastElementChild;
//   showCommentBox(null, '', lastComment);
// });

// function setActiveTabWrapper(id) {
//   window.activeDoc = id;
//   window.parentCommentId = null;
//   setActiveTab(id, openTabs, 1);
// }