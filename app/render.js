// Leonida Legend — rendering.
//
// Builds the progress header and the trophy card list from the data plus the
// player's checklist state. Hidden trophies are spoiler-blurred until the
// player reveals them. All interaction is wired up in app.js through
// data-action attributes, so this module only produces DOM.

const GRADE_LABEL = {
  platinum: 'Platinum',
  gold: 'Gold',
  silver: 'Silver',
  bronze: 'Bronze',
};

const GRADE_ICON = {
  platinum: '✦',
  gold: '★',
  silver: '★',
  bronze: '★',
};

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// One trophy card. `done` and `revealed` come from the store.
export function trophyCard(trophy, done, revealed) {
  const spoiled = trophy.hidden && !revealed;
  const card = el('article', `card grade-border-${trophy.grade}`);
  card.dataset.id = trophy.id;
  if (done) card.classList.add('is-done');
  if (spoiled) card.classList.add('is-spoiled');

  // --- header row: checkbox, grade icon, name, pills -------------------
  const head = el('div', 'card-head');

  const checkLabel = el('label', 'check');
  checkLabel.title = done ? 'Mark as not done' : 'Mark as done';
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = done;
  checkbox.dataset.action = 'toggle-done';
  checkbox.dataset.id = trophy.id;
  const box = el('span', 'box');
  checkLabel.append(checkbox, box);
  head.append(checkLabel);

  const icon = el('span', `grade-icon grade-${trophy.grade}`, GRADE_ICON[trophy.grade]);
  icon.title = GRADE_LABEL[trophy.grade];
  head.append(icon);

  const name = el('h3', 't-name', spoiled ? 'Hidden Trophy' : trophy.name);
  head.append(name);

  const pills = el('div', 'pills');
  pills.append(el('span', `pill pill-${trophy.grade}`, GRADE_LABEL[trophy.grade]));
  if (trophy.hidden) pills.append(el('span', 'pill pill-hidden', 'Hidden'));
  if (trophy.missable) pills.append(el('span', 'pill pill-missable', 'Missable'));
  head.append(pills);
  card.append(head);

  // --- body: description + guide, blurred while spoiled ----------------
  const body = el('div', 'card-body');
  if (spoiled) body.classList.add('blurred');

  const desc = el('p', 't-desc', spoiled ? 'Hidden description' : trophy.description);
  body.append(desc);

  const meta = el('p', 't-meta', trophy.category);
  body.append(meta);

  const guideWrap = el('div', 't-guide');
  guideWrap.append(el('h4', null, 'How to unlock'));
  guideWrap.append(el('p', null, trophy.guide));
  body.append(guideWrap);
  card.append(body);

  if (spoiled) {
    const revealBtn = el('button', 'reveal-btn', '👁 Reveal spoiler');
    revealBtn.type = 'button';
    revealBtn.dataset.action = 'reveal';
    revealBtn.dataset.id = trophy.id;
    card.append(revealBtn);
  }

  return card;
}

export function renderList(container, trophies, state, Store) {
  container.textContent = '';
  const fragment = document.createDocumentFragment();
  for (const trophy of trophies) {
    fragment.append(
      trophyCard(
        trophy,
        Store.isDone(state, trophy.id),
        Store.isRevealed(state, trophy.id),
      ),
    );
  }
  container.append(fragment);
}

// Progress header: big percentage, a bar, and per-grade counts.
export function renderProgress(container, summary) {
  container.textContent = '';

  const big = el('div', 'progress-big');
  big.append(el('span', 'progress-pct', `${summary.percent}%`));
  big.append(
    el('span', 'progress-count', `${summary.done} / ${summary.total} trophies`),
  );
  container.append(big);

  const barOuter = el('div', 'progress-bar');
  const barInner = el('div', 'progress-fill');
  barInner.style.width = `${summary.percent}%`;
  barOuter.append(barInner);
  container.append(barOuter);

  const chips = el('div', 'progress-chips');
  for (const grade of ['platinum', 'gold', 'silver', 'bronze']) {
    const g = summary.byGrade[grade];
    const chip = el(
      'span',
      `chip chip-${grade}`,
      `${GRADE_ICON[grade]} ${GRADE_LABEL[grade]} ${g.done}/${g.total}`,
    );
    chips.append(chip);
  }
  container.append(chips);
}
