# DATIFY-STANDARDS.md

The shared rulebook every Datify build follows. When a prompt says "Per
DATIFY-STANDARDS.md," it means this file.

**This is the only copy.** It lives in `datifymedia/stout-ui` and ships inside
the `@stout/ui` package (`node_modules/@stout/ui/DATIFY-STANDARDS.md`). Other
repos point here from their `CLAUDE.md`; they do not keep a copy. A change to
the rules is a pull request on this repo, and each repo picks it up by bumping
its `@stout/ui` pin. Dylan + Matt own changes to this file.

---

## 1. Git and PRs

- Never push to `main`. Every change is a branch and a pull request.
- Branch names: `<owner>/<feature>` (e.g. `dylan/orbit-v2-foundation`).
- One PR at a time. Review and merge before starting the next.
- A human merges to `main`. No agent or job merges on its own.
- Each PR ends with a "DONE WHEN" checklist that actually passes.

## 2. Money

- Money is stored as **BIGINT integer cents**. Column names end in `_cents`.
- Never accumulate or round floating-point dollars anywhere in the pipeline.
- Convert cents to dollars **only at display time**. APIs return cents.
- On screen: whole dollars. Percentages: one decimal place.

## 3. Time

- Store timestamps as **UTC DATETIME**. Column names end in `_at`.
- The **business day is America/Chicago (Central)**. Convert UTC to Central
  before grouping anything by day.
- On screen, show times in Central with the label, e.g. "2:45 PM CT".

## 4. Multi-advertiser

- Every table has a `partner_id`. Ventrix = 1. Deltos = 2.
- A second advertiser (Deltos, next) is **config, not a rebuild**: new rows
  in `partners` plus a per-advertiser parser, never a schema fork.
- Per-advertiser rates, ids, and measured history stay separate — a new
  advertiser starts with no history and its own `expected_return_rate_bps`.

## 5. Data integrity

- Raw ingested rows are **insert-only**. Never update or delete a row that
  came from an advertiser pull; every committed pull is retained.
- Derived/canonical tables (leads, months, daily totals) may be recomputed,
  and every recompute is **idempotent** — replaying the same pulls twice
  produces identical tables.
- Migrations are idempotent.
- **No derived system validates itself from derived data.** Control totals
  compare raw source to what was ingested, hitting the raw source directly —
  never the derived tables or the API.

## 6. Pulls and the bad-pull gate

- Every pull attempt is logged (ok | rejected | failed) with a reason.
- A pull is **rejected and never used downstream** if login/HTTP fails, the
  payload is truncated or missing expected columns, or it fails the
  row-count / control-total check for that advertiser and period.
- Rejected pulls are stored, not discarded. Retry on the normal schedule.

## 7. Read boundary and API shape

- **Only the owning service writes to its database.** `orbit_db` is written
  by Orbit alone.
- Nothing outside Orbit reads `orbit_db` directly. Consumers (the screen,
  Vega, Ledger) read through the **read-only API**.
- Every API response is `{data, error, meta}`. `meta` includes `as_of`
  (UTC, the last ok pull used) and `source_system`.
- A published metric uses the shape
  `{metric, value, unit, as_of, status, source_system}`.
  `status` is `"estimated"` until the period is final, then `"final"`.
- Read endpoints sit behind Hub login (`requireSession`), except `/health`.
- The Hub service may also call `GET /api/v1` with `Authorization: Bearer`
  and `HUB_API_TOKEN`. That token cannot call other paths or write.

## 8. Secrets

- Credentials come from env vars. **Never log a secret.**
- Rotate any credential that has been exposed (e.g. appeared in a screenshot).
- Each tool gets its own API keys; don't share one key across services.

## 9. Visual design — light theme (the look rulebook)

Light theme only. These are the only values allowed; no one-off hexes,
sizes, or spacing.

**Color**
- Backgrounds: page `#E7EBF0`, card `#FFFFFF`, hover/nested `#F2F3F5`.
- Border: 1px at 10% black.
- Text: primary `#14171F`, secondary `#4A5263`, labels `#6B7280`.
- **Accent / system `#2F5DE0` — interactive and system only:** selected
  state, links, buttons, focus ring, sync, provenance. Blue never carries
  health meaning.
- Status, used **only** when it means that, and **always with a word** (never
  color alone): good `#1E8A5A`, watch `#B7791F`, broken `#C53D3D`.

**Type**
- Inter for prose. Tabular numerals on every number.
- Labels are IBM Plex Mono, 13px, secondary `#4A5263`.
- Sizes: 52 / 40 / 32 / 22 / 14 / 13.

**Estimated money**
- An estimated dollar figure sits on a yellow highlight `#FFE14A`.
- The dollars stay dark `#14171F`. Yellow is the highlight, not the number.

**Suite**
- One header bar: 56px tall, white, with a 2px `#14171F` rule along the bottom. No slash separators. The same bar is on Today and on Returns.
- Left: “← Hub” in secondary gray, darker on hover. It links to `https://dash.datify.ai/dashboard` in the same tab. A thin divider, then the Orbit mark and the word Orbit in ink — the strongest item. Orbit links to `/`. On a phone, Hub is the arrow only.
- `/` is the Orbit home: today’s EDU revenue and estimated profit, then the month, then one stacked card per advertiser. The right side of that bar is Refresh and the status dot.
- Advertiser pages keep the switcher on the right: a small gray “Advertiser” label, then Ventrix and Deltos. Each logo opens that advertiser’s portal in a new tab, and a ↗ shows on hover. The name switches the Orbit page. Ventrix is `/ventrix`. No caret. Then a refresh button (a circular arrow, labeled Refresh on hover). Then a dot and “Updated” plus the time. The dot is green only when both Ventrix and CAKE pulls are under 35 minutes old. Otherwise it is amber, including when a pull is failing. Hover names each source and the date. On a phone: the logos and names, no Advertiser label, the refresh icon, and the status dot.
- Each home card links to that advertiser. It shows its own “Updated” time and turns amber when that advertiser’s pull is stale or failing. A new advertiser is another entry in the advertiser list.
- Active warnings sit at the top of the Orbit home and the matching advertiser page, one line each. Amber is a watch. Red is only a broken data pull. The line leaves when the issue clears. They stay off until `enabled` is true in the warning thresholds, except a Ventrix current-month pull rejected twice in a row: that amber line and its Telegram message are sent while the others stay off.
- Refresh runs Ventrix cycle 0 and the CAKE pull through the same gate as the live schedule. Last month and finals run on a separate :52 books gate so they cannot hold today’s file. While it runs, the icon spins and the status reads “Refreshing…”. When it finishes, the numbers reload. If it fails, the status is amber with a plain reason. At most one refresh every 2 minutes, and a click during a running pull waits for that pull instead of starting another.
- The month switcher is text on a hairline. The open month is ink, with a 2px rule that sits on that line. The others are secondary gray and turn darker on hover. Each target is 44px tall. No tray.
- On the Ventrix desk, below the five cards, a white Deltos Partners strip shows Revenue today and MTD revenue in cents. The whole strip opens the Deltos page. Month math lists Ventrix gross, then Returns so far as a negative (returns already recorded against that month’s sold leads), then More returns expected. Expected shrink for a sold day is the higher of scrub_rate_bps times that day’s sold and the returns already recorded against that day. The rate defaults to 10% and applies to Ventrix sold after real-time rejections, so it covers in-month and post-close returns only. Rejections are a count with their reasons and $0, because Ventrix wipes CPL on those rows. “+ Leave-behind (Deltos)” stays before traffic cost. Estimated profit subtracts the expected shrink. A month Orbit marks final uses final cents minus traffic cost plus leave-behind. scrub_rate_bps is `post_close_rate_floor_bps`, which defaults to 1000 (10%) and is editable in admin settings. The desk says more returns expected are that rate of each sold day, unless returns already recorded are higher.
- The Deltos page puts EPC beside today’s revenue. Month math, each day, and the sub-id table show earnings per click. EPC is earned cents divided by clicks. In the by-day table, the month’s highest EPC day is marked High in green and the lowest is marked Low in amber. Red stays for something broken. A month with one rate has neither mark.

**Terminal desk**
- Ground is cool gray `#E7EBF0`. Cards stay white.
- Panels are square: 2px radius.
- The header rule is 2px solid `#14171F`.
- Cards stay only as tall as their content.

**Space and shape**
- Spacing scale: 4, 8, 16, 24, 32, 48, 64 only.
- Radius: 2px panels, 4px chips and buttons. Flat — one shadow, reserved for
  menus and dialogs.

**Motion**
- 75ms hover, 150ms state change, 250ms max. Respect `prefers-reduced-motion`.

## 10. Wording on screen

- Leads are **"returned"** — never "clawed back".
- Never use "billable", "true-up", "accrued", or "reserve" on screen.
- The expected return rate is **"what we budget"**, shown as a percentage.

---

### Open decision affecting this file

The Cycle View accent is unchosen: **A** Health color · **B** Signal blue ·
**C** Highlighter. This file currently reflects the rulebook as written —
**blue `#2F5DE0` = system/interactive/links/sync/provenance**. Choosing **B**
(blue as the cycle-view signal color) would change §9 and needs a deliberate
edit here first, so health and system don't both read as blue.
