// The Datify frame: one header bar and one side menu around every screen of
// every Datify tool, plus the one shared toolbar (freshness, date range, bot
// toggle). Server-rendered strings; the products wrap their own bodies.
//
// DATIFY-STANDARDS.md §9 "Suite": one 56px white bar with a 2px ink rule.
// Left: the Datify name. Middle: the command bar. Right: Ask Vega and the
// account menu. The side menu holds the nine sections in a fixed order.
// Every screen is one of three kinds — stats, tools, management — carried as
// a data attribute so a product can style or test by kind without new CSS.
import { escapeHtml } from './html.js';

export const SECTIONS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'publishers', label: 'Publishers' },
  { key: 'offers', label: 'Offers' },
  { key: 'leads', label: 'Leads' },
  { key: 'advertisers', label: 'Advertisers' },
  { key: 'reports', label: 'Reports' },
  { key: 'money', label: 'Money' },
  { key: 'outreach', label: 'Outreach' },
  { key: 'team', label: 'Team' },
];

export const KINDS = new Set(['stats', 'tools', 'management']);

function sectionList(hrefs, active, hidden) {
  return SECTIONS.filter(({ key }) => key === active || !hidden.has(key)).map(({ key, label }) => {
    const href = hrefs[key] || `/${key}`;
    const current = key === active ? ' aria-current="page"' : '';
    return `<li><a class="frame-section" href="${escapeHtml(href)}"${current}>${escapeHtml(label)}</a></li>`;
  }).join('');
}

/**
 * The bar, the side menu, and the main column around `body`.
 *
 * active: one of the nine section keys. kind: stats | tools | management.
 * hrefs: { [sectionKey]: url } — a product fills in where each section lives
 *   (sections may be on other datify.ai hosts); missing keys fall back to
 *   `/<key>`.
 * home: where the Datify name links (default "/").
 * command: { action, placeholder } — a GET form; omit for no command bar.
 * vega: href for Ask Vega; omit to hide it.
 * hidden: section keys to leave out of the side menu (no real screen yet);
 *   the active section always shows.
 * user: { name, menu: [{ label, href }], signOutAction } — the account menu.
 *   signOutAction is a POST form action. Omit user for a signed-out page.
 * toolbar: html from toolbar(), placed at the top of the main column.
 */
export function frame({
  active,
  kind,
  hrefs = {},
  home = '/',
  command = { action: '/search', placeholder: 'Jump to…' },
  vega = '/vega',
  user = null,
  toolbar = '',
  body = '',
  hidden = [],
}) {
  if (!SECTIONS.some((s) => s.key === active)) throw new Error(`Unknown section: ${active}`);
  // hidden: section keys a product leaves out of the side menu because they
  // have no real screen yet. The active section is never hidden. The order
  // and the nine keys stay fixed; hiding only skips entries.
  const hiddenKeys = new Set(hidden);
  for (const key of hiddenKeys) if (!SECTIONS.some((s) => s.key === key)) throw new Error(`Unknown section to hide: ${key}`);
  if (!KINDS.has(kind)) throw new Error(`Unknown screen kind: ${kind}`);

  const commandHtml = command
    ? `<form class="frame-command" method="get" action="${escapeHtml(command.action)}" role="search">
      <input class="frame-command-input" type="search" name="q" placeholder="${escapeHtml(command.placeholder || 'Jump to…')}" aria-label="Command bar" autocomplete="off">
      <kbd class="frame-kbd" aria-hidden="true">⌘K</kbd>
    </form>`
    : '';
  const vegaHtml = vega ? `<a class="frame-vega" href="${escapeHtml(vega)}">Ask Vega</a>` : '';
  const userHtml = user
    ? `<details class="frame-account">
      <summary class="frame-account-name" aria-label="Account menu">${escapeHtml(user.name)}</summary>
      <div class="frame-menu" role="menu">
        ${(user.menu || []).map((item) => `<a role="menuitem" href="${escapeHtml(item.href)}">${escapeHtml(item.label)}</a>`).join('')}
        ${user.signOutAction ? `<form method="post" action="${escapeHtml(user.signOutAction)}"><button type="submit" role="menuitem">Sign out</button></form>` : ''}
      </div>
    </details>`
    : '';

  return `<div class="frame" data-kind="${kind}" data-section="${active}">
  <header class="frame-bar">
    <a class="frame-brand" href="${escapeHtml(home)}">Datify</a>
    ${commandHtml}
    <div class="frame-bar-right">${vegaHtml}${userHtml}</div>
  </header>
  <nav class="frame-side" aria-label="Sections"><ul>${sectionList(hrefs, active, hiddenKeys)}</ul></nav>
  <main class="frame-main">${toolbar}${body}</main>
</div>`;
}

/**
 * The one shared toolbar. Every block is optional; pass nothing to get an
 * empty string.
 *
 * freshness: { word, status } — "Updated 2:45 PM ET" with a good/watch/broken
 *   dot; `sources` ([{ name, at }]) becomes the hover title naming each feed.
 * range: { current, options: [{ key, label, href }], custom: { action, from, to } }
 *   — view tabs (7d · 30d), then an optional Custom form (GET, from/to dates).
 * bots: { excluded, href } — a link that flips the bot filter, worded as the
 *   state it is in. Never color alone: the word carries it.
 */
export function toolbar({ freshness = null, range = null, bots = null } = {}) {
  if (!freshness && !range && !bots) return '';
  const fresh = freshness
    ? `<span class="frame-fresh" title="${escapeHtml((freshness.sources || []).map((s) => `${s.name}: ${s.at}`).join(' · '))}">
      <span class="dot is-${escapeHtml(freshness.status || 'good')}" aria-hidden="true"></span>${escapeHtml(freshness.word)}</span>`
    : '';
  const tabs = range
    ? `<div class="frame-range" role="group" aria-label="Date range">
      ${(range.options || []).map((o) => `<a class="frame-tab" href="${escapeHtml(o.href)}"${o.key === range.current ? ' aria-current="true"' : ''}>${escapeHtml(o.label)}</a>`).join('')}
      ${range.custom ? `<details class="frame-custom"${range.current === 'custom' ? ' open' : ''}><summary class="frame-tab"${range.current === 'custom' ? ' aria-current="true"' : ''}>Custom</summary>
        <form class="frame-custom-form" method="get" action="${escapeHtml(range.custom.action)}">
          <input type="hidden" name="range" value="custom">
          <label>From <input type="date" name="from" value="${escapeHtml(range.custom.from || '')}"></label>
          <label>To <input type="date" name="to" value="${escapeHtml(range.custom.to || '')}"></label>
          <button type="submit">Apply</button>
        </form></details>` : ''}
    </div>`
    : '';
  const botHtml = bots
    ? `<a class="frame-bots" href="${escapeHtml(bots.href)}" aria-pressed="${bots.excluded ? 'true' : 'false'}">${bots.excluded ? 'Bots excluded' : 'Bots included'}</a>`
    : '';
  return `<div class="frame-toolbar">${fresh}${tabs}${botHtml}</div>`;
}
