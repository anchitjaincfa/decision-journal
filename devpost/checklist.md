---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast. The learner delegated the build end to end ("Create the entire thing end to end"). The agent verifies and commits every slice; the learner's hands-on review happens at the final checkpoint.

## Slices

- [x] **1. The sample journal opens and you can browse it**
  Becomes usable: A running app with the top bar, Maya's sample journal seeded into browser storage, a Journal list with filters, and a read-only decision detail page.
  Why now: Proves the whole path (scaffold → data → storage → screen) and produces the realistic data every later slice, including the kernel, depends on.
  PRD ref: `prd.md > Screens and Layout`, `prd.md > Journal`, `prd.md > Sample data and starting fresh`
  Spec ref: `spec.md > App shell and router`, `spec.md > Storage`, `spec.md > Journal store`, `spec.md > Sample data`, `spec.md > Look and Feel`, `spec.md > File Structure`
  Build: Scaffold Vite react-ts, add tokens/app CSS, types, storage, store, hash router, sample data, TopBar, JournalPage with filters, DecisionRow, DecisionPage with PredictionCard.
  Verify (mechanical): `npm run build` passes with no type errors; dev server loads; browser shows the sample journal list; reload keeps data; `#/decision/<id>` renders the prediction.
  Learner check: Open the app, browse Maya's journal, filter to Money, open a decision.
  Commit: `Scaffold app with sample journal, journal list, and decision detail`

- [x] **2. The Reality check warns you while you decide (the kernel)**
  Becomes usable: New decision form with live Reality check (headline, evidence rows with sample sizes, suggestion, "Use N%"), validation, and saving to the journal.
  Why now: This is the unique kernel. It comes immediately after the data exists, before any dashboard work.
  PRD ref: `prd.md > Logging a decision`, `prd.md > Reality check while deciding`
  Spec ref: `spec.md > Stats engine`, `spec.md > New decision page`, `spec.md > Data Model`
  Build: stats.ts core (groupStats, realityCheck, buckets) with Vitest tests; NewDecisionPage, ChoiceChips, ConfidenceSlider, RealityCheck; addDecision.
  Verify (mechanical): `npm test` passes (including Money+Excited+90 → overconfident, Career+60 → underconfident, thin data → "not enough"); browser: changing inputs updates the panel live; Use N% moves the slider; save → appears Open in Journal.
  Learner check: Start a Money decision while Excited at 90% and read what the app tells you; press Use N%.
  Commit: `Add new decision form with live reality check`

- [x] **3. Recording an outcome updates your numbers**
  Becomes usable: Outcome form on open decisions, result card with before → after hit rates, delete with inline confirm.
  Why now: Closes the loop. Without it, predictions never feed back into the warning.
  PRD ref: `prd.md > Recording an outcome`, `prd.md > States and Boundaries`
  Spec ref: `spec.md > Decision page`, `spec.md > Journal store`
  Build: OutcomeForm, ResultCard, recordOutcome, deleteDecision, summarize-before/after.
  Verify (mechanical): Tests for score/summarize pass; browser: record an outcome on a due decision → result card shows real before → after; status changes in Journal; delete removes it.
  Learner check: Open a due decision, record what happened, read the result card.
  Commit: `Add outcome recording with before/after feedback`

- [x] **4. Insights shows your blind spots**
  Becomes usable: Home screen with headline, three numbers, ready-to-review strip, blind-spot cards, calibration chart, expected-vs-actual by area, mood patterns.
  Why now: The payoff view; depends on the stats engine and real outcomes from slices 2–3.
  PRD ref: `prd.md > Insights`, `prd.md > The Core Journey`
  Spec ref: `spec.md > Insights page`, `spec.md > Charts`, `spec.md > Stats engine`
  Build: summarize headline, blindSpots, areaGaps, moodPatterns, dueForReview + tests; StatTiles, DueStrip, BlindSpotCards, CalibrationChart, AreaGapChart, MoodPatterns.
  Verify (mechanical): `npm test` passes (sample → Money overconfident, Career underconfident cards); browser screenshot of Insights at desktop and phone widths; recording an outcome changes the numbers.
  Learner check: Read the Insights page as if it were your own and say whether the blind spots are clear.
  Commit: `Add insights dashboard with blind spots and charts`

- [ ] **5. Starting fresh, empty states, and polish**
  Becomes usable: Sample banner with Start my own (inline confirm), Reload sample journal, empty/thin states everywhere, storage-failure banner, responsive phone layout, dark mode, accessibility pass.
  Why now: Turns a demo into a complete product experience (the Design criterion) once all behavior exists.
  PRD ref: `prd.md > Sample data and starting fresh`, `prd.md > States and Boundaries`, `prd.md > Look and Feel`
  Spec ref: `spec.md > Important Failure Modes`, `spec.md > Look and Feel`, `spec.md > Storage`
  Build: SampleBanner, Footer, startFresh/loadSample, empty states, storage fallbacks, mobile layout, dark tokens, focus styles, README + LICENSE.
  Verify (mechanical): `npm test` and `npm run build` pass; browser: Start my own → empty states render; Reload sample → restored; phone-width and dark-mode screenshots; corrupt localStorage → recovers without crashing.
  Learner check: Press Start my own, look at the empty app, then reload the sample.
  Commit: `Add start-fresh flow, empty states, and responsive polish`

- [ ] **6. Live on the web**
  Becomes usable: A public Vercel URL anyone (judges included) can open.
  Why now: Last, because it only packages finished behavior.
  PRD ref: `prd.md > What We're Building`
  Spec ref: `spec.md > Where It Runs and How Someone Tries It`
  Build: Vercel project linked to the repo directory, production deploy, URL recorded in README and spec.
  Verify (mechanical): Production URL returns 200 without authentication and the sample journal renders in a fresh browser tab.
  Learner check: Open the live link on your phone.
  Commit: `Record live deployment URL`

## Hands-on Checkpoints

- [ ] Early usable behavior explored: shared with the final-review session at the learner's request (end-to-end build delegated)
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete: feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete: guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed: offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence:
Route and stops:
Edit outcome:
Reflection:
Activity mode:

## Revisions
