# Decision Journal

**Live:** https://decision-journal-liard.vercel.app

Write down what you expect and how sure you are **before** you decide. Record what actually happened **later**. Decision Journal compares the two and shows:

1. **Expected vs. actual**: where your predictions were right or wrong, by life area.
2. **Confidence vs. hit rate**: whether "90% sure" really means you're right 90% of the time.
3. **Mood patterns**: which moods (calm, excited, rushed…) go with your best and worst decisions.

The main feature is the **Reality check**: while you log a new decision, the app shows your own track record for that area, mood and confidence level, and suggests a more honest number (*"90% looks high. On Money decisions, you've been right 41% of the time."*).

The app opens with a sample journal for a fictional person (Maya), so every screen has data from the first visit. Everything is stored in your browser's `localStorage`. There's no account and no server, and nothing leaves your device.

## Run it

Requires Node.js 20+.

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # stats engine + storage tests (Vitest)
npm run build    # static site in dist/
```

## How it works

| Piece | File | What it does |
|---|---|---|
| Stats engine | `src/lib/stats.ts` | Pure functions: hit rates, confidence gaps, calibration buckets, blind spots, and the live `realityCheck()` |
| Sample journal | `src/lib/sampleData.ts` | 35 of Maya's decisions; the patterns come from the entries, not hard-coded numbers |
| Storage | `src/lib/storage.ts` | Reads/writes `localStorage`, falls back to memory if storage is blocked, and recovers from unreadable data |
| Screens | `src/pages/` | Insights, Journal, New decision, Decision detail |
| Charts | `src/components/charts/` | Hand-drawn SVG with hover/keyboard tooltips and a table view |

Scoring rules: *Yes* counts as a hit, *Partly* as half a hit, *No* as a miss. A group needs **3** resolved decisions before the app draws conclusions from it, and a gap of **15 points** or more before it calls you over- or underconfident. Suggestions use `(hits + 1) / (n + 2)` so a few lucky calls don't read as certainty. All of these are constants at the top of `stats.ts`.

## How it was planned

Built for Devpost's [Build With AI: Basics](https://learn-ai-basics.devpost.com/) with the [Devpost Learn skill pack](https://github.com/challengepost/learn-ai-basics) (versions in `skills-lock.json`). The planning documents the skills produced are in [`devpost/`](devpost/):
- [`scope.md`](devpost/scope.md): the idea and what makes it different.
- [`prd.md`](devpost/prd.md): screens, behavior, edge cases.
- [`spec.md`](devpost/spec.md): the technical plan.
- [`checklist.md`](devpost/checklist.md): the build, slice by slice.

## License

[MIT](LICENSE)
