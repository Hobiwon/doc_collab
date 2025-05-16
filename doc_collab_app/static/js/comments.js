// comments.js
let parentCommentId = null;

export function renderComments(comments) {
  const container = document.getElementById('comments');
  container.innerHTML = '';

  const commentMap = {};
  comments.forEach(c => {
    commentMap[c.id] = { ...c };
    commentMap[c.id].replies = []; // Always define replies
  });

  comments.forEach(c => {
    if (c.parent_id) {
      commentMap[c.parent_id]?.replies.push(c);
    }
  });

  Object.values(commentMap)
    .filter(c => !c.parent_id)
    .forEach(c => renderComment(container, c));
}

function renderComment(container, comment) {
  const commentEl = document.createElement('div');
  commentEl.className = 'mb-2 p-2 border rounded';

  const text = document.createElement('div');
  text.textContent = comment.text;
  text.className = 'comment-text clickable';
  text.style.cursor = 'pointer';

  text.onclick = () => {
    showCommentBox(comment.id, comment.text, commentEl);
  };

  commentEl.appendChild(text);

  // Container for replies
  const replyContainer = document.createElement('div');
  replyContainer.className = 'replies ms-3 mt-2'; // indent replies

  commentEl.appendChild(replyContainer);
  container.appendChild(commentEl);

  // Render replies into the nested container
  if (Array.isArray(comment.replies)) {
    comment.replies.forEach(reply => renderComment(replyContainer, reply));
  }
}

// document.getElementById('post-comment').onclick = async () => {
//   const text = document.getElementById('new-comment').value;
//   if (!text || !activeDoc) return;
//   await fetch(`/api/document/${activeDoc}/comment`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ text, parent_id: parentCommentId })
//   });
//   document.getElementById('new-comment').value = '';
//   hideCommentBox();
//   setActiveTab(activeDoc);
// };

// document.getElementById('cancel-comment').onclick = () => hideCommentBox();
// document.getElementById('add-comment-btn').onclick = () => {
//   parentCommentId = null;
//   document.getElementById('reply-label').textContent = 'New top-level comment';
//   showCommentBox();
// };

export function showCommentBox(parentId = null, parentText = '', insertAfterEl = null) {
  const box = document.getElementById('new-comment-box');
  const replyLabel = document.getElementById('reply-label');
  const addBtn = document.getElementById('add-comment-btn');

  box.remove();

  if (insertAfterEl?.parentNode) {
    insertAfterEl.parentNode.insertBefore(box, insertAfterEl.nextSibling);
  } else {
    document.getElementById('comments').appendChild(box);
  }

  box.classList.add('visible');
  addBtn.classList.add('hidden');

  parentCommentId = parentId;
  replyLabel.textContent = parentId ? `Replying to: "${parentText}"` : '';
}

export function hideCommentBox() {
  const box = document.getElementById('new-comment-box');
  const addBtn = document.getElementById('add-comment-btn');

  box.classList.remove('visible');
  addBtn.classList.remove('hidden');
  parentCommentId = null;
}

export function bindCommentBoxEvents() {
  const cancel = document.getElementById('cancel-comment');
  const post = document.getElementById('post-comment');
  const dismiss = document.getElementById('dismiss-reply');

  cancel?.addEventListener('click', hideCommentBox);
  dismiss?.addEventListener('click', hideCommentBox);

  post?.addEventListener('click', async () => {
    const text = document.getElementById('new-comment').value.trim();
    const docId = window.activeDoc;
    if (!text || !docId) return;

    await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ doc_id: docId, text, parent_id: parentCommentId })
    });

    hideCommentBox();
    document.getElementById('new-comment').value = '';
    window.setActiveTab(docId, window.openTabs, window.currentZoom); // Refresh comments
  });
}