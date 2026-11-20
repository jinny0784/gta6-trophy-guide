// Leonida Legend — progress store.
//
// Keeps the player's checklist state in localStorage so progress survives
// closing the tab, and handles export / import of that state as JSON so it
// can be backed up or moved between browsers and machines.
//
// State shape:
//   {
//     done:     { [trophyId]: true },   // trophies ticked off
//     revealed: { [trophyId]: true }    // hidden trophies the user un-blurred
//   }

const STORAGE_KEY = 'leonida-legend-progress-v1';

function emptyState() {
  return { done: {}, revealed: {} };
}

function load() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return emptyState();
    return {
      done: parsed.done && typeof parsed.done === 'object' ? parsed.done : {},
      revealed:
        parsed.revealed && typeof parsed.revealed === 'object'
          ? parsed.revealed
          : {},
    };
  } catch (err) {
    // Corrupt or unavailable storage should never break the guide.
    return emptyState();
  }
}

function save(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    // Storage full / private mode: the in-memory state still works for the
    // session, it just will not persist.
  }
}

function isDone(state, id) {
  return state.done[id] === true;
}

function toggleDone(state, id) {
  if (state.done[id]) {
    delete state.done[id];
  } else {
    state.done[id] = true;
  }
  save(state);
  return state.done[id] === true;
}

function isRevealed(state, id) {
  return state.revealed[id] === true;
}

function reveal(state, id) {
  state.revealed[id] = true;
  save(state);
}

function resetAll(state) {
  state.done = {};
  state.revealed = {};
  save(state);
}

// Progress summary for the header: overall plus a per-grade breakdown.
function progress(state, trophies) {
  const byGrade = {
    platinum: { done: 0, total: 0 },
    gold: { done: 0, total: 0 },
    silver: { done: 0, total: 0 },
    bronze: { done: 0, total: 0 },
  };
  let done = 0;
  for (const t of trophies) {
    byGrade[t.grade].total += 1;
    if (isDone(state, t.id)) {
      done += 1;
      byGrade[t.grade].done += 1;
    }
  }
  const total = trophies.length;
  return {
    done,
    total,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
    byGrade,
  };
}

// Export: a small JSON document the user can save or paste elsewhere.
function exportJSON(state) {
  return JSON.stringify(
    {
      app: 'leonida-legend',
      version: 1,
      exportedAt: new Date().toISOString(),
      done: Object.keys(state.done).filter((id) => state.done[id]),
      revealed: Object.keys(state.revealed).filter((id) => state.revealed[id]),
    },
    null,
    2,
  );
}

// Import: accepts the export format above (arrays of ids). Returns true on
// success, false if the text is not a recognisable export.
function importJSON(state, text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (err) {
    return false;
  }
  if (!parsed || typeof parsed !== 'object') return false;
  const doneList = Array.isArray(parsed.done) ? parsed.done : null;
  const revealedList = Array.isArray(parsed.revealed) ? parsed.revealed : null;
  if (!doneList && !revealedList) return false;
  state.done = {};
  state.revealed = {};
  for (const id of doneList || []) {
    if (typeof id === 'string') state.done[id] = true;
  }
  for (const id of revealedList || []) {
    if (typeof id === 'string') state.revealed[id] = true;
  }
  save(state);
  return true;
}

export const Store = {
  STORAGE_KEY,
  load,
  save,
  isDone,
  toggleDone,
  isRevealed,
  reveal,
  resetAll,
  progress,
  exportJSON,
  importJSON,
};
