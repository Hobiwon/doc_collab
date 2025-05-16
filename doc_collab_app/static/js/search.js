export function bindSearch(openTabCallback) {
  const searchBox = document.getElementById('search-box');
  const searchResults = document.getElementById('search-results');

  if (!searchBox || !searchResults) return;

  searchBox.addEventListener('input', async (e) => {
    const query = e.target.value.trim();
    if (!query) {
      searchResults.innerHTML = '';
      searchResults.classList.remove('showing');
      return;
    }

    try {
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
            openTabCallback(doc.id, doc.title);
            searchResults.innerHTML = '';
            searchResults.classList.remove('showing');
            searchBox.value = '';
          };
          searchResults.appendChild(btn);
        });
      } else {
        searchResults.classList.remove('showing');
      }
    } catch (err) {
      console.error('Search failed:', err);
      searchResults.classList.remove('showing');
    }
  });

  searchBox.addEventListener('blur', () => {
    setTimeout(() => searchResults.classList.remove('showing'), 200);
  });
}