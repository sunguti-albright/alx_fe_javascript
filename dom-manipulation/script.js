const LS_QUOTES_KEY = 'dqg_quotes_v1';
const SS_LAST_QUOTE = 'dqg_last_viewed';

const DEFAULT_QUOTES = [
  { text: "The future belongs to those who prepare for it today.", category: "Motivation" },
  { text: "Injustice anywhere is a threat to justice everywhere.", category: "Justice" },
  { text: "Simplicity is the soul of efficiency.", category: "Technology" }
];

const quoteDisplay = document.getElementById('quoteDisplay');
const newQuoteBtn = document.getElementById('newQuote');
const categoryFilter = document.getElementById('categoryFilter');
const addQuoteFormContainer = document.getElementById('addQuoteForm');
const exportBtn = document.getElementById('exportJson');
const importFileInput = document.getElementById('importFile');
const clearStorageBtn = document.getElementById('clearStorage');
const showLastBtn = document.getElementById('showLast');
const statusEl = document.getElementById('status');

let quotes = [];

function saveQuotesToLocalStorage() {
  try {
    localStorage.setItem(LS_QUOTES_KEY, JSON.stringify(quotes));
    statusEl.textContent = 'Quotes saved locally.';
    setTimeout(() => { statusEl.textContent = ''; }, 1800);
  } catch {
    statusEl.textContent = 'Error saving quotes.';
  }
}

function loadQuotesFromLocalStorage() {
  try {
    const raw = localStorage.getItem(LS_QUOTES_KEY);
    if (!raw) {
      quotes = [...DEFAULT_QUOTES];
      saveQuotesToLocalStorage();
    } else {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.every(isValidQuote)) quotes = parsed;
      else {
        quotes = [...DEFAULT_QUOTES];
        saveQuotesToLocalStorage();
      }
    }
  } catch {
    quotes = [...DEFAULT_QUOTES];
  }
}

function isValidQuote(q) {
  return q && typeof q.text === 'string' && q.text.trim() && typeof q.category === 'string' && q.category.trim();
}

function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))].sort();
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });
}

function displayQuote(quote) {
  if (!quote) {
    quoteDisplay.textContent = 'No quote to display.';
    return;
  }
  quoteDisplay.innerHTML = `<p style="font-size:1.05rem; margin:0"><q>${escapeHtml(quote.text)}</q></p><small>— ${escapeHtml(quote.category)}</small>`;
  sessionStorage.setItem(SS_LAST_QUOTE, JSON.stringify(quote));
}

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function showRandomQuote() {
  let filtered = quotes;
  const sel = categoryFilter.value;
  if (sel && sel !== 'all') filtered = quotes.filter(q => q.category === sel);
  if (filtered.length === 0) {
    quoteDisplay.textContent = 'No quotes available for this category.';
    return;
  }
  const idx = Math.floor(Math.random() * filtered.length);
  displayQuote(filtered[idx]);
}

function showLastViewed() {
  const raw = sessionStorage.getItem(SS_LAST_QUOTE);
  if (!raw) {
    statusEl.textContent = 'No last-viewed quote.';
    setTimeout(() => statusEl.textContent = '', 1800);
    return;
  }
  const q = JSON.parse(raw);
  if (isValidQuote(q)) displayQuote(q);
}

function createAddQuoteForm() {
  addQuoteFormContainer.innerHTML = '';
  const wrapper = document.createElement('div');
  const textInput = document.createElement('input');
  textInput.id = 'newQuoteText';
  textInput.type = 'text';
  textInput.placeholder = 'Enter a new quote';
  textInput.style.minWidth = '320px';
  const categoryInput = document.createElement('input');
  categoryInput.id = 'newQuoteCategory';
  categoryInput.type = 'text';
  categoryInput.placeholder = 'Enter quote category';
  const addBtn = document.createElement('button');
  addBtn.textContent = 'Add Quote';
  addBtn.addEventListener('click', addQuote);
  wrapper.append(textInput, categoryInput, addBtn);
  addQuoteFormContainer.appendChild(wrapper);
}

function addQuote() {
  const textEl = document.getElementById('newQuoteText');
  const catEl = document.getElementById('newQuoteCategory');
  const text = textEl.value.trim();
  const category = catEl.value.trim();
  if (!text || !category) {
    alert('Please fill in both fields.');
    return;
  }
  const newQ = { text, category };
  if (quotes.some(q => q.text === newQ.text && q.category === newQ.category)) {
    alert('That quote already exists.');
    textEl.value = catEl.value = '';
    return;
  }
  quotes.push(newQ);
  saveQuotesToLocalStorage();
  populateCategories();
  textEl.value = catEl.value = '';
  displayQuote(newQ);
  statusEl.textContent = 'Quote added.';
  setTimeout(() => statusEl.textContent = '', 1600);
}

function exportQuotesAsJson() {
  const jsonStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const timestamp = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-');
  a.href = url;
  a.download = `dqg_quotes_${timestamp}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  statusEl.textContent = 'Export complete.';
  setTimeout(() => statusEl.textContent = '', 1400);
}

function importFromJsonFile(file) {
  if (!file) return;
  const fr = new FileReader();
  fr.onload = e => {
    try {
      const parsed = JSON.parse(e.target.result);
      if (!Array.isArray(parsed)) throw new Error('Invalid format');
      const incoming = parsed.filter(isValidQuote);
      let added = 0;
      incoming.forEach(q => {
        if (!quotes.some(x => x.text === q.text && x.category === q.category)) {
          quotes.push(q);
          added++;
        }
      });
      saveQuotesToLocalStorage();
      populateCategories();
      statusEl.textContent = `${added} new quotes added.`;
      setTimeout(() => statusEl.textContent = '', 2000);
    } catch {
      alert('Invalid JSON file.');
    }
  };
  fr.readAsText(file);
}

function clearLocalStorage() {
  if (!confirm('Clear all quotes and restore defaults?')) return;
  localStorage.removeItem(LS_QUOTES_KEY);
  loadQuotesFromLocalStorage();
  populateCategories();
  quoteDisplay.textContent = 'Defaults restored.';
  statusEl.textContent = 'Local storage cleared.';
  setTimeout(() => statusEl.textContent = '', 1600);
}

newQuoteBtn.addEventListener('click', showRandomQuote);
categoryFilter.addEventListener('change', showRandomQuote);
exportBtn.addEventListener('click', exportQuotesAsJson);
importFileInput.addEventListener('change', e => {
  const file = e.target.files && e.target.files[0];
  if (file) importFromJsonFile(file);
  importFileInput.value = '';
});
clearStorageBtn.addEventListener('click', clearLocalStorage);
showLastBtn.addEventListener('click', showLastViewed);

function init() {
  loadQuotesFromLocalStorage();
  populateCategories();
  createAddQuoteForm();
  if (sessionStorage.getItem(SS_LAST_QUOTE)) {
    statusEl.textContent = 'Click "Show Last Viewed" to see your previous quote.';
    setTimeout(() => { statusEl.textContent = ''; }, 2600);
  }
}

init();
