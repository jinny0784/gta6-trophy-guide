// Leonida Legend — filtering logic (pure functions, no DOM access).
//
// A filter set looks like:
//   {
//     query:      'free text',          // matches name, description, guide
//     grade:      'all' | 'platinum' | 'gold' | 'silver' | 'bronze',
//     category:   'all' | <category name>,
//     visibility: 'all' | 'visible' | 'hidden',
//     state:      'all' | 'done' | 'todo',
//     missable:   'all' | 'missable'
//   }

export function emptyFilters() {
  return {
    query: '',
    grade: 'all',
    category: 'all',
    visibility: 'all',
    state: 'all',
    missable: 'all',
  };
}

export function categoriesOf(trophies) {
  const seen = new Set();
  for (const t of trophies) seen.add(t.category);
  return [...seen].sort((a, b) => a.localeCompare(b));
}

function matchesQuery(t, query) {
  if (!query) return true;
  const haystack = `${t.name} ${t.description} ${t.guide} ${t.category}`.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
}

export function applyFilters(trophies, filters, isDone) {
  return trophies.filter((t) => {
    if (filters.grade !== 'all' && t.grade !== filters.grade) return false;
    if (filters.category !== 'all' && t.category !== filters.category) {
      return false;
    }
    if (filters.visibility === 'visible' && t.hidden) return false;
    if (filters.visibility === 'hidden' && !t.hidden) return false;
    if (filters.missable === 'missable' && !t.missable) return false;
    if (filters.state === 'done' && !isDone(t.id)) return false;
    if (filters.state === 'todo' && isDone(t.id)) return false;
    if (!matchesQuery(t, filters.query)) return false;
    return true;
  });
}
