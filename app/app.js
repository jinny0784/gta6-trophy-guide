// Leonida Legend — app wiring.
//
// Loads the trophy data, restores the player's checklist from the store,
// binds the filter controls and the export / import actions, and re-renders
// the list whenever anything changes. Everything runs locally; the only
// network request is the data file sitting next to this page.

import { Store } from './store.js';
import { emptyFilters, categoriesOf, applyFilters } from './filters.js';
import { renderList, renderProgress } from './render.js';

const els = {
  list: document.getElementById('trophy-list'),
  empty: document.getElementById('empty-state'),
  progress: document.getElementById('progress'),
  search: document.getElementById('filter-search'),
  grade: document.getElementById('filter-grade'),
  category: document.getElementById('filter-category'),
  visibility: document.getElementById('filter-visibility'),
  state: document.getElementById('filter-state'),
  missable: document.getElementById('filter-missable'),
  resultCount: document.getElementById('result-count'),
  exportBtn: document.getElementById('btn-export'),
  importBtn: document.getElementById('btn-import'),
  importDialog: document.getElementById('import-dialog'),
  importText: document.getElementById('import-text'),
  importFile: document.getElementById('import-file'),
  importApply: document.getElementById('import-apply'),
  importCancel: document.getElementById('import-cancel'),
  importError: document.getElementById('import-error'),
  resetBtn: document.getElementById('btn-reset'),
  loadError: document.getElementById('load-error'),
};

let trophies = [];
let state = Store.load();
const filters = emptyFilters();

function refresh() {
  const visible = applyFilters(trophies, filters, (id) => Store.isDone(state, id));
  renderList(els.list, visible, state, Store);
  renderProgress(els.progress, Store.progress(state, trophies));
  els.empty.hidden = visible.length !== 0;
  els.resultCount.textContent =
    visible.length === trophies.length
      ? `Showing all ${trophies.length} trophies`
      : `Showing ${visible.length} of ${trophies.length} trophies`;
}

function bindControls() {
  els.search.addEventListener('input', () => {
    filters.query = els.search.value.trim();
    refresh();
  });
  els.grade.addEventListener('change', () => {
    filters.grade = els.grade.value;
    refresh();
  });
  els.category.addEventListener('change', () => {
    filters.category = els.category.value;
    refresh();
  });
  els.visibility.addEventListener('change', () => {
    filters.visibility = els.visibility.value;
    refresh();
  });
  els.state.addEventListener('change', () => {
    filters.state = els.state.value;
    refresh();
  });
  els.missable.addEventListener('change', () => {
    filters.missable = els.missable.value;
    refresh();
  });

  // One delegated listener for everything inside the card list.
  els.list.addEventListener('change', (event) => {
    const target = event.target;
    if (target.dataset && target.dataset.action === 'toggle-done') {
      Store.toggleDone(state, target.dataset.id);
      refresh();
    }
  });
  els.list.addEventListener('click', (event) => {
    const target = event.target.closest('[data-action="reveal"]');
    if (target) {
      Store.reveal(state, target.dataset.id);
      refresh();
    }
  });
}

function bindActions() {
  els.exportBtn.addEventListener('click', () => {
    const blob = new Blob([Store.exportJSON(state)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leonida-legend-progress.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  els.importBtn.addEventListener('click', () => {
    els.importError.textContent = '';
    els.importText.value = '';
    if (typeof els.importDialog.showModal === 'function') {
      els.importDialog.showModal();
    }
  });
  els.importCancel.addEventListener('click', () => {
    els.importDialog.close();
  });
  els.importFile.addEventListener('change', () => {
    const file = els.importFile.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      els.importText.value = String(reader.result || '');
    };
    reader.readAsText(file);
  });
  els.importApply.addEventListener('click', () => {
    if (Store.importJSON(state, els.importText.value)) {
      state = Store.load();
      els.importDialog.close();
      refresh();
    } else {
      els.importError.textContent =
        'That does not look like a Leonida Legend progress export. Paste the JSON from an export and try again.';
    }
  });

  els.resetBtn.addEventListener('click', () => {
    if (window.confirm('Reset all progress and revealed spoilers?')) {
      Store.resetAll(state);
      refresh();
    }
  });
}

async function boot() {
  bindControls();
  bindActions();
  try {
    const response = await fetch('data/trophies.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    trophies = data.trophies;
  } catch (err) {
    els.loadError.hidden = false;
    els.loadError.textContent =
      'Could not load data/trophies.json. If you opened this page as a file:// URL, ' +
      'some browsers block local data files — serve the app folder with any static ' +
      'file server (for example `npx serve app`) and reload.';
    return;
  }

  for (const category of categoriesOf(trophies)) {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    els.category.append(option);
  }
  refresh();
}

boot();
