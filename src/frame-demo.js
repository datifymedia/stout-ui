// demo/frame.html: the frame around a sample Stats screen. Built by
// scripts/build-tokens.js; the PR screenshots come from this page.
import { card, metricCard, dataTable } from './html.js';
import { frame, toolbar } from './frame.js';

export function renderFrameDemo() {
  const body = `
    <div class="stack">
      <h1 class="section-title">Landers</h1>
      ${card(metricCard({ label: 'Tracked revenue · last 7 days', value: '$12,400', detail: 'Confirmed by advertiser postbacks, reversals out.' }))}
      ${card(dataTable({
        columns: [{ key: 'lander', label: 'Lander' }, { key: 'epc', label: 'EPC' }, { key: 'revenue', label: 'Tracked revenue' }],
        rows: [
          { cells: { lander: 'find-my-program.com/lp1', epc: '<span class="num">$0.42</span>', revenue: '<span class="num">$9,100</span>' } },
          { cells: { lander: 'find-my-program.com/lp2', epc: '<span class="num">$0.31</span>', revenue: '<span class="num">$3,300</span>' } },
        ],
      }))}
    </div>`;
  const shell = frame({
    active: 'reports',
    kind: 'stats',
    hrefs: { dashboard: '/dashboard' },
    command: { action: '/search', placeholder: 'Jump to…' },
    vega: '/vega',
    user: { name: 'Dylan', menu: [{ label: 'Settings', href: '/settings' }], signOutAction: '/logout' },
    toolbar: toolbar({
      freshness: { word: 'Updated 2:45 PM ET', status: 'good', sources: [{ name: 'Postbacks', at: '2:45 PM' }] },
      range: {
        current: '7d',
        options: [{ key: '7d', label: '7d', href: '?range=7d' }, { key: '30d', label: '30d', href: '?range=30d' }],
        custom: { action: '/stats' },
      },
      bots: { excluded: true, href: '?bots=raw' },
    }),
    body,
  });
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Datify frame</title>
  <link rel="stylesheet" href="../dist/tokens.css">
  <link rel="stylesheet" href="../src/components.css">
  <link rel="stylesheet" href="../src/frame.css">
</head>
<body class="stout">
${shell}
<script src="../src/frame-behavior.js"></script>
</body>
</html>
`;
}
