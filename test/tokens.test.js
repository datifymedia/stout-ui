// tokens.js must match DATIFY-STANDARDS.md §9 ("Visual design — light theme").
// The rulebook ships in this repo; these are its numbers, so the two cannot drift.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { tokens, buildCss } from '../tokens.js';

const ALLOWED_SIZES = [52, 40, 32, 22, 14, 13];
const ALLOWED_SPACE = [4, 8, 16, 24, 32, 48, 64];

test('§9 colors', () => {
  assert.equal(tokens.color.page, '#E7EBF0');
  assert.equal(tokens.color.card, '#FFFFFF');
  assert.equal(tokens.color.hover, '#F2F3F5');
  assert.equal(tokens.color.text, '#14171F');
  assert.equal(tokens.color.secondary, '#4A5263');
  assert.equal(tokens.color.label, '#6B7280');
  assert.equal(tokens.color.accent, '#2F5DE0');
  assert.equal(tokens.color.good, '#1E8A5A');
  assert.equal(tokens.color.watch, '#B7791F');
  assert.equal(tokens.color.broken, '#C53D3D');
  assert.equal(tokens.color.highlight, '#FFE14A');
});

test('aliases kept for the Hub resolve to rulebook colors', () => {
  assert.equal(tokens.color.canvas, tokens.color.page);
  assert.equal(tokens.color.nested, tokens.color.hover);
  assert.equal(tokens.color.quiet, tokens.color.label);
  assert.equal(tokens.color.warnStrong, tokens.color.watch);
});

test('§9 type: Inter for prose, IBM Plex Mono for labels and numbers, sizes from the six-step scale only', () => {
  assert.match(tokens.fontFamily, /^Inter/);
  assert.match(tokens.fontFamilyMono, /^"IBM Plex Mono"/);
  for (const [name, px] of Object.entries(tokens.fontSize)) {
    assert.ok(ALLOWED_SIZES.includes(px), `${name}: ${px}px is not one of ${ALLOWED_SIZES.join('/')}`);
  }
  assert.equal(tokens.fontSize.label, 13);
  assert.equal(tokens.fontSize.body, 14);
});

test('§9 spacing scale, radius, motion', () => {
  assert.deepEqual(tokens.space, ALLOWED_SPACE);
  assert.equal(tokens.radius.card, 2);
  assert.equal(tokens.radius.sheet, 2);
  assert.equal(tokens.radius.control, 4);
  assert.deepEqual(tokens.motion, { hover: 75, state: 150, max: 250 });
});

test('dist/tokens.css is the build of tokens.js, and loads IBM Plex Mono, not JetBrains Mono', () => {
  const dist = readFileSync(new URL('../dist/tokens.css', import.meta.url), 'utf8');
  assert.equal(dist, buildCss(), 'run node scripts/build-tokens.js');
  assert.match(dist, /IBM\+Plex\+Mono/);
  assert.doesNotMatch(dist, /JetBrains/);
});

test('components.css: labels are sentence case, never uppercase or letter-spaced', () => {
  const css = readFileSync(new URL('../src/components.css', import.meta.url), 'utf8');
  assert.doesNotMatch(css, /text-transform:\s*uppercase/);
  assert.doesNotMatch(css, /letter-spacing:\s*0\.0\d+em/);
});
