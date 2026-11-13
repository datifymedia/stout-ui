// The Datify frame (src/frame.js, src/frame.css).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { frame, toolbar, SECTIONS } from '../src/frame.js';

const user = { name: 'Dylan', menu: [{ label: 'Settings', href: '/settings' }], signOutAction: '/logout' };

test('the side menu holds the nine sections in order, the active one marked', () => {
  const html = frame({ active: 'offers', kind: 'management', user, body: '<p>hi</p>' });
  assert.deepEqual(SECTIONS.map((s) => s.label), ['Dashboard', 'Publishers', 'Offers', 'Leads', 'Advertisers', 'Reports', 'Money', 'Outreach', 'Team']);
  const links = [...html.matchAll(/<a class="frame-section" href="([^"]+)"( aria-current="page")?>([^<]+)<\/a>/g)];
  assert.equal(links.length, 9);
  assert.deepEqual(links.map((m) => m[3]), SECTIONS.map((s) => s.label));
  assert.equal(links.filter((m) => m[2]).length, 1);
  assert.equal(links.find((m) => m[2])[3], 'Offers');
  assert.equal(links[0][1], '/dashboard');
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
  assert.match(html, /href="https:\/\/dash\.datify\.ai\/dashboard"( aria-current="page")?>Dashboard</);
  assert.match(html, /href="\/dashboard\/team" aria-current="page">Team</);
  assert.match(html, /<a class="frame-brand" href="https:\/\/dash\.datify\.ai\/">Datify<\/a>/);
  assert.match(html, /<form class="frame-command" method="get" action="\/dashboard\/search" role="search">/);
  assert.match(html, /<a class="frame-vega" href="\/dashboard\/team\?worker=vega">Ask Vega<\/a>/);
  assert.match(html, /<summary class="frame-account-name"[^>]*>Dylan<\/summary>/);
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
