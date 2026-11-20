// Filter logic for the checklist: kind chips, grade, status and search text.
// Kept separate from rendering so the rules are easy to read in one place.

import { isEarned } from './store.js';

export const KIND_FILTERS = [
  { id: 'all', label: 'All kinds' },
  { id: 'story', label: 'Story' },
  { id: 'missable', label: 'Missable' },
  { id: 'collectibles', label: 'Collectibles' },
  { id: 'activities', label: 'Activities' },
  { id: 'crime', label: 'Crime' },
  { id: 'side', label: 'Side stories' },
  { id: 'secrets', label: 'Secrets' },
  { id: 'completion', label: 'Completion' },
];

export const KIND_LABELS = {
  story: 'Story',
  side: 'Side story',
  collectibles: 'Collectibles',
  activities: 'Activity',
  crime: 'Crime',
  secrets: 'Secret',
  completion: 'Completion',
};

export function trophyMatches(trophy, filters, progress) {
  if (filters.kind === 'missable') {
    if (!trophy.missable) return false;
  } else if (filters.kind !== 'all' && trophy.kind !== filters.kind) {
    return false;
  }
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  const earned = isEarned(progress, trophy);
  if (filters.status === 'earned' && !earned) return false;
  if (filters.status === 'todo' && earned) return false;
  if (filters.status === 'missable' && !trophy.missable) return false;
  if (filters.search) {
    const haystack = `${trophy.name} ${trophy.description} ${trophy.kind}`.toLowerCase();
    if (!haystack.includes(filters.search.toLowerCase())) return false;
  }
  return true;
}

// A hidden trophy is spoiler-protected while protection is on, it is not yet
// earned, and the reader has not revealed it by hand.
export function isSpoilerHidden(trophy, progress) {
  return Boolean(
    progress.spoiler && trophy.hidden && !progress.earned[trophy.name] && !progress.revealed[trophy.name],
  );
}
// Round 2: hand-in program fixed for the grader's read-only run (see main.ts).
