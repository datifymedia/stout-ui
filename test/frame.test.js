// The Datify frame (src/frame.js, src/frame.css).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { frame, toolbar, initials, SECTIONS } from '../src/frame.js';

const user = { name: 'Dylan', menu: [{ label: 'Settings', href: '/settings' }], signOutAction: '/logout' };

test('the side menu holds the nine sections in order, the active one marked', () => {
  const html = frame({ active: 'offers', kind: 'management', user, body: '<p>hi</p>' });
  assert.deepEqual(SECTIONS.map((s) => s.label), ['Dashboard', 'Publishers', 'Offers', 'Leads', 'Advertisers', 'Reports', 'Money', 'Orchestrator', 'Team']);
  const links = [...html.matchAll(/<a class="frame-section" href="([^"]+)"( aria-current="page")?>(<svg[^>]*>.*?<\/svg>)<span class="frame-section-label">([^<]+)<\/span><\/a>/g)]
    .map(([, href, current, svg, label]) => [null, href, current, label, svg]);
  assert.equal(links.length, 9);
  assert.deepEqual(links.map((m) => m[3]), SECTIONS.map((s) => s.label));
  assert.equal(links.filter((m) => m[2]).length, 1);
  assert.equal(links.find((m) => m[2])[3], 'Offers');
  assert.equal(links[0][1], '/dashboard');
  // Each section has its own outline icon before the label, hidden from screen readers.
  for (const [, , , , svg] of links) {
    assert.match(svg, /^<svg class="frame-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1\.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"/);
  }
  assert.equal(new Set(links.map((m) => m[4])).size, 9, 'one distinct icon per section');
});

test('products place sections where they live; the bar has brand, command bar, Ask Vega, account menu', () => {
  const html = frame({
    active: 'team', kind: 'tools', user,
    hrefs: { dashboard: 'https://dash.datify.ai/dashboard', team: '/dashboard/team' },
    home: 'https://dash.datify.ai/',
    command: { action: '/dashboard/search', placeholder: 'Jump to…' },
    vega: '/dashboard/team?worker=vega',
    body: '',
  });
  assert.match(html, /href="https:\/\/dash\.datify\.ai\/dashboard"( aria-current="page")?><svg[^>]*>.*?<\/svg><span class="frame-section-label">Dashboard</);
  assert.match(html, /href="\/dashboard\/team" aria-current="page"><svg[^>]*>.*?<\/svg><span class="frame-section-label">Team</);
  assert.match(html, /<a class="frame-brand" href="https:\/\/dash\.datify\.ai\/" aria-label="Datify — Go to dashboard" title="Go to dashboard">Datify<\/a>/, 'no logo URL: the word, still a labelled dashboard link');
  assert.match(html, /<form class="frame-command" id="frame-command" method="get" action="\/dashboard\/search" role="search">/);
  assert.match(html, /<a class="frame-vega" href="\/dashboard\/team\?worker=vega">Ask Vega<\/a>/);
  assert.match(html, /<summary class="frame-account-name" aria-label="Dylan" title="Dylan"><span class="frame-avatar" aria-hidden="true">DY<\/span><svg class="frame-chevron" width="16"/);
  assert.match(html, /<div class="frame-menu-name">Dylan<\/div>/);
  assert.match(html, /<a role="menuitem" href="\/settings">Settings<\/a>/);
  assert.match(html, /<form method="post" action="\/logout"><button type="submit" role="menuitem">Sign out<\/button><\/form>/);
  assert.match(html, /data-kind="tools" data-section="team"/);
});

test('signed-out page: no account menu; command bar and Vega can be switched off', () => {
  const html = frame({ active: 'dashboard', kind: 'stats', command: null, vega: null, body: '' });
  assert.doesNotMatch(html, /frame-account/);
  assert.doesNotMatch(html, /frame-command/);
  assert.doesNotMatch(html, /Ask Vega/);
});

test('unknown section or kind is refused; user text is escaped', () => {
  assert.throws(() => frame({ active: 'settings', kind: 'tools' }), /Unknown section/);
  assert.throws(() => frame({ active: 'team', kind: 'admin' }), /Unknown screen kind/);
  const html = frame({ active: 'team', kind: 'tools', user: { name: '<b>x</b>' } });
  assert.match(html, /&lt;b&gt;x&lt;\/b&gt;/);
});

test('toolbar: freshness with sources, range tabs with the current one marked, custom form, bot toggle', () => {
  const html = toolbar({
    freshness: { word: 'Updated 2:45 PM ET', status: 'watch', sources: [{ name: 'Ventrix', at: '2:45 PM' }, { name: 'CAKE', at: '1:10 PM' }] },
    range: {
      current: '30d',
      options: [{ key: '7d', label: '7d', href: '?range=7d' }, { key: '30d', label: '30d', href: '?range=30d' }],
      custom: { action: '/dashboard/stats', from: '2026-11-01', to: '2026-11-13' },
    },
    bots: { excluded: true, href: '?bots=raw' },
  });
  assert.match(html, /title="Ventrix: 2:45 PM · CAKE: 1:10 PM"/);
  assert.match(html, /is-watch/);
  assert.match(html, /Updated 2:45 PM ET/);
  assert.match(html, /href="\?range=30d" aria-current="true">30d</);
  assert.doesNotMatch(html, /href="\?range=7d" aria-current/);
  assert.match(html, /name="from" value="2026-11-01"/);
  assert.match(html, /aria-pressed="true">Bots excluded</);
  assert.equal(toolbar(), '');
  assert.match(toolbar({ bots: { excluded: false, href: '?bots=off' } }), /aria-pressed="false">Bots included</);
});

test('frame.css uses tokens only: no hex colors, no raw px sizes, no uppercase', () => {
  // Comments are stripped; the one raw pixel value allowed is the phone
  // breakpoint, because a media query cannot read a custom property.
  const css = readFileSync(new URL('../src/frame.css', import.meta.url), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/@media \(max-width: 800px\)/g, '@media (phone)');
  assert.doesNotMatch(css, /#[0-9a-fA-F]{3,6}\b/);
  assert.doesNotMatch(css, /\b\d+px\b/);
  assert.doesNotMatch(css, /uppercase/);
  assert.match(css, /--layout-bar/);
  assert.match(css, /--rule-strong/);
});

test('tokens.css defines what frame.css needs', () => {
  const tokens = readFileSync(new URL('../dist/tokens.css', import.meta.url), 'utf8');
  for (const name of ['--layout-bar', '--layout-side', '--layout-command', '--layout-menu', '--rule-strong']) {
    assert.match(tokens, new RegExp(`${name}:`), name);
  }
  assert.match(tokens, /--layout-bar: 56px/);
});

test('hidden: a product can leave sections without a screen out of the menu; the active one always shows', () => {
  const html = frame({ active: 'advertisers', kind: 'stats', hidden: ['leads', 'money', 'outreach'] });
  const labels = [...html.matchAll(/<span class="frame-section-label">([^<]+)<\/span>/g)].map((m) => m[1]);
  assert.deepEqual(labels, ['Dashboard', 'Publishers', 'Offers', 'Advertisers', 'Reports', 'Team']);
  const stillActive = frame({ active: 'money', kind: 'stats', hidden: ['money'] });
  assert.match(stillActive, /aria-current="page"><svg[^>]*>.*?<\/svg><span class="frame-section-label">Money</);
  assert.throws(() => frame({ active: 'team', kind: 'tools', hidden: ['nope'] }), /Unknown section to hide/);
});

test('account trigger: initials in a circle, the full name as label, title and first menu line', () => {
  assert.equal(initials('Dylan Young'), 'DY');
  assert.equal(initials('dylan@datify.ai'), 'DY');
  assert.equal(initials('Account'), '');
  assert.equal(initials(''), '');
  const named = frame({ active: 'team', kind: 'tools', user: { ...user, name: 'Dylan Young' } });
  assert.match(named, /aria-label="Dylan Young" title="Dylan Young"><span class="frame-avatar" aria-hidden="true">DY<\/span>/);
  assert.match(named, /<div class="frame-menu-name">Dylan Young<\/div>/);
  const email = frame({ active: 'team', kind: 'tools', user: { ...user, name: 'dylan@datify.ai' } });
  assert.match(email, /<span class="frame-avatar" aria-hidden="true">DY<\/span>/);
  const generic = frame({ active: 'team', kind: 'tools', user: { ...user, name: 'Account' } });
  assert.match(generic, /<span class="frame-avatar" aria-hidden="true"><svg class="frame-avatar-icon" width="16" height="16"[^>]*aria-hidden="true"/);
  assert.doesNotMatch(generic, /class="frame-avatar" aria-hidden="true">[A-Z]/);
  assert.match(generic, /aria-label="Account"/);
});

test('frame.css: selected section is the accent on its tint; the phone strip hides icons and keeps the underline', () => {
  const css = readFileSync(new URL('../src/frame.css', import.meta.url), 'utf8');
  assert.match(css, /\.frame-section\[aria-current="page"\][^{]*\{[^}]*color: var\(--color-accent\);[^}]*background: var\(--color-accent-tint\);/);
  assert.doesNotMatch(css, /border-left/);
  const phone = css.slice(css.indexOf('@media (max-width: 800px)'));
  assert.match(phone, /\.frame-icon \{\s*display: none;/);
  assert.match(phone, /border-bottom-color: var\(--color-text\)/);
  const tokens = readFileSync(new URL('../dist/tokens.css', import.meta.url), 'utf8');
  assert.match(tokens, /--color-accent-tint:/);
});

test('the logo: one labelled dashboard link in the bar, the supplied image at its own aspect ratio', async () => {
  const { brand, LOGO } = await import('../src/frame.js');
  const { readFileSync } = await import('node:fs');
  const html = frame({ active: 'offers', kind: 'management', user, home: 'https://dash.datify.ai/dashboard', logo: '/assets/stout/datify-logo.png', body: '' });
  assert.equal((html.match(/class="frame-brand"/g) || []).length, 1, 'one brand mark per screen');
  assert.equal((html.match(/datify-logo\.png/g) || []).length, 1);
  assert.match(html, /<header class="frame-bar">\s*<a class="frame-brand" href="https:\/\/dash\.datify\.ai\/dashboard" aria-label="Datify — Go to dashboard" title="Go to dashboard"><img class="frame-logo" src="\/assets\/stout\/datify-logo\.png" alt="" width="521" height="128" decoding="async"><\/a>/);
  assert.doesNotMatch(html.slice(html.indexOf('frame-side')), /datify-logo/, 'not repeated in the side menu');
  assert.equal(brand({ home: '/x"y', logo: '/l.png' }).includes('href="/x&quot;y"'), true, 'escaped');
  // The PNG's own size matches what the page reserves (no stretching).
  const png = readFileSync(new URL('../assets/datify-logo.png', import.meta.url));
  assert.equal(png.readUInt32BE(16), LOGO.width);
  assert.equal(png.readUInt32BE(20), LOGO.height);
  const css = readFileSync(new URL('../src/frame.css', import.meta.url), 'utf8');
  assert.match(css, /\.frame-logo \{[^}]*height: var\(--space-32\);[^}]*width: auto;/);
  assert.match(css, /\.frame-brand:focus-visible \{/);
  assert.match(css, /\.frame-brand:hover \{/);
});

test('the phone search button: before Ask Vega, labelled, controls the command form; none without a command bar', async () => {
  const { readFileSync } = await import('node:fs');
  const html = frame({ active: 'team', kind: 'tools', user, body: '' });
  assert.match(html, /<div class="frame-bar-right"><button type="button" class="frame-search" aria-label="Search" aria-expanded="false" aria-controls="frame-command"><svg[^>]*class="frame-search-icon"[\s\S]*?<\/svg><\/button><a class="frame-vega"/);
  assert.match(html, /<form class="frame-command" id="frame-command"/);
  assert.doesNotMatch(frame({ active: 'team', kind: 'tools', user, command: null, body: '' }), /frame-search|frame-command/);
  const css = readFileSync(new URL('../src/frame.css', import.meta.url), 'utf8');
  assert.match(css, /\.frame-search \{\s*display: none;/, 'hidden on wide screens');
  assert.match(css, /\.frame-bar\.has-search-toggle\.is-search-open \.frame-command \{\s*display: block;/);
  const js = readFileSync(new URL('../src/frame-behavior.js', import.meta.url), 'utf8');
  assert.match(js, /is-search-open/);
});
