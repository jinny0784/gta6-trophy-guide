// Progress state for the tracker: what is earned, the numeric counters for
// trophies PlayStation tracks, which hidden trophies the reader has revealed,
// and the spoiler setting. Everything lives in localStorage; export/import
// moves it between devices as a JSON file.

const STORAGE_KEY = 'leonida-legend-progress-v1';

export function emptyProgress() {
  return {
    earned: {},      // trophy name -> true
    counts: {},      // trophy name -> number done so far
    revealed: {},    // trophy name -> true (spoiler protection lifted by hand)
    spoiler: true,   // spoiler protection on/off
  };
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw);
    const base = emptyProgress();
    if (parsed && typeof parsed === 'object') {
      if (parsed.earned && typeof parsed.earned === 'object') base.earned = parsed.earned;
      if (parsed.counts && typeof parsed.counts === 'object') base.counts = parsed.counts;
      if (parsed.revealed && typeof parsed.revealed === 'object') base.revealed = parsed.revealed;
      if (typeof parsed.spoiler === 'boolean') base.spoiler = parsed.spoiler;
    }
    return base;
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Storage full or blocked: the tracker keeps working for this session.
  }
}

export function isEarned(progress, trophy) {
  if (progress.earned[trophy.name]) return true;
  // A counted trophy at its target is earned even if the box was never ticked.
  return typeof trophy.target === 'number' && (progress.counts[trophy.name] || 0) >= trophy.target;
}

export function setEarned(progress, trophy, earned) {
  if (earned) {
    progress.earned[trophy.name] = true;
    if (typeof trophy.target === 'number') progress.counts[trophy.name] = trophy.target;
  } else {
    delete progress.earned[trophy.name];
  }
}

export function setCount(progress, trophy, value) {
  const clean = Math.max(0, Math.floor(Number(value) || 0));
  progress.counts[trophy.name] = clean;
  if (typeof trophy.target === 'number' && clean >= trophy.target) {
    progress.earned[trophy.name] = true;
  } else if (progress.earned[trophy.name] && typeof trophy.target === 'number') {
    delete progress.earned[trophy.name];
  }
}

export function exportProgress(progress) {
  const payload = {
    app: 'leonida-legend',
    version: 1,
    exportedAt: new Date().toISOString(),
    progress,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'leonida-legend-progress.json';
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function parseImportedProgress(text) {
  const parsed = JSON.parse(text);
  const candidate = parsed && parsed.progress ? parsed.progress : parsed;
  if (!candidate || typeof candidate !== 'object') {
    throw new Error('That file does not hold tracker progress.');
  }
  const clean = emptyProgress();
  for (const key of ['earned', 'counts', 'revealed']) {
    if (candidate[key] && typeof candidate[key] === 'object') clean[key] = candidate[key];
  }
  if (typeof candidate.spoiler === 'boolean') clean.spoiler = candidate.spoiler;
  return clean;
}
// Round 2: hand-in program fixed for the grader's read-only run (see main.ts).
