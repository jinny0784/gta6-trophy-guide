// Leonida Legend — entry point. Loads the trophy data, restores the reader's
// progress, and wires the checklist, filters, roadmap, missables view, detail
// dialog and export/import together. Everything runs from local files.

import {
  loadProgress, saveProgress, setEarned, setCount,
  exportProgress, parseImportedProgress,
} from './store.js';
import { KIND_FILTERS, trophyMatches } from './filters.js';
import {
  trophyCard, renderHeaderProgress, renderRoadmap, renderMissables, renderDialog,
} from './render.js';

const state = {
  data: null,
  trophiesByName: new Map(),
  progress: loadProgress(),
  view: 'trophies',
  filters: { kind: 'all', grade: 'all', status: 'all', search: '' },
};

function persistAndRender() {
  saveProgress(state.progress);
  renderAll();
}

const callbacks = {
  onToggle(trophy, earned) {
    setEarned(state.progress, trophy, earned);
    persistAndRender();
  },
  onCount(trophy, value) {
    setCount(state.progress, trophy, value);
    persistAndRender();
  },
  onReveal(trophy) {
    state.progress.revealed[trophy.name] = true;
    persistAndRender();
  },
  onOpen(trophy) {
    openDialog(trophy);
  },
};

function openDialog(trophy) {
  renderDialog(trophy, state.progress, state.data, callbacks);
  const dialog = document.getElementById('trophy-dialog');
  if (typeof dialog.showModal === 'function') dialog.showModal();
}

function renderList() {
  const grid = document.getElementById('trophy-grid');
  grid.textContent = '';
  const shown = state.data.trophies.filter((t) => trophyMatches(t, state.filters, state.progress));
  for (const trophy of shown) grid.appendChild(trophyCard(trophy, state.progress, callbacks));
  document.getElementById('empty-state').hidden = shown.length > 0;
  document.getElementById('result-count').textContent =
    `Showing ${shown.length} of ${state.data.trophies.length} trophies`;
}

function renderFooterSources() {
  const line = document.getElementById('footer-sources');
  line.textContent = 'List sources: ';
  state.data.listSources.forEach((source, index) => {
    if (index > 0) line.appendChild(document.createTextNode(' · '));
    if (source.url) {
      const link = document.createElement('a');
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = source.label;
      line.appendChild(link);
    } else {
      line.appendChild(document.createTextNode(source.label));
    }
  });
}

function renderAll() {
  renderHeaderProgress(state.data.trophies, state.progress);
  renderList();
  renderRoadmap(state.data.roadmap, state.trophiesByName, state.progress, callbacks.onOpen);
  renderMissables(state.data.trophies, state.progress, callbacks);
  const toggle = document.getElementById('spoiler-toggle');
  toggle.checked = state.progress.spoiler;
}

function buildKindChips() {
  const row = document.getElementById('kind-chips');
  for (const kind of KIND_FILTERS) {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = `chip${state.filters.kind === kind.id ? ' is-active' : ''}`;
    chip.textContent = kind.label;
    chip.addEventListener('click', () => {
      state.filters.kind = kind.id;
      for (const other of row.children) other.classList.remove('is-active');
      chip.classList.add('is-active');
      renderList();
    });
    row.appendChild(chip);
  }
}

function wireToolbar() {
  document.getElementById('search').addEventListener('input', (event) => {
    state.filters.search = event.target.value.trim();
    renderList();
  });
  document.getElementById('grade-filter').addEventListener('change', (event) => {
    state.filters.grade = event.target.value;
    renderList();
  });
  document.getElementById('status-filter').addEventListener('change', (event) => {
    state.filters.status = event.target.value;
    renderList();
  });
  document.getElementById('spoiler-toggle').addEventListener('change', (event) => {
    state.progress.spoiler = event.target.checked;
    persistAndRender();
  });
  document.getElementById('clear-filters').addEventListener('click', () => {
    state.filters = { kind: 'all', grade: 'all', status: 'all', search: '' };
    document.getElementById('search').value = '';
    document.getElementById('grade-filter').value = 'all';
    document.getElementById('status-filter').value = 'all';
    buildKindChipsRefresh();
    renderList();
  });
  document.getElementById('export-btn').addEventListener('click', () => exportProgress(state.progress));
  const fileInput = document.getElementById('import-file');
  document.getElementById('import-btn').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      state.progress = parseImportedProgress(text);
      persistAndRender();
    } catch {
      alert('That file could not be read as Leonida Legend progress.');
    }
    fileInput.value = '';
  });
  document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm('Clear all tracked progress in this browser?')) {
      state.progress = { earned: {}, counts: {}, revealed: {}, spoiler: state.progress.spoiler };
      persistAndRender();
    }
  });
}

function buildKindChipsRefresh() {
  const row = document.getElementById('kind-chips');
  row.textContent = '';
  buildKindChips();
}

function wireTabs() {
  const tabs = document.querySelectorAll('.tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      state.view = tab.dataset.view;
      tabs.forEach((other) => other.classList.toggle('is-active', other === tab));
      for (const view of ['trophies', 'roadmap', 'missables']) {
        const section = document.getElementById(`view-${view}`);
        const active = view === state.view;
        section.hidden = !active;
        section.classList.toggle('is-active', active);
      }
      document.getElementById('toolbar').style.display = state.view === 'trophies' ? '' : 'none';
      window.scrollTo({ top: 0 });
    });
  });
}

async function boot() {
  const response = await fetch('data/trophies.json');
  state.data = await response.json();
  state.trophiesByName = new Map(state.data.trophies.map((t) => [t.name, t]));
  buildKindChips();
  wireToolbar();
  wireTabs();
  renderFooterSources();
  renderAll();
  document.getElementById('dialog-close').addEventListener('click', () => {
    document.getElementById('trophy-dialog').close();
  });
}

boot().catch((error) => {
  document.getElementById('result-count').textContent =
    `The trophy data could not be loaded (${error.message}). Serve the app/ folder over HTTP and reload.`;
});
