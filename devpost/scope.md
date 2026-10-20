---
doc: scope
status: approved
---

# Decision Journal

A journal that shows you how accurate your own judgment really is, and warns you when you're about to repeat a pattern.

## The Unique Kernel
**It talks back while you're deciding.** Other decision journals only look backward. This one uses your own track record while you're logging a new decision: *"You usually say 90% sure on money decisions, but you're right about 55% of the time."* It compares how you **felt** (expectation, confidence, mood) with how things **actually turned out**, then puts that gap in front of you at the moment it matters.

## Who It's For
Someone who wants to find out how accurate their decisions really are: a person making repeated, meaningful calls about money, career, health or relationships. Today they decide on gut feel and never systematically check whether that gut feel was right, so the same mistakes repeat.

## The Core Loop
1. **Before deciding:** write the decision, what you expect to happen, how confident you are (%), and how you feel (anxious, excited, rushed…). The app warns you if your record in this area or mood says your confidence is off.
2. **Later:** come back and record what actually happened.
3. **See the gap:** expected vs. actual, confidence vs. hit rate, and which moods go with the best and worst decisions.

Why they come back: each recorded outcome makes the next warning sharper.

## Inspiration & Identity
Honest, calm, a little confronting, like a good coach. Grounded in calibration research (Annie Duke's *Thinking in Bets*, Philip Tetlock's *Superforecasting*), without feeling academic. `3-prd` sets the visual direction.

## Why This Matters to the Learner
Anchit and Christine are entering Devpost's Build With AI: Basics to win. Anchit also wants to get really good at working with coding agents. Personally, the idea comes from wanting to "stop repeating the same mistakes."

## What "Working" Looks Like
The app opens with sample decisions from a fictional user, stored locally in the browser. In about a minute of video:
1. See your results: where predictions were right or wrong, whether "90% sure" means right 90% of the time, and which moods go with the best and worst outcomes, all summed up as plain-English blind spots (e.g. "overconfident on money, too cautious on career").
2. Record how a past decision actually turned out, and watch the results update.
3. **The "oh, that's cool" moment:** start a new decision, set 90% confidence, and the app warns you right there what your real track record in that area says.

## The POC Boundary
- Log a decision: what it is, area (money, career…), expected outcome, confidence %, mood.
- Record the actual outcome later.
- Results: expected vs. actual, confidence vs. hit rate, mood patterns, and blind-spot summaries.
- The live warning while logging a new decision.
- Sample data loaded on first open; everything saved in the browser.

## Later
- Sealed predictions: lock a prediction once it's logged so it can't be quietly rewritten afterward (protects against hindsight bias).
- A single "judgment score" (Brier score) to track over time.
- Reminders when a decision is due for an outcome check.
- Export/import of your journal.

## Explicitly Cut
- **Accounts, login, cloud sync:** everything stays local, and that's part of the privacy pitch.
- **AI-generated advice:** the warning is based on your own numbers, not a chatbot's opinion. It's more honest and has no API costs.
- **Mobile app:** a responsive web app is enough for the proof of concept.
