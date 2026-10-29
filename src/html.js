const STATUSES = new Set(['good', 'watch', 'broken']);

function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function requireWord(word) {
  if (word == null || String(word).trim() === '') {
    throw new Error('A status needs a word');
  }
  return escapeHtml(word);
}

function statusName(status) {
  if (!STATUSES.has(status)) throw new Error('Unknown status');
  return status;
}

function card(inner) {
  return `<section class="card">${inner}</section>`;
}

function metricCard({ label, value, detail, size = 'display' }) {
  const valueClass = size === 'title' ? 'metric-value is-title num' : 'metric-value num';
  return `<div class="metric">
    <span class="metric-label">${escapeHtml(label)}</span>
    <span class="${valueClass}">${escapeHtml(value)}</span>
    <span class="metric-detail">${escapeHtml(detail)}</span>
  </div>`;
}

function statusDot(status, word) {
  const name = statusName(status);
  return `<span class="status-dot status-${name}"><span class="status-mark" aria-hidden="true"></span>${requireWord(word)}</span>`;
}

function statusChip(status, word) {
  const name = statusName(status);
  return `<span class="status-chip status-${name}">${requireWord(word)}</span>`;
}

function button(label, { quiet = false, disabled = false, id = '', type = 'button' } = {}) {
  const classes = quiet ? 'btn btn-quiet' : 'btn';
  const extra = id ? ` id="${escapeHtml(id)}"` : '';
  const off = disabled ? ' disabled' : '';
  const kind = type === 'submit' ? 'submit' : 'button';
  return `<button type="${kind}" class="${classes}"${extra}${off}>${escapeHtml(label)}</button>`;
}

function banner(status, message, actions) {
  return `<div class="banner" role="alert" data-status="${statusName(status)}">
    <p class="status-${statusName(status)}">${escapeHtml(message)}</p>
    <div>${actions}</div>
  </div>`;
}

function skeleton({ display = false } = {}) {
  const blocks = display
    ? '<span class="skeleton is-display"></span><span class="skeleton is-line"></span>'
    : '<span class="skeleton"></span><span class="skeleton is-line"></span>';
  return `<div class="skeleton-block" aria-hidden="true">${blocks}</div>`;
}

function emptyState(message) {
  return `<p class="empty">${escapeHtml(message)}</p>`;
}

function header({ mark, logoHtml, subtitle, asideHtml, markHtml = '' }) {
  return `<header class="site-header">
    <div class="brand">
      <div class="brand-row">
        <span class="mark">${markHtml}${escapeHtml(mark)}</span>
        <span class="brand-divider" aria-hidden="true"></span>
        ${logoHtml}
      </div>
      <p class="brand-sub">${escapeHtml(subtitle)}</p>
    </div>
    <div class="header-aside">${asideHtml}</div>
  </header>`;
}

function monthCard({ name, status, statusWord, value, line, selected = false, dashed = false, month = '' }) {
  const classes = ['month-card'];
  if (selected) classes.push('is-selected');
  if (dashed) classes.push('is-dashed');
  const monthAttr = month ? ` data-month="${escapeHtml(month)}"` : '';
  return `<button type="button" class="${classes.join(' ')}" data-month-card="true"${monthAttr}${selected ? ' aria-current="true"' : ''}>
    <span class="month-card-name">${escapeHtml(name)}</span>
    ${statusDot(status, statusWord)}
    <span class="month-card-value num">${escapeHtml(value)}</span>
    <span class="month-card-line">${escapeHtml(line)}</span>
  </button>`;
}

function monthPicker(cards) {
  return `<div class="month-picker" role="listbox">${cards}</div>`;
}

function dataTable({ columns, rows }) {
  const head = columns.map((column) => (
    `<th scope="col"><button type="button" class="sort" data-sort="${escapeHtml(column.key)}">${escapeHtml(column.label)}</button></th>`
  )).join('');
  const body = rows.map((row) => {
    const cells = columns.map((column) => `<td>${row.cells[column.key]}</td>`).join('');
    const open = row.expanded ? ' data-open="true"' : '';
    const attrs = Object.entries(row.attrs || {}).map(([key, value]) => ` ${key}="${escapeHtml(value)}"`).join('');
    const detail = row.detailHtml
      ? `<tr class="data-detail"><td colspan="${columns.length}">${row.detailHtml}</td></tr>`
      : '';
    return `<tr class="data-row"${open}${attrs}>${cells}</tr>${detail}`;
  }).join('');
  return `<table class="data-table"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function dialog(title, body) {
  return `<div class="dialog" role="dialog" aria-label="${escapeHtml(title)}"><h2 class="section-title">${escapeHtml(title)}</h2>${body}</div>`;
}

function renderDemo() {
  const logo = '<img class="partner-logo" alt="Ventrix" src="/partners/ventrix.png">';
  const table = dataTable({
    columns: [
      { key: 'school', label: 'School' },
      { key: 'returned', label: 'Returned' },
    ],
    rows: [
      {
        cells: { school: 'West', returned: '<span class="num">$1,200</span>' },
        expanded: true,
        detailHtml: 'Lead ID · Sold on · Value · Time to return',
      },
      { cells: { school: 'East', returned: '<span class="num">$400</span>' } },
    ],
  });
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Stout UI</title>
  <link rel="stylesheet" href="../dist/tokens.css">
  <link rel="stylesheet" href="../src/components.css">
</head>
<body class="stout">
  <main class="page stack">
    ${header({
      mark: 'Orbit',
      logoHtml: logo,
      subtitle: 'October lead sales',
      asideHtml: `<p class="brand-sub">Last pulled from Ventrix 2:45 PM CT</p>${statusDot('good', 'Up to date')}`,
    })}
    ${card(metricCard({ label: 'Expected payment from Ventrix', value: '$12,400', detail: 'We sold $18,000 in leads. Ventrix has returned $5,600 so far.' }))}
    ${metricCard({ label: 'Returns so far', value: '$640', detail: '4 leads returned', size: 'title' })}
    ${statusChip('good', '▲ Under budget')}
    ${statusChip('watch', 'Near budget')}
    ${statusChip('broken', 'Over budget')}
    ${statusDot('good', 'Up to date')}
    ${statusDot('watch', 'Not updated in 1h 12m')}
    ${statusDot('broken', 'No pull since 9:17 AM CT')}
    ${button('Pull now')}
    ${button('See run log', { quiet: true })}
    ${button('Unavailable', { disabled: true })}
    ${banner('broken', 'The portal rejected our login at 9:17 AM and every 15 min since.', `${button('Pull now', { id: 'pull-now' })}${button('See run log', { quiet: true })}`)}
    ${skeleton({ display: true })}
    ${emptyState('No October sales yet')}
    ${monthPicker([
      monthCard({
        name: 'July', status: 'good', statusWord: 'Final', value: '$181,823', line: '12.4% returned',
      }),
      monthCard({
        name: 'August', status: 'watch', statusWord: 'Pending', value: '$210,000', line: '18.2% returned', selected: true,
      }),
      monthCard({
        name: 'September', status: 'watch', statusWord: 'Pending', value: '$132,000', line: '16.1% returned',
      }),
      monthCard({
        name: 'October', status: 'good', statusWord: 'Pending', value: '—', line: 'No October sales yet', dashed: true,
      }),
    ].join(''))}
    ${card(table)}
    ${dialog('Run log', '<p>Newest first.</p>')}
  </main>
  <script type="module" src="../src/behavior.js"></script>
</body>
</html>
`;
}

export {
  banner,
  button,
  card,
  dataTable,
  dialog,
  emptyState,
  escapeHtml,
  header,
  metricCard,
  monthCard,
  monthPicker,
  renderDemo,
  skeleton,
  statusChip,
  statusDot,
};
