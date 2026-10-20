import { describe, expect, it } from 'vitest';
import { buildSampleJournal } from './sampleData';
import {
  GAP_THRESHOLD,
  MIN_N,
  bucketOf,
  groupStats,
  realityCheck,
  score,
  smoothedRate,
  summarize,
  blindSpots,
  dueForReview,
  moodPatterns,
} from './stats';
import type { Decision } from './types';

const NOW = new Date('2026-10-20T12:00:00Z');
const sample = buildSampleJournal(NOW);

const make = (over: Partial<Decision> & Pick<Decision, 'confidence'>, verdict?: 'yes' | 'partly' | 'no'): Decision => ({
  id: Math.random().toString(36).slice(2),
  title: 't',
  expected: 'e',
  area: 'money',
  mood: 'calm',
  createdAt: '2026-01-01T00:00:00Z',
  reviewAt: '2026-02-01T00:00:00Z',
  ...(verdict ? { outcome: { actual: 'a', verdict, result: verdict === 'yes' ? 'good' : 'bad', recordedAt: '2026-02-02T00:00:00Z' } } : {}),
  ...over,
});

describe('scoring', () => {
  it('counts partly as half a hit', () => {
    expect(score('yes')).toBe(1);
    expect(score('partly')).toBe(0.5);
    expect(score('no')).toBe(0);
  });

  it('ignores open decisions in group stats', () => {
    const s = groupStats([make({ confidence: 90 }, 'yes'), make({ confidence: 70 }, 'no'), make({ confidence: 50 })]);
    expect(s.n).toBe(2);
    expect(s.hitRate).toBe(0.5);
    expect(s.avgConfidence).toBe(80);
    expect(s.gap).toBe(30);
  });

  it('returns zeros for an empty group instead of NaN', () => {
    const s = groupStats([]);
    expect(s).toMatchObject({ n: 0, hitRate: 0, avgConfidence: 0, gap: 0 });
  });

  it('puts 100% in the top bucket and 50% in the bottom one', () => {
    expect(bucketOf(100).id).toBe('90');
    expect(bucketOf(50).id).toBe('50');
    expect(bucketOf(85).id).toBe('80');
  });

  it('smooths small samples toward 50%', () => {
    expect(smoothedRate(groupStats([make({ confidence: 90 }, 'yes'), make({ confidence: 90 }, 'yes'), make({ confidence: 90 }, 'yes')]))).toBe(0.8);
  });
});

describe('sample journal patterns (they must come from the data)', () => {
  it('is overconfident about money and underconfident about career', () => {
    const money = groupStats(sample.filter((d) => d.area === 'money'));
    const career = groupStats(sample.filter((d) => d.area === 'career'));
    expect(money.gap).toBeGreaterThanOrEqual(GAP_THRESHOLD);
    expect(career.gap).toBeLessThanOrEqual(-GAP_THRESHOLD);
  });

  it('has decisions due for review and decisions still in the future', () => {
    const open = sample.filter((d) => !d.outcome);
    expect(open.filter((d) => new Date(d.reviewAt) <= NOW).length).toBeGreaterThanOrEqual(2);
    expect(open.filter((d) => new Date(d.reviewAt) > NOW).length).toBeGreaterThanOrEqual(1);
  });

  it('never records an outcome in the future', () => {
    for (const d of sample) if (d.outcome) expect(new Date(d.outcome.recordedAt).getTime()).toBeLessThanOrEqual(NOW.getTime());
  });
});

describe('realityCheck', () => {
  it('warns about overconfidence for an excited 90% money decision', () => {
    const rc = realityCheck(sample, { area: 'money', mood: 'excited', confidence: 90 });
    expect(rc.status).toBe('ok');
    expect(rc.direction).toBe('over');
    expect(rc.suggestion).not.toBeNull();
    expect(rc.suggestion!.value).toBeLessThan(90);
    expect(rc.rows.every((r) => r.stats.n > 0)).toBe(true);
    expect(rc.rows.find((r) => r.key === 'area')!.label).toBe('In Money');
  });

  it('says a 60% career decision is likely underconfident', () => {
    const rc = realityCheck(sample, { area: 'career', mood: 'calm', confidence: 60 });
    expect(rc.direction).toBe('under');
    expect(rc.suggestion!.value).toBeGreaterThan(60);
  });

  it('updates when only the confidence changes', () => {
    const a = realityCheck(sample, { area: 'career', mood: 'calm', confidence: 60 });
    const b = realityCheck(sample, { area: 'career', mood: 'calm', confidence: 80 });
    expect(a.headline).not.toBe(b.headline);
  });

  it('suggests a number within 50–100 in steps of 5', () => {
    for (const area of ['money', 'career', 'health', 'relationships', 'home'] as const) {
      for (const confidence of [50, 75, 100]) {
        const s = realityCheck(sample, { area, mood: 'excited', confidence }).suggestion;
        if (s) {
          expect(s.value % 5).toBe(0);
          expect(s.value).toBeGreaterThanOrEqual(50);
          expect(s.value).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  it('has no track record with an empty journal', () => {
    const rc = realityCheck([], { area: 'money', mood: 'calm', confidence: 70 });
    expect(rc.status).toBe('none');
    expect(rc.suggestion).toBeNull();
  });

  it(`needs ${MIN_N} resolved decisions in a group before it speaks`, () => {
    const two = [make({ confidence: 90, area: 'home' }, 'no'), make({ confidence: 90, area: 'home' }, 'no')];
    const rc = realityCheck(two, { area: 'home', mood: 'tired', confidence: 70 });
    expect(rc.status).toBe('thin');
    expect(rc.direction).toBeNull();
    const three = [...two, make({ confidence: 90, area: 'home' }, 'no')];
    expect(realityCheck(three, { area: 'home', mood: 'tired', confidence: 90 }).status).toBe('ok');
  });

  it('works before an area or mood is chosen', () => {
    const rc = realityCheck(sample, { area: null, mood: null, confidence: 90 });
    expect(rc.rows.map((r) => r.key)).toEqual(['bucket']);
    expect(rc.status).toBe('ok');
  });
});

describe('realityCheck copy', () => {
  it('names Money in the headline and adds a second signal', () => {
    const rc = realityCheck(sample, { area: 'money', mood: 'excited', confidence: 90 });
    expect(rc.headline).toMatch(/^90% looks high\. On Money decisions/);
    expect(rc.secondary).toMatch(/^And /);
  });

  it('says a number fits when the area agrees, and flags a disagreeing signal with "But"', () => {
    const rc = realityCheck(sample, { area: 'health', mood: 'calm', confidence: 70 });
    expect(rc.direction).toBe('even');
    expect(rc.headline).toMatch(/^70% fits your record\. On Health decisions/);
    expect(rc.secondary).toMatch(/^But when you’re calm/);
  });
});

describe('realityCheck after taking the suggestion', () => {
  it('keeps pointing at the chosen mood, not a generic bucket', () => {
    const rc = realityCheck(sample, { area: 'money', mood: 'excited', confidence: 50 });
    expect(rc.secondary).toMatch(/when you’re excited/);
  });
});

describe('summarize', () => {
  it('leads with high-confidence calls when there are enough of them', () => {
    const h = summarize(sample).headline!;
    expect(h.felt).toBe('80%+ sure');
    expect(h.direction).toBe('over');
    expect(h.n).toBeGreaterThanOrEqual(MIN_N);
  });

  it('changes when one more outcome is recorded', () => {
    const before = summarize(sample).overall;
    const recorded = sample.map((d) =>
      d.id === 's33' ? { ...d, outcome: { actual: 'a', verdict: 'no' as const, result: 'bad' as const, recordedAt: NOW.toISOString() } } : d,
    );
    const after = summarize(recorded).overall;
    expect(after.n).toBe(before.n + 1);
    expect(after.hitRate).toBeLessThan(before.hitRate);
  });

  it('has no headline for an empty journal', () => {
    expect(summarize([]).headline).toBeNull();
  });
});

describe('insights', () => {
  it('finds Money overconfidence, Career underconfidence, and a best and worst mood', () => {
    const spots = blindSpots(sample);
    expect(spots.length).toBeLessThanOrEqual(4);
    expect(spots.find((s) => s.tone === 'over')?.title).toBe('Money decisions');
    expect(spots.find((s) => s.tone === 'under')?.title).toBe('Career decisions');
    expect(spots.some((s) => s.tone === 'good')).toBe(true);
    expect(spots.some((s) => s.tone === 'bad')).toBe(true);
  });

  it('ignores moods without enough history when picking best and worst', () => {
    const { best, worst, rows } = moodPatterns(sample);
    const enough = rows.filter((r) => r.enough).map((r) => r.mood);
    expect(enough).toContain(best);
    expect(enough).toContain(worst);
    expect(best).not.toBe(worst);
  });

  it('lists only open decisions past their check-back date, oldest first', () => {
    const due = dueForReview(sample, NOW);
    expect(due.every((d) => !d.outcome && new Date(d.reviewAt) <= NOW)).toBe(true);
    expect(due.map((d) => d.reviewAt)).toEqual([...due.map((d) => d.reviewAt)].sort());
  });

  it('has no blind spots in an empty journal', () => {
    expect(blindSpots([])).toEqual([]);
  });
});

describe('headline and suggestion agree', () => {
  const areas = ['money', 'career', 'health', 'relationships', 'home', 'other', null] as const;
  const moods = ['calm', 'confident', 'excited', 'anxious', 'rushed', 'tired', null] as const;
  const confs = [50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 100];

  it('never offers a suggestion when the number already fits', () => {
    for (const area of areas) for (const mood of moods) for (const confidence of confs) {
      const rc = realityCheck(sample, { area, mood, confidence });
      if (rc.direction === 'even') expect(rc.suggestion).toBeNull();
    }
  });

  it('taking the suggestion always lands on "fits your record"', () => {
    for (const area of areas) for (const mood of moods) for (const confidence of confs) {
      const s = realityCheck(sample, { area, mood, confidence }).suggestion;
      if (!s) continue;
      const after = realityCheck(sample, { area, mood, confidence: s.value });
      // At the 50% floor a bad record can't be fixed by a lower number: it says "coin flip" instead.
      if (s.coinFlip && s.value === 50) expect(after.kicker).toBe('Closer to a coin flip');
      else expect(after.direction, `${area}/${mood}/${confidence} → ${s.value}`).toBe('even');
    }
  });

  it('moves the suggestion in the direction of the warning', () => {
    for (const area of areas) for (const mood of moods) for (const confidence of confs) {
      const rc = realityCheck(sample, { area, mood, confidence });
      if (!rc.suggestion) continue;
      if (rc.direction === 'over') expect(rc.suggestion.value).toBeLessThan(confidence);
      if (rc.direction === 'under') expect(rc.suggestion.value).toBeGreaterThan(confidence);
    }
  });

  it('calls a 50% guess with a bad record a coin flip instead of suggesting lower', () => {
    const rc = realityCheck(sample, { area: 'money', mood: 'excited', confidence: 50 });
    expect(rc.kicker).toBe('Closer to a coin flip');
    expect(rc.suggestion).toBeNull();
  });
});

describe('review fixes', () => {
  it('does not call a mood "riskiest" when moods perform the same', () => {
    const ds = [
      ...[1, 2, 3].map(() => make({ confidence: 70, mood: 'calm' }, 'yes')),
      ...[1, 2, 3].map(() => make({ confidence: 70, mood: 'tired' }, 'yes')),
    ];
    const { best, worst } = moodPatterns(ds);
    expect(worst).toBeNull();
    expect(best).toBeNull();
    expect(blindSpots(ds).some((s) => s.tone === 'bad')).toBe(false);
  });

  it('says "high-confidence calls" only when the headline is about them', () => {
    const ds = [1, 2, 3, 4].map(() => make({ confidence: 70 }, 'no'));
    expect(summarize(ds).headline!.basis).toBe('overall');
  });
});
