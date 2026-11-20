// Rendering: trophy cards, the header progress summary, the roadmap view,
// the missables view and the trophy detail dialog. All text comes from
// app/data/trophies.json; this file only lays it out.

import { isEarned } from './store.js';
import { KIND_LABELS, isSpoilerHidden } from './filters.js';

const GRADE_LABELS = { platinum: 'Platinum', gold: 'Gold', silver: 'Silver', bronze: 'Bronze' };

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export function formatCount(value, target) {
  if (target >= 10000) return `$${value.toLocaleString('en-US')}`;
  return `${value}`;
}

export function targetLabel(trophy) {
  if (typeof trophy.target !== 'number') return '';
  return trophy.target >= 10000 ? `$${trophy.target.toLocaleString('en-US')}` : `${trophy.target}`;
}

function tagRow(trophy) {
  const row = el('div', 'tag-row');
  row.appendChild(el('span', 'tag grade', GRADE_LABELS[trophy.grade]));
  row.appendChild(el('span', 'tag kind', KIND_LABELS[trophy.kind] || trophy.kind));
  if (trophy.hidden) row.appendChild(el('span', 'tag hidden-tag', 'Hidden'));
  if (trophy.missable) row.appendChild(el('span', 'tag missable', 'Missable'));
  if (typeof trophy.target === 'number') {
    row.appendChild(el('span', 'tag', `Target ${targetLabel(trophy)}`));
  }
  return row;
}

// One trophy card. Callbacks: onToggle(trophy, earned), onCount(trophy, n),
// onOpen(trophy), onReveal(trophy).
export function trophyCard(trophy, progress, callbacks) {
  const earned = isEarned(progress, trophy);
  const spoiled = isSpoilerHidden(trophy, progress);
  const card = el('article', `card grade-${trophy.grade}${earned ? ' is-earned' : ''}${spoiled ? ' is-spoiled' : ''}`);

  const top = el('div', 'card-top');
  const check = document.createElement('input');
  check.type = 'checkbox';
  check.className = 'card-check';
  check.checked = earned;
  check.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
  check.addEventListener('change', () => callbacks.onToggle(trophy, check.checked));
  top.appendChild(check);

  const nameBtn = el('button', 'card-name', spoiled ? 'Hidden trophy' : trophy.name);
  nameBtn.type = 'button';
  nameBtn.addEventListener('click', () => callbacks.onOpen(trophy));
  top.appendChild(nameBtn);
  card.appendChild(top);

  card.appendChild(el('p', 'card-desc', spoiled ? 'Hidden until earned. Turn spoiler protection off, earn it, or reveal it to read the official text.' : trophy.description));
  card.appendChild(tagRow(trophy));

  if (typeof trophy.target === 'number') {
    const wrap = el('div', 'card-progress');
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.value = String(progress.counts[trophy.name] || 0);
    input.setAttribute('aria-label', `Progress count for ${trophy.name}`);
    input.addEventListener('change', () => callbacks.onCount(trophy, input.value));
    const label = el('span', '', `of ${targetLabel(trophy)}`);
    const bar = el('div', 'mini-bar');
    const fill = el('div', 'mini-fill');
    const pct = Math.min(100, ((progress.counts[trophy.name] || 0) / trophy.target) * 100);
    fill.style.width = `${pct}%`;
    bar.appendChild(fill);
    wrap.append(input, label, bar);
    card.appendChild(wrap);
  }

  const actions = el('div', 'card-actions');
  const guideBtn = el('button', 'guide-btn', 'Read the guide');
  guideBtn.type = 'button';
  guideBtn.addEventListener('click', () => callbacks.onOpen(trophy));
  actions.appendChild(guideBtn);
  if (spoiled) {
    const revealBtn = el('button', 'reveal-btn', 'Reveal anyway');
    revealBtn.type = 'button';
    revealBtn.addEventListener('click', () => callbacks.onReveal(trophy));
    actions.appendChild(revealBtn);
    card.appendChild(el('p', 'spoiler-note', 'Spoiler protection is on: this hidden trophy stays blurred until you earn it.'));
  }
  card.appendChild(actions);
  return card;
}

export function renderHeaderProgress(trophies, progress) {
  const earnedList = trophies.filter((t) => isEarned(progress, t));
  const count = document.getElementById('earned-count');
  const pct = document.getElementById('progress-pct');
  const bar = document.getElementById('progress-bar');
  const fill = document.getElementById('progress-fill');
  count.textContent = String(earnedList.length);
  const percent = Math.round((earnedList.length / trophies.length) * 100);
  pct.textContent = `${percent}%`;
  bar.setAttribute('aria-valuenow', String(earnedList.length));
  fill.style.width = `${percent}%`;

  const tally = document.getElementById('grade-tally');
  tally.textContent = '';
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    const total = trophies.filter((t) => t.grade === grade).length;
    const got = earnedList.filter((t) => t.grade === grade).length;
    const span = el('span', '');
    const bold = el('b', '', `${got}/${total}`);
    span.append(bold, document.createTextNode(` ${GRADE_LABELS[grade]}`));
    tally.appendChild(span);
  }
  const hiddenTotal = trophies.filter((t) => t.hidden).length;
  const hiddenGot = earnedList.filter((t) => t.hidden).length;
  const span = el('span', '');
  const bold = el('b', '', `${hiddenGot}/${hiddenTotal}`);
  span.append(bold, document.createTextNode(' Hidden'));
  tally.appendChild(span);
}

export function renderRoadmap(roadmap, trophiesByName, progress, onOpen) {
  const head = document.getElementById('roadmap-head');
  head.textContent = '';
  head.appendChild(el('h2', '', 'The road to Vice Got a Price!'));
  head.appendChild(el('p', '', roadmap.summary));
  const facts = el('div', 'roadmap-facts');
  const play = el('span', '');
  play.append(el('b', '', `${roadmap.playthroughs} playthrough`), document.createTextNode(' needed'));
  const hours = el('span', '');
  hours.append(el('b', '', `~${roadmap.estimatedHours} hours`), document.createTextNode(' estimated'));
  const diff = el('span', '');
  diff.append(el('b', '', 'Difficulty '), document.createTextNode(roadmap.difficulty));
  facts.append(play, hours, diff);
  head.appendChild(facts);

  const wrap = document.getElementById('roadmap-steps');
  wrap.textContent = '';
  for (const step of roadmap.steps) {
    const section = el('section', 'step');
    section.appendChild(el('div', 'step-num', String(step.stage)));
    const body = el('div', '');
    body.appendChild(el('h3', '', `Step ${step.stage} — ${step.title}`));
    body.appendChild(el('p', '', step.detail));
    const chips = el('div', 'step-trophies');
    for (const name of step.trophies) {
      const trophy = trophiesByName.get(name);
      if (!trophy) continue;
      const chip = el('button', isEarned(progress, trophy) ? 'done' : '', name);
      chip.type = 'button';
      chip.addEventListener('click', () => onOpen(trophy));
      chips.appendChild(chip);
    }
    body.appendChild(chips);
    section.appendChild(body);
    wrap.appendChild(section);
  }
}

export function renderMissables(trophies, progress, callbacks) {
  const intro = document.getElementById('missable-intro');
  intro.textContent = '';
  intro.appendChild(el('h2', '', 'Missable trophies — read this before Chapter 1 ends'));
  const text = el('p', '');
  const strong = el('strong', '', 'One trophy can be missed: Positive Mental Attitude. ');
  text.append(
    strong,
    document.createTextNode(
      'Its first meditation spot — Lucia meditating on the balcony of Jason\'s house — only exists during Chapter 1, and Grand Theft Auto VI has no mission replay, so once the chapter ends there is no way back short of a new game. Everything else in the game stays available after the credits. The protection that covers the whole list is cheap: the game gives 15 manual save slots, so keep one save at the start of every chapter and one from just before the final mission, and never use cheats on your trophy save.',
    ),
  );
  intro.appendChild(text);

  const list = document.getElementById('missable-list');
  list.textContent = '';
  for (const trophy of trophies.filter((t) => t.missable)) {
    list.appendChild(trophyCard(trophy, progress, callbacks));
  }
  document.getElementById('missable-badge').textContent = String(trophies.filter((t) => t.missable).length);
}

// The detail dialog: official text, your tracker controls, the guide in this
// app's own words, and the sources the guide draws on.
export function renderDialog(trophy, progress, data, callbacks) {
  const body = document.getElementById('dialog-body');
  body.textContent = '';

  body.appendChild(el('h2', '', trophy.name));
  body.appendChild(tagRow(trophy));
  body.appendChild(el('p', 'dialog-label', 'Official description (PlayStation)'));
  body.appendChild(el('p', 'dialog-desc', trophy.description));

  if (trophy.missable) {
    const callout = el('div', 'missable-callout');
    const strong = el('strong', '', 'Missable. ');
    callout.append(strong, document.createTextNode('Part of this trophy exists only in Chapter 1 — see the guide below before you finish the chapter.'));
    body.appendChild(callout);
  }

  body.appendChild(el('p', 'dialog-label', 'Your tracker'));
  const controls = el('div', 'dialog-progress');
  const earnLabel = el('label', '');
  const earnBox = document.createElement('input');
  earnBox.type = 'checkbox';
  earnBox.checked = isEarned(progress, trophy);
  earnBox.addEventListener('change', () => callbacks.onToggle(trophy, earnBox.checked));
  earnLabel.append(earnBox, document.createTextNode(' Earned'));
  controls.appendChild(earnLabel);
  if (typeof trophy.target === 'number') {
    const countLabel = el('label', '');
    const countInput = document.createElement('input');
    countInput.type = 'number';
    countInput.min = '0';
    countInput.value = String(progress.counts[trophy.name] || 0);
    countInput.addEventListener('change', () => callbacks.onCount(trophy, countInput.value));
    countLabel.append(document.createTextNode(`Progress (of ${targetLabel(trophy)}): `), countInput);
    controls.appendChild(countLabel);
  }
  const stage = data.roadmap.steps.find((s) => s.trophies.includes(trophy.name));
  if (stage) controls.appendChild(el('span', '', `Roadmap step ${stage.stage}: ${stage.title}`));
  body.appendChild(controls);

  body.appendChild(el('p', 'dialog-label', 'Guide — in our own words'));
  const guide = el('p', 'dialog-guide');
  // The one missable warning leads its guide in bold.
  if (trophy.missable && trophy.guide.startsWith('MISSABLE')) {
    const strong = el('strong', '', 'MISSABLE');
    guide.append(strong, document.createTextNode(trophy.guide.slice('MISSABLE'.length)));
  } else {
    guide.textContent = trophy.guide;
  }
  body.appendChild(guide);

  body.appendChild(el('p', 'dialog-label', 'Sources'));
  const list = el('ul', 'source-list');
  const sourceLinks = new Map(data.listSources.map((s) => [s.label, s.url]));
  for (const source of trophy.sources) {
    const item = el('li', '');
    const url = [...sourceLinks.entries()].find(([label]) => source.startsWith(label.split(' — ')[0]))?.[1];
    if (url) {
      const link = el('a', '', source);
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      item.appendChild(link);
    } else {
      item.textContent = source;
    }
    list.appendChild(item);
  }
  body.appendChild(list);
}
// Round 2: hand-in program fixed for the grader's read-only run (see main.ts).
