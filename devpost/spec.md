---
doc: spec
status: approved
---

# Decision Journal: Technical Spec

> Technical choices were recommended by the agent and accepted under the learner's delegation ("Create the entire thing end to end"). Earlier choices the learner made: a web app with a live link, data stored locally, sample entries.

## How This Works, In Plain Language
Decision Journal is a website that runs entirely in your browser. There's no server and no database, and nothing you type leaves your device.

- **The screens** (Insights, Journal, New decision, Decision detail) are built with **React**, a library for building interfaces out of reusable pieces called components.
- **The journal itself** is a list of decisions saved in the browser's **localStorage**, a small storage area the browser keeps for one website, like a sticky note that survives page reloads.
- **The stats engine** is one plain TypeScript file of pure functions: give it the list of decisions and it returns hit rates, confidence gaps, blind spots, chart points and the live Reality check. Because it's separate from the screens, it can be tested on its own, and every screen shows the same numbers.
- **The charts** are drawn by hand as SVG (vector graphics the browser draws natively). No chart library, so the visuals match the design exactly.

Why this shape: the core idea is one calculation shown at the right moment. A server or database would add moving parts without proving anything more, and keeping everything local is part of the privacy pitch.

## The Core Journey Through the System
PRD ref: `prd.md > The Core Journey`.

1. **Arrive** → `main.tsx` starts the app → `storage.ts` reads localStorage. Nothing is there on first open, so it saves the **sample journal** from `sampleData.ts`, with dates calculated relative to today → the router shows **Insights**.
2. **See the gap** → `InsightsPage` calls `stats.ts` (`summarize`, `blindSpots`, `calibrationBuckets`, `areaGaps`, `moodPatterns`) → the chart components draw the results as SVG.
3. **Review what's due** → `stats.dueForReview(decisions, now)` lists open decisions past their check-back date → selecting one sets the URL to `#/decision/<id>` → `DecisionPage` shows the read-only prediction.
4. **Record what happened** → the outcome form validates → the journal store's `recordOutcome` updates that decision and saves to localStorage → the page compares `summarize` before and after to show the "45% → 50%" change.
5. **New decision** → `#/new` → `NewDecisionPage` keeps the form in React state → on every change it calls `stats.realityCheck(decisions, {area, mood, confidence})` → `RealityCheck` renders the headline, evidence rows and suggestion → "Use N%" sets the slider.
6. **Save** → `addDecision` adds it with `createdAt = now` and `reviewAt = now + chosen interval` and saves → navigates to `#/decision/<id>`.

## Stack
- **Vite 8** (dev server and build tool), scaffolded with `create-vite` `react-ts`: https://vite.dev/guide/. Fast, zero-config, and outputs plain static files.
- **React 19** + **TypeScript**: https://react.dev, https://www.typescriptlang.org/docs/. Components fit four screens with shared pieces, and types keep the stats engine honest.
- **Vitest**: https://vitest.dev. Unit tests for `stats.ts` only, the one piece where a wrong number would undermine the whole product.
- **Plain CSS with custom properties** (design tokens in `tokens.css`): https://developer.mozilla.org/docs/Web/CSS/Using_CSS_custom_properties. Full design control, light/dark themes from one set of tokens, no framework defaults leaking into the look.
- **Fonts:** Geist via Google Fonts (https://fonts.google.com/specimen/Geist), with system-font fallback.
- **Routing:** a ~30-line hash router (`#/insights`, `#/journal`, `#/new`, `#/decision/:id`). The back button works and links can be shared, with no router dependency and no server rewrite rules needed.
- To check early in slice 1: exact versions that `create-vite` generates, recorded in `package.json`.

## Where It Runs and How Someone Tries It
- **Runtime:** any modern browser. Development needs Node.js 20+ and npm.
- **Run locally:** `npm install` then `npm run dev`, then open the printed URL (http://localhost:5173).
- **Tests:** `npm test` (Vitest). **Production build:** `npm run build` (outputs `dist/`).
- **Live link (chosen):** deployed on **Vercel** as a static site (`vercel deploy --prod`) at **https://decision-journal-liard.vercel.app**. (`decision-journal.vercel.app` belongs to an unrelated project.) The free Hobby plan is enough. No environment variables or keys.
- **Demo recording:** use the live URL in a fresh browser profile so the sample journal loads. **Reload sample journal** in the footer resets it between takes.
- Submission still requires the demo video and the public GitHub repo (https://github.com/anchitjaincfa/decision-journal). The live link is an extra.

## Look and Feel
From `prd.md > Look and Feel`, translated into tokens:

- **Palette (light):** background `#F5F6F8`, surface `#FFFFFF`, ink `#111318`, secondary ink `#5B6170`, hairline `#E3E5EA`. Brand/"felt" accent iris `#4A4FE0`. Diverging results: overconfident vermilion `#D9482B`, underconfident blue `#1F7AE0`, on target green `#2E9466`. **Dark:** background `#0E1014`, surface `#171A20`, ink `#ECEEF2`, with accents brightened for contrast.
- **Typography:** Geist 400/500/600. Display numbers 40–56px, weight 600, letter-spacing −0.02em, `font-variant-numeric: tabular-nums`. Body 15–16px. Labels in sentence case, never all-caps or monospace.
- **Layout:** max width 1120px. 8px spacing grid. Cards with 1px hairline and 14px radius, no heavy shadows. Plenty of whitespace; one idea per card.
- **Motion:** short (150–200ms) transitions on the Reality check headline and slider, respecting `prefers-reduced-motion`.
- **Copy:** second person, numbers first, sample sizes always visible.
- **Accessibility:** WCAG AA contrast, visible focus rings, every chart with a text summary (`<title>`/`aria-label` plus a visible caption), and color always paired with words.

## Components

### App shell and router
`App.tsx` plus `lib/router.ts`: the top bar (name, Insights/Journal tabs, New decision button), the sample banner, the footer with "Reload sample journal", and choosing the page from the hash. On phones, New decision is a fixed bottom button.
PRD ref: `prd.md > Screens and Layout`.

### Journal store
`lib/store.ts`: a React context + hook (`useJournal`) that owns the decisions array and exposes `addDecision`, `recordOutcome`, `deleteDecision`, `startFresh`, `loadSample`, plus `isSample` and `storageOk`. Every change is written through `storage.ts`.
PRD ref: `prd.md > Logging a decision`, `prd.md > Recording an outcome`, `prd.md > Sample data and starting fresh`.

### Storage
`lib/storage.ts`: reads and writes `localStorage["decision-journal:v1"]` as `{version: 1, isSample, decisions}`. It catches errors: if storage is unavailable it reports `storageOk = false` and keeps data in memory; if the saved data is unreadable it reseeds the sample journal and flags `recovered`.
PRD ref: `prd.md > States and Boundaries`.

### Stats engine
`lib/stats.ts`: pure functions, no React.
- `score(verdict)`: yes = 1, partly = 0.5, no = 0.
- `groupStats(decisions)`: n, hit rate, average confidence, gap (confidence − hit rate, in points), share that turned out well.
- `summarize`: totals plus the headline sentence.
- `calibrationBuckets`: 50–59, 60–69, 70–79, 80–89, 90–100.
- `areaGaps`, `moodPatterns`.
- `blindSpots`: n ≥ 3 and |gap| ≥ 15, plus best/worst mood by turned-out-well rate, at most 4.
- `dueForReview(decisions, now)`.
- `realityCheck(decisions, draft)`: evidence rows (area, mood, confidence bucket). One lead group, the most specific with enough history (area + mood → area → mood → bucket), drives both the headline and the suggestion so they can't disagree. The suggestion is only offered when the number is off and the lead isn't a bucket. It's the smoothed hit rate `(hits + 1) / (n + 2)`, kept within 10 points of the raw rate, rounded to 5 and clamped to 50–100.
- Constants `MIN_N = 3`, `GAP_THRESHOLD = 15`.

Tests in `lib/stats.test.ts`.
PRD ref: `prd.md > Reality check while deciding`, `prd.md > Insights`.

### Sample data
`lib/sampleData.ts`: `buildSampleJournal(now)` returns about 34 of Maya's decisions written by hand, with `daysAgo` offsets turned into real dates. It's designed so the patterns are real, not hard-coded:
- Money: about 84% confidence but right about 45% of the time.
- Career: about 62% confidence but right about 86% of the time.
- Excited and Rushed decisions do worst; Calm does best.
- Health and Relationships are roughly on target.
- 2–3 open decisions are already due, and 2 are not due yet.

PRD ref: `prd.md > Sample data and starting fresh`.

### Insights page
`pages/InsightsPage.tsx`: headline, `StatTiles`, `DueStrip`, `BlindSpotCards`, `CalibrationChart`, `AreaGapChart`, `MoodPatterns`. Shows the empty-state progress (n of 3) when fewer than 3 outcomes are recorded.
PRD ref: `prd.md > Insights`.

### Journal page
`pages/JournalPage.tsx`: status and area filters (area filter readable from the hash, e.g. `#/journal?area=money`) and `DecisionRow` list.
PRD ref: `prd.md > Journal`.

### New decision page
`pages/NewDecisionPage.tsx`: form fields (`AreaPicker`, `MoodPicker`, `ConfidenceSlider`, review interval), inline validation, and the live `RealityCheck` panel (sticky on desktop, inline under the slider on phones).
PRD ref: `prd.md > Logging a decision`, `prd.md > Reality check while deciding`.

### Decision page
`pages/DecisionPage.tsx`: `PredictionCard`, then `OutcomeForm` (open) or the outcome view (resolved), the `ResultCard` with before → after numbers right after saving, and inline-confirm delete.
PRD ref: `prd.md > Recording an outcome`.

### Charts
`components/charts/`:
- `CalibrationChart`: SVG scatter with the diagonal, dots sized by n, and labeled zones.
- `AreaGapChart`: dumbbell rows.
- `MoodPatterns`: paired horizontal bars.

All responsive via `viewBox`, with text captions.
PRD ref: `prd.md > Insights`.

## Data Model
```ts
type Area = 'money' | 'career' | 'health' | 'relationships' | 'home' | 'other';
type Mood = 'calm' | 'confident' | 'excited' | 'anxious' | 'rushed' | 'tired';
type Verdict = 'yes' | 'partly' | 'no';
type Result = 'good' | 'mixed' | 'bad';

interface Decision {
  id: string;            // crypto.randomUUID() (fallback: timestamp + random)
  title: string;
  expected: string;
  why?: string;
  area: Area;
  mood: Mood;
  confidence: number;    // 50–100, step 5
  createdAt: string;     // ISO
  reviewAt: string;      // ISO
  outcome?: { actual: string; verdict: Verdict; result: Result; recordedAt: string };
}

interface StoredJournal { version: 1; isSample: boolean; decisions: Decision[] }
```
- **Where it lives:** `localStorage["decision-journal:v1"]`, written after every change.
- **Returning:** loaded on startup. If the key is missing, the sample is seeded. If the data is malformed, the sample is reseeded with a notice.
- **Derived data** (stats, charts, due list) is never stored. It's recalculated from `decisions` on every render, which is instant at this size.

## File Structure
```
decision-journal/
├── index.html                 # page shell, font links, meta/OG tags
├── package.json               # scripts: dev, build, preview, test
├── vite.config.ts             # Vite + React plugin, Vitest config
├── tsconfig*.json
├── public/
│   └── favicon.svg            # app mark
├── src/
│   ├── main.tsx               # mounts <App/> inside the journal provider
│   ├── App.tsx                # shell: top bar, banner, page switch, footer
│   ├── lib/
│   │   ├── types.ts           # Decision, Area, Mood… + display labels
│   │   ├── storage.ts         # localStorage read/write with fallbacks
│   │   ├── store.ts           # JournalProvider + useJournal()
│   │   ├── stats.ts           # the stats engine (pure functions)
│   │   ├── stats.test.ts      # Vitest tests for the engine
│   │   ├── sampleData.ts      # Maya's sample journal
│   │   ├── router.ts          # tiny hash router hook + navigate()
│   │   └── format.ts          # percent, dates, relative "in 12 days"
│   ├── components/
│   │   ├── TopBar.tsx, SampleBanner.tsx, Footer.tsx
│   │   ├── StatTiles.tsx, DueStrip.tsx, BlindSpotCards.tsx
│   │   ├── RealityCheck.tsx, ConfidenceSlider.tsx, ChoiceChips.tsx
│   │   ├── DecisionRow.tsx, PredictionCard.tsx, OutcomeForm.tsx, ResultCard.tsx
│   │   └── charts/ CalibrationChart.tsx, AreaGapChart.tsx, MoodPatterns.tsx
│   ├── pages/
│   │   ├── InsightsPage.tsx, JournalPage.tsx
│   │   └── NewDecisionPage.tsx, DecisionPage.tsx
│   └── styles/
│       ├── tokens.css         # colors, type, spacing; light + dark
│       └── app.css            # layout and component styles
├── devpost/                   # Devpost Learn planning workspace
├── README.md                  # what it is, how to run, how it works
└── LICENSE                    # MIT (required by the hackathon rules)
```

## External Services and Dependencies
- **Google Fonts (Geist)**: `<link>` in `index.html`. No key, free. If it's blocked, the system font fallback is used.
- **Vercel Hobby**: static hosting via `vercel --prod`. No key in code, free. Builds with `npm run build`, output `dist/`.
- No APIs, databases or analytics.

## Important Failure Modes
- **localStorage blocked** (private mode, strict settings) → the app runs in memory with a banner: "Changes won't be saved in this browser."
- **Saved data unreadable** (manual edits, a future format) → reseed the sample journal with a notice. Never crash to a white screen.
- **Small samples produce scary numbers** → the `MIN_N` and `GAP_THRESHOLD` gates, plus "Not enough history yet" and visible sample sizes everywhere.

## What Was Simplified and Why
- **Hash router** instead of React Router: four screens don't need a dependency, and it deploys anywhere with no rewrite rules.
- **Hand-written SVG charts** instead of a chart library: three small charts, exact design control, smaller bundle.
- **No editing predictions**: honest by design and less UI. A full sealed-prediction ceremony stays in Later.
- **Fixed areas and moods**: no settings screen. Custom lists would need management UI and migration.
- **Smoothed suggestion** `(hits+1)/(n+2)` instead of a statistical model: one honest, explainable line that pulls small samples toward 50%.

## Decisions and Open Issues
- **Stack (Vite + React + TS, localStorage, Vercel):** agent recommendation, accepted under delegation. Tradeoff: no cross-device sync.
- **Stats thresholds (3 decisions, 15 points) and scoring (Partly = half a hit):** agent, delegated. These can be adjusted in `stats.ts` constants.
- **The learner's unknown:** the learner wants to "become an expert on coding agents." The concrete, project-grounded question is *how do you make an agent's work trustworthy when you delegate most of it?* Answered in this build by isolating the kernel's math in `stats.ts` with unit tests the agent must pass before each commit, plus browser checks of every screen. To be revisited in the `5-build` learning wrap-up.
- **Open (non-blocking):** final product name (PRD Open Questions), and whether to add the Brier score if time allows after final review.
