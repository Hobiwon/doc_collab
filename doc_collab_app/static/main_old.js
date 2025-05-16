// JavaScript extracted from the HTML file
let openTabs = {};
let activeDoc = null;
let parentCommentId = null;

const searchBox = document.getElementById('search-box');
const searchWrapper = document.getElementById('search-wrapper');
const searchResults = document.getElementById('search-results');

searchBox.addEventListener('input', async e => {
  const query = e.target.value.trim();
  if (!query) {
    searchResults.innerHTML = '';
    searchResults.classList.remove('showing');
    return;
  }
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  const results = await res.json();
  searchResults.innerHTML = '';

  if (results.length > 0) {
    searchResults.classList.add('showing');
    results.forEach(doc => {
      const btn = document.createElement('button');
      btn.className = 'dropdown-item';
      btn.textContent = doc.title;
      btn.onclick = () => {
        openDocumentTab(doc.id, doc.title);
        searchResults.innerHTML = '';
        searchResults.classList.remove('showing');
        searchBox.value = '';
      };
      searchResults.appendChild(btn);
    });
  } else {
    searchResults.classList.remove('showing');
  }
});

searchBox.addEventListener('blur', () => {
  setTimeout(() => searchResults.classList.remove('showing'), 200);
});

function openDocumentTab(id, title) {
  let tabEl = document.querySelector(`.tab[data-id='${id}']`);

  if (!openTabs[id]) {
    openTabs[id] = title;
    tabEl = document.createElement('div');
    tabEl.className = 'tab';
    tabEl.dataset.id = id;
    tabEl.title = title;
    tabEl.innerHTML = `<span class="me-1">📄</span>${title} <button class="close-btn" onclick="closeTab(event, '${id}')" title="Close tab">×</button>`;
    tabEl.onclick = (e) => {
      if (!e.target.classList.contains('close-btn')) setActiveTab(id);
    };
    document.getElementById('tabs').appendChild(tabEl);
  }

  setActiveTab(id);
  highlightTab(id);
}

function setActiveTab(id) {
  activeDoc = id;
  parentCommentId = null;

  highlightTab(id);

  fetch(`/api/document/${id}`)
    .then(r => r.json())
    .then(data => {
      const contentEl = document.getElementById('document-content');
      contentEl.innerHTML = '';
      const docWrapper = document.createElement('div');
      docWrapper.className = 'doc-frame';
      docWrapper.innerHTML = `<h4 class="text-center mb-4">${openTabs[id]}</h4><p>${data.content}</p>`;
      contentEl.appendChild(docWrapper);

      document.getElementById('authors').innerHTML = data.authors.map(a => `<li>${a}</li>`).join('');
      document.getElementById('references').innerHTML = data.references.map(r => `<li><a href="#" onclick="openDocumentTab('${r.id}', '${r.title}')">${r.title}</a></li>`).join('');
      renderComments(data.comments);
    });
}

function highlightTab(id) {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.remove('active');
    if (tab.dataset.id === id) {
      tab.classList.add('active');
    }
  });
}

function closeTab(event, id) {
  event.stopPropagation();
  delete openTabs[id];
  const tabElement = document.querySelector(`.tab[data-id='${id}']`);
  if (tabElement) tabElement.remove();

  if (activeDoc === id) {
    const remainingTabs = Object.keys(openTabs);
    if (remainingTabs.length > 0) {
      const newId = remainingTabs[0];
      setActiveTab(newId);
    } else {
      activeDoc = null;
      document.getElementById('document-content').innerHTML = '';
      document.getElementById('authors').innerHTML = '';
      document.getElementById('references').innerHTML = '';
      document.getElementById('comments').innerHTML = '';
    }
  }
}

function renderComments(comments) {
  const container = document.getElementById('comments');
  container.innerHTML = '';
  const threads = comments.filter(c => !c.parent_id);
  const replies = comments.filter(c => c.parent_id);
  threads.forEach(thread => {
    const div = document.createElement('div');
    div.className = 'comment';
    div.textContent = thread.text;
    div.onclick = () => {
      parentCommentId = thread.id;
      document.getElementById('reply-label').textContent = `Replying to: \"${thread.text}\"`;
      showCommentBox();
    };
    replies.filter(r => r.parent_id === thread.id).forEach(reply => {
      const replyDiv = document.createElement('div');
      replyDiv.className = 'comment-reply';
      replyDiv.textContent = reply.text;
      div.appendChild(replyDiv);
    });
    container.appendChild(div);
  });
}

document.getElementById('post-comment').onclick = async () => {
  const text = document.getElementById('new-comment').value;
  if (!text || !activeDoc) return;
  await fetch(`/api/document/${activeDoc}/comment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, parent_id: parentCommentId })
  });
  document.getElementById('new-comment').value = '';
  hideCommentBox();
  setActiveTab(activeDoc);
};

document.getElementById('cancel-comment').onclick = () => hideCommentBox();
document.getElementById('add-comment-btn').onclick = () => {
  parentCommentId = null;
  document.getElementById('reply-label').textContent = 'New top-level comment';
  showCommentBox();
};
document.getElementById('clear-workspace').onclick = () => {
  openTabs = {};
  activeDoc = null;
  document.getElementById('tabs').innerHTML = '';
  document.getElementById('document-content').innerHTML = '';
  document.getElementById('authors').innerHTML = '';
  document.getElementById('references').innerHTML = '';
  document.getElementById('comments').innerHTML = '';
  searchBox.value = '';
  searchResults.innerHTML = '';
  searchResults.classList.remove('showing');
  hideCommentBox();
};

function showCommentBox() {
  document.getElementById('new-comment-box').style.display = 'block';
}

function hideCommentBox() {
  document.getElementById('new-comment-box').style.display = 'none';
  document.getElementById('reply-label').textContent = '';
}