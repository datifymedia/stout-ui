// Single source for the light theme. Components use the generated CSS variables.
// Hex, type size, spacing, radius, and motion live only in this file.

const tokens = {
  color: {
    page: '#F7F7F5',
    card: '#FFFFFF',
    hover: '#F2F3F5',
    text: '#14171F',
    secondary: '#4A5263',
    label: '#6B7280',
    accent: '#2F5DE0',
    good: '#1E8A5A',
    watch: '#B7791F',
    broken: '#C53D3D',
    highlight: '#FFE24D',
    canvas: '#E7EAED',
    nested: '#F3F5F7',
    quiet: '#8A92A0',
    warnStrong: '#B45309',
  },
  fontFamily: 'Inter, sans-serif',
  fontFamilyMono: '"JetBrains Mono", ui-monospace, Menlo, monospace',
  fontSize: {
    display: 52,
    hero: 72,
    heroMin: 46,
    title: 32,
    section: 22,
    metric: 20,
    word: 15,
    body: 14,
    fine: 12,
    label: 11,
  },
  space: [4, 8, 16, 24, 32, 48, 64],
  radius: {
    card: 8,
    sheet: 10,
    control: 4,
  },
  motion: {
    hover: 75,
    state: 150,
    max: 250,
  },
};

function buildCss() {
  const size = tokens.fontSize;
  const space = tokens.space.map((n) => `  --space-${n}: ${n}px;`).join('\n');
  const stack = tokens.space[tokens.space.length - 1] * 12;
  return `/* Generated from packages/stout-ui/tokens.js. Do not edit by hand. */
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap");

:root {
  --color-page: ${tokens.color.page};
  --color-card: ${tokens.color.card};
  --color-hover: ${tokens.color.hover};
  --color-text: ${tokens.color.text};
  --color-secondary: ${tokens.color.secondary};
  --color-label: ${tokens.color.label};
  --color-accent: ${tokens.color.accent};
  --color-good: ${tokens.color.good};
  --color-watch: ${tokens.color.watch};
  --color-broken: ${tokens.color.broken};
  --color-highlight: ${tokens.color.highlight};
  --color-canvas: ${tokens.color.canvas};
  --color-nested: ${tokens.color.nested};
  --color-quiet: ${tokens.color.quiet};
  --color-warn-strong: ${tokens.color.warnStrong};
  --font-family: ${tokens.fontFamily};
  --font-family-mono: ${tokens.fontFamilyMono};
  --font-size-display: ${size.display}px;
  --font-size-hero: ${size.hero}px;
  --font-size-hero-min: ${size.heroMin}px;
  --font-size-title: ${size.title}px;
  --font-size-section: ${size.section}px;
  --font-size-metric: ${size.metric}px;
  --font-size-word: ${size.word}px;
  --font-size-body: ${size.body}px;
  --font-size-fine: ${size.fine}px;
  --font-size-label: ${size.label}px;
${space}
  --radius-card: ${tokens.radius.card}px;
  --radius-sheet: ${tokens.radius.sheet}px;
  --radius-control: ${tokens.radius.control}px;
  --motion-hover: ${tokens.motion.hover}ms;
  --motion-state: ${tokens.motion.state}ms;
  --motion-max: ${tokens.motion.max}ms;
  --line: 1px solid rgb(0 0 0 / 10%);
  --shadow-overlay: 0 var(--space-8) var(--space-24) rgb(20 23 31 / 12%);
  --chart-band: color-mix(in srgb, var(--color-good) 16%, var(--color-card));
  --chart-band-strong: color-mix(in srgb, var(--color-good) 28%, var(--color-card));
  --layout-stack: calc(var(--space-64) * 12);
}

.stout {
  margin: 0;
  background: var(--color-page);
  color: var(--color-text);
  font-family: var(--font-family);
  font-size: var(--font-size-body);
  font-variant-numeric: tabular-nums;
  line-height: 1.4;
}

@media (prefers-reduced-motion: reduce) {
  .stout *,
  .stout *::before,
  .stout *::after {
    animation-duration: 0ms;
    animation-delay: 0ms;
    transition-duration: 0ms;
  }
}

@media (max-width: ${stack}px) {
  .stout .split,
  .stout .split-even,
  .stout .site-header,
  .stout .hero,
  .stout .track {
    flex-direction: column;
  }

  .stout .header-aside {
    align-items: flex-start;
    text-align: left;
  }

  .stout .month-picker {
    grid-template-columns: 1fr 1fr;
  }

  .stout .track-line {
    flex: 0 0 auto;
    width: var(--space-4);
    height: var(--space-16);
    border-top: 0;
    border-left: var(--line);
  }

  .stout .track-line.is-dashed {
    border-left-style: dashed;
  }
}
`;
}

export {
  tokens,
  buildCss,
};
