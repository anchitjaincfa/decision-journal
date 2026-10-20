---
doc: prd
status: approved
---

# Decision Journal: Product Requirements

A journal that shows people who want to know how accurate their decisions really are how their gut feeling compares with what actually happens, and warns them while they're deciding.
Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`.

> **How this PRD was made.** The learner approved the scope, then explicitly delegated the remaining product decisions: "Create the entire thing end to end." Decisions made by the agent under that delegation are labeled **(agent, delegated)** under Product Decisions, so the learner can review and reverse any of them.

## The Core Journey
Develops `scope.md > The Core Loop` and `scope.md > What "Working" Looks Like`.

1. **Arrive.** The app opens on **Insights** with a sample journal belonging to a fictional person, Maya: about 34 past decisions, most with recorded outcomes. A slim banner says it's sample data and offers "Start my own journal."
2. **See the gap.** At the top, one headline sentence sums up the person's judgment: *"When you feel 80%+ sure, you're right 55% of the time."* Below it:
   - **Blind spots**: plain-English cards such as "Overconfident on Money" and "Underconfident on Career."
   - **Confidence vs. reality**: a chart comparing stated confidence with actual hit rate.
   - **Expected vs. actual by area**: for each life area, how sure you said you were vs. how often you were right.
   - **Mood patterns**: which moods go with the best and worst outcomes.
3. **Review what's due.** A "Ready to review" strip lists decisions whose check-back date has passed. The person opens one and sees the prediction exactly as it was logged: what they expected, how sure they were, how they felt, and when.
4. **Record what happened.** They write what actually happened and answer two questions: *Did what you expected happen?* (Yes / Partly / No) and *How did it turn out for you?* (Good / Mixed / Bad). On save, a result card says "Called it" or "Missed it" and shows how that area's numbers moved (e.g. *Money: right 45% → 50% of the time*).
5. **Start a new decision: the kernel.** They tap **New decision**, then:
   - Write the decision and what they expect to happen.
   - Pick a life area and a mood.
   - Drag a confidence slider.

   As they do, a **Reality check** panel updates live: *"Careful: on Money decisions you average 84% confidence but you're right 45% of the time (11 decisions)."* It suggests an honest number ("Your track record suggests ~50%") and offers a one-tap "Use 50%."
6. **Save and come back.** They choose when to check back (1 week / 1 month / 3 months) and save. The decision appears in the **Journal** as Open. Success means the loop closed: a prediction was made with the history in view, and when an outcome is recorded it feeds the next warning.

## Screens and Layout
One web app, four screens, with a persistent top bar: product name at left, **Insights** and **Journal** tabs in the middle, and a primary **New decision** button at right. On phones the tabs stay in the top bar and **New decision** becomes a full-width button pinned to the bottom.

- **Insights** (home): the headline sentence, then three numbers (decisions resolved, overall hit rate, average confidence gap), the "Ready to review" strip, blind-spot cards, then the three charts stacked in reading order.
- **Journal**: every decision, newest first, with filters (All / Open / Resolved) and an area filter. Each row shows the title, area, date logged, confidence, mood, and status ("Ready to review", "Check back in 12 days", "Came true", "Partly", "Didn't happen").
- **New decision**: the form on the left and the **Reality check** panel on the right, sticky while scrolling. On phones the panel sits directly under the confidence slider, so the warning is visible exactly where the number is chosen.
- **Decision detail**: the logged prediction as a read-only card at the top. Below it is either the "What happened?" form (open decisions) or the recorded outcome (resolved ones), plus a quiet "Delete decision" link.

## Look and Feel
Builds on `scope.md > Inspiration & Identity` ("honest, calm, a little confronting, like a good coach"). Visual direction chosen by the agent under delegation:

- **Character:** a precise instrument, not a diary. Calm, airy layouts with one bold number per idea. References: the clarity of Apple Health summaries, Linear's precision, the restraint of a good research chart. Avoid: generic AI-app styling (purple gradients, glassmorphism, emoji-heavy cards), cream-paper "journal" clichés, serif/monospace label decoration.
- **Typography:** a modern geometric-humanist sans with tabular numerals for all statistics. Big, tight display numbers; plain sentence-case labels.
- **Color:** a neutral, slightly cool light background with white surfaces and near-black ink. One brand accent (deep iris blue) marks "what you felt" (confidence). Results use a restrained diverging pair: warm vermilion for **overconfident**, cool blue for **underconfident**, and a muted green for **on target**. Color is never the only signal; labels and positions always carry the meaning too.
- **Dark mode:** follows the system setting.
- **Voice:** second person, direct, kind but honest. "You said 90%. History says 55%." No exclamation-mark cheerleading, no jargon without a one-line explanation (e.g. "hit rate: how often what you expected actually happened").

## Features and Behavior

### Logging a decision
Develops `scope.md > The Core Loop` step 1.

- Fields:
  - **Decision** (short title, required).
  - **What do you expect to happen?** (required).
  - **Why?** (optional notes).
  - **Life area**: Money, Career, Health, Relationships, Home, Other (required).
  - **Mood right now**: Calm, Confident, Excited, Anxious, Rushed, Tired (required).
  - **Confidence**: 50–100% in steps of 5 (default 70).
  - **Check back in**: 1 week / 1 month / 3 months (default 1 month).
- Helper text under the slider: "How likely is it that what you expect will happen? Below 50% means you expect something else, so write that instead."
- Saving adds the decision to the Journal as Open and goes to its detail page with a "Logged. We'll ask you how it went on [date]" confirmation.
- A logged prediction can't be edited afterward, only deleted, so the record stays honest.
  - [ ] Saving with any required field empty shows an inline message on that field and doesn't save.
  - [ ] A saved decision appears at the top of the Journal as Open with the correct check-back date.

### Reality check while deciding
The kernel, `scope.md > The Unique Kernel`.

- The panel updates instantly whenever the area, mood or confidence changes. It shows:
  - **A headline**: one sentence based on the most specific group with enough history (area + mood, then area, then mood, then confidence level), with its sample size, marked by direction (overconfident / underconfident / about right). A second line adds the area or mood signal that disagrees most.
  - **Up to three evidence rows**, each with its sample size:
    - "In Money": your average confidence vs. your hit rate.
    - "When Excited": your hit rate and how often it turned out well.
    - "At 90–100% sure": your actual hit rate at that confidence level, across everything.
  - **A suggestion**: "Your track record suggests ~50%," with a **Use 50%** button that moves the slider. It appears only when the number is off, and comes from the same group as the headline, so taking it always lands on "fits your record." 
- A group needs **at least 3 resolved decisions** to count as evidence. With fewer, the row says "Not enough history yet (2 of 3)."
- "Overconfident" or "underconfident" is called only when the gap is **15 points or more**. Otherwise the panel says the confidence looks about right.
- The suggestion uses the headline's group: the smoothed hit rate, kept within 10 points of the real one, rounded to the nearest 5 and kept within 50–100. A confidence-level group never produces a suggestion, because moving the slider changes the group. If even 50% is above the record, the panel says it's closer to a coin flip and suggests predicting a different outcome.
  - [ ] With the sample journal, choosing Money + Excited + 90% shows an overconfidence warning that names Money, gives a number below 90, and shows sample sizes.
  - [ ] Choosing Career at 60% shows an underconfidence message.
  - [ ] Pressing "Use N%" moves the slider to N and the headline updates.
  - [ ] Changing area, mood or confidence updates the panel with no save or page reload.

### Recording an outcome
`scope.md > The Core Loop` step 2.

- The decision detail page shows the prediction card (expected outcome, confidence, mood, area, date logged, check-back date).
- Fields: **What actually happened?** (required), **Did what you expected happen?** Yes / Partly / No (required), **How did it turn out for you?** Good / Mixed / Bad (required).
- Scoring: Yes counts as a hit, Partly as half a hit, No as a miss.
- After saving, a result card shows "Called it" / "Partly" / "Missed it" plus how this area's hit rate and the overall hit rate changed (before → after).
  - [ ] Recording an outcome on a due sample decision changes the Insights numbers and charts when you go back.
  - [ ] The before → after line shows real recomputed numbers.

### Insights
`scope.md > The Core Loop` step 3 and `scope.md > What "Working" Looks Like`.

- **Headline sentence**: based on high-confidence calls (80%+) when there are at least 3 of them; otherwise the overall average confidence vs. hit rate.
- **Three numbers:**
  - Decisions resolved.
  - Overall hit rate.
  - Average confidence gap (e.g. "+14 pts overconfident").
- **Ready to review**: open decisions whose check-back date has passed, each linking to its detail page. Hidden when none are due.
- **Blind-spot cards**: one per area or mood with at least 3 resolved decisions and a gap of 15+ points, plus the best and worst mood by "turned out well" rate. At most 4 cards, largest gaps first. Each states the numbers and sample size and links to the Journal filtered to that area.
- **Confidence vs. reality** chart:
  - Stated-confidence groups along the bottom (50s, 60s, 70s, 80s, 90–100).
  - Actual hit rate up the side.
  - A dashed "perfectly calibrated" diagonal, with dots sized by how many decisions each covers.
  - Dots below the line are labeled as overconfident.
  - A one-line caption explains how to read it.
- **Expected vs. actual by area**: one row per area, a dot for average confidence and a dot for hit rate, joined by a line colored by direction.
- **Mood patterns**: one row per mood showing hit rate and "turned out well" rate, with the best and worst moods labeled.
  - [ ] The sample journal shows at least one overconfident card (Money), one underconfident card (Career), and a best/worst mood.
  - [ ] Every number on Insights changes correctly after recording a new outcome.

### Journal
`scope.md > The POC Boundary`.

- A list with filters (All / Open / Resolved, plus area). Selecting a row opens its detail page.
  - [ ] Filters narrow the list correctly, and a blind-spot card link opens the Journal filtered to that area.

### Sample data and starting fresh
`scope.md > What "Working" Looks Like`.

- On first open the app loads Maya's sample journal, with dates relative to today so the demo always looks current. At least two decisions are due for review.
- The banner offers **Start my own journal**. After an inline confirm ("This clears the sample entries"), the app is empty.
- A footer link, **Reload sample journal**, brings the sample back at any time.
  - [ ] Start my own clears everything, and Reload sample journal restores it.

## States and Boundaries
- **First use**: sample journal plus banner (see above).
- **Empty journal** (after Start my own): Insights shows "Your insights appear after you record 3 outcomes," a 0-of-3 progress indicator, and a New decision button. Journal shows "No decisions yet." The Reality check panel says "No track record yet. After a few outcomes, this panel will tell you how far to trust that number."
- **Thin data**: any chart or card without enough data shows a quiet "Not enough history yet" message, never a misleading number.
- **Persistence**: everything is saved in this browser and survives reloads. Nothing leaves the device. Another browser or device starts fresh.
- **Storage unavailable or corrupted**: if the browser blocks saving, the app still works for the session and shows "Changes won't be saved in this browser." If saved data can't be read, the app falls back to the sample journal and says so.
- **Deleting**: "Delete decision" asks for an inline confirmation, then returns to the Journal.

## Product Decisions
- Core idea: the app warns you while you decide, using your own track record. **(learner)** "Yes, you should warn me."
- Audience: someone who wants to find out how accurate their decisions really are. **(learner)**
- Demo path: sample data → see results → record an outcome and watch stats update → new decision triggers a warning. **(learner)** "let's go with this for now."
- Sample data, local-only storage. **(learner, from the original idea)**
- Three-level outcome (Yes / Partly / No) plus a separate Good / Mixed / Bad rating. **(agent, delegated)** This separates "was my prediction right?" from "did it work out?", which emotion patterns need, and avoids judging decisions only by results.
- Confidence limited to 50–100% in steps of 5. **(agent, delegated)** Keeps predictions about the outcome you actually expect and makes chart groups readable.
- Thresholds: 3 resolved decisions minimum, 15-point gap to call over/underconfidence. **(agent, delegated)** Avoids loud claims from tiny samples. Sample sizes are always shown.
- Predictions can't be edited after logging. **(agent, delegated)** The simplest honest behavior. A full "sealed prediction" experience stays in Later per scope.
- Fixed lists of 6 areas and 6 moods. **(agent, delegated)** Custom lists are deferred.
- Visual direction under Look and Feel. **(agent, delegated)**
- Name stays "Decision Journal". **(learner's term)** See Open Questions.

## What We're Building
- Four screens: Insights, Journal, New decision, Decision detail.
- Logging a decision with the live Reality check and the "Use N%" suggestion.
- Recording outcomes with before → after feedback.
- Insights: headline, three numbers, ready-to-review strip, blind-spot cards, three charts.
- Sample journal on first open, Start my own, Reload sample journal.
- Browser storage, responsive layout, system dark mode.

## Deferred From the POC
- **Sealed-prediction ceremony** (lock animation, "unseal" moment): in scope's Later. The POC already prevents edits.
- **Judgment score (Brier score)**: scope's Later. Adds a statistic that needs explaining in the video.
- **Reminders/notifications**: scope's Later. The in-app "Ready to review" strip covers the demo.
- **Export/import**: scope's Later.
- **Custom areas and moods**: adds settings screens without proving the core idea.

## Possible Later Enhancements
- Trend over time: is my calibration improving month to month?
- A "pre-mortem" prompt: "Imagine it failed. Why?"
- Shareable, anonymized calibration card.

## Non-Goals
- **No accounts, login or cloud sync**: privacy and simplicity (scope cut).
- **No AI-generated advice**: the warning comes from your own numbers (scope cut).
- **No native mobile app**: the responsive web app covers phones (scope cut).
- **Not a statistics tool**: no confidence intervals or p-values on screen. Sample sizes are the honesty mechanism.

## Open Questions
- **Product name**: keep "Decision Journal", or pick a more memorable brand for the video? Default: Decision Journal. Can wait until `6-ship`.
- **Review format** for planning docs: default Markdown. Doesn't block anything.
