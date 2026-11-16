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

// Outline icons, drawn on a 24-unit grid and shown at 20px. Stroke only,
// in the text color, so the selected and hover colors carry to the icon.
const PERSON = '<circle cx="12" cy="8" r="4"/><path d="M4.5 21a7.5 7.5 0 0 1 15 0"/>';
const ICON_PATHS = {
  dashboard: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9v12h14V9"/><path d="M10 21v-6h4v6"/>',
  publishers: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8"/><path d="M18 14.2a6.5 6.5 0 0 1 3.5 5.8"/>',
  offers: '<path d="M3 3h8l10 10-8 8L3 11z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
  leads: PERSON,
  advertisers: '<rect x="4" y="3" width="16" height="18" rx="1"/><path d="M9 7h1M14 7h1M9 11h1M14 11h1M9 15h1M14 15h1"/><path d="M10 21v-3h4v3"/>',
  reports: '<path d="M3 3v18h18"/><path d="M8 17v-5M13 17V7M18 17v-8"/>',
  money: '<rect x="2.5" y="5" width="19" height="14" rx="2"/><path d="M2.5 10h19M6 15h4"/>',
  outreach: '<path d="M21.5 2.5 2.5 10l7.5 3.5 3.5 7.5z"/><path d="M21.5 2.5 10 13.5"/>',
  team: '<circle cx="12" cy="7.5" r="3"/><path d="M6.5 20a5.5 5.5 0 0 1 11 0"/><circle cx="5" cy="9.5" r="2"/><path d="M1.5 18A3.5 3.5 0 0 1 5 14.5"/><circle cx="19" cy="9.5" r="2"/><path d="M22.5 18a3.5 3.5 0 0 0-3.5-3.5"/>',
  person: PERSON,
  chevron: '<path d="m6 9 6 6 6-6"/>',
};

function icon(name, size = 20, cls = 'frame-icon') {
  return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICON_PATHS[name]}</svg>`;
}

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
].map((s) => ({ ...s, icon: icon(s.key) }));

/**
 * Initials for the account trigger: the first letters of the first two words
 * of a name, or the first two letters of an email's local part (or of a
 * one-word name). Empty when there is no real name ("Account" or blank), so
 * the trigger shows a person icon instead.
 */
export function initials(name) {
  const text = String(name || '').trim();
  if (!text || text.toLowerCase() === 'account') return '';
  const letters = (s) => Array.from(s.replace(/[^\p{L}\p{N}]/gu, ''));
  if (text.includes('@')) return letters(text.split('@')[0]).slice(0, 2).join('').toUpperCase();
  const words = text.split(/\s+/).map(letters).filter((w) => w.length);
  if (!words.length) return '';
  if (words.length === 1) return words[0].slice(0, 2).join('').toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export const KINDS = new Set(['stats', 'tools', 'management']);

function sectionList(hrefs, active, hidden) {
  return SECTIONS.filter(({ key }) => key === active || !hidden.has(key)).map(({ key, label, icon: svg }) => {
    const href = hrefs[key] || `/${key}`;
    const current = key === active ? ' aria-current="page"' : '';
    return `<li><a class="frame-section" href="${escapeHtml(href)}"${current}>${svg}<span class="frame-section-label">${escapeHtml(label)}</span></a></li>`;
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
 *   The trigger is the person's initials in a circle and a chevron; the full
 *   name is its label and title and the first line of the open menu.
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
  const userName = user ? String(user.name || '').trim() || 'Account' : '';
  const userInitials = initials(userName);
  const userHtml = user
    ? `<details class="frame-account">
      <summary class="frame-account-name" aria-label="${escapeHtml(userName)}" title="${escapeHtml(userName)}"><span class="frame-avatar" aria-hidden="true">${userInitials ? escapeHtml(userInitials) : icon('person', 16, 'frame-avatar-icon')}</span>${icon('chevron', 16, 'frame-chevron')}</summary>
      <div class="frame-menu" role="menu">
        <div class="frame-menu-name">${escapeHtml(userName)}</div>
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
