import { AREAS, MOODS, areaLabel, moodLabel, type Area, type Decision, type Mood, type Verdict } from './types';

/** A group needs this many resolved decisions before we draw conclusions from it. */
export const MIN_N = 3;
/** Confidence and reality must differ by at least this many points to call it over/underconfidence. */
export const GAP_THRESHOLD = 15;

export type Direction = 'over' | 'under' | 'even';

export interface GroupStats {
  n: number;
  /** Partly counts as half a hit. */
  hits: number;
  /** 0–1 */
  hitRate: number;
  /** 0–100 */
  avgConfidence: number;
  /** avgConfidence − hitRate, in points. Positive = overconfident. */
  gap: number;
  /** Decisions that turned out well for the person (result === 'good'). */
  good: number;
  /** 0–1 */
  goodRate: number;
}

export const score = (v: Verdict) => (v === 'yes' ? 1 : v === 'partly' ? 0.5 : 0);

export const resolved = (ds: Decision[]) => ds.filter((d) => d.outcome);

export const groupStats = (ds: Decision[]): GroupStats => {
  const r = resolved(ds);
  const n = r.length;
  if (n === 0) return { n: 0, hits: 0, hitRate: 0, avgConfidence: 0, gap: 0, good: 0, goodRate: 0 };
  const hits = r.reduce((s, d) => s + score(d.outcome!.verdict), 0);
  const good = r.filter((d) => d.outcome!.result === 'good').length;
  const avgConfidence = r.reduce((s, d) => s + d.confidence, 0) / n;
  const hitRate = hits / n;
  return { n, hits, hitRate, avgConfidence, gap: avgConfidence - hitRate * 100, good, goodRate: good / n };
};

export const direction = (gap: number): Direction =>
  gap >= GAP_THRESHOLD ? 'over' : gap <= -GAP_THRESHOLD ? 'under' : 'even';

// ── Confidence buckets ──────────────────────────────────────────────────

export interface Bucket {
  id: string;
  label: string;
  lo: number;
  hi: number;
  /** Where the bucket sits on a 50–100 axis. */
  mid: number;
}

export const BUCKETS: Bucket[] = [
  { id: '50', label: '50–59%', lo: 50, hi: 59, mid: 55 },
  { id: '60', label: '60–69%', lo: 60, hi: 69, mid: 65 },
  { id: '70', label: '70–79%', lo: 70, hi: 79, mid: 75 },
  { id: '80', label: '80–89%', lo: 80, hi: 89, mid: 85 },
  { id: '90', label: '90–100%', lo: 90, hi: 100, mid: 95 },
];

export const bucketOf = (confidence: number): Bucket =>
  BUCKETS.find((b) => confidence >= b.lo && confidence <= b.hi) ?? (confidence < 50 ? BUCKETS[0] : BUCKETS[4]);

export const calibrationBuckets = (ds: Decision[]) =>
  BUCKETS.map((bucket) => ({
    bucket,
    stats: groupStats(ds.filter((d) => d.confidence >= bucket.lo && d.confidence <= bucket.hi)),
  }));

// ── Live reality check (the kernel) ─────────────────────────────────────

export interface Draft {
  area: Area | null;
  mood: Mood | null;
  confidence: number;
}

export interface EvidenceRow {
  key: 'area' | 'mood' | 'bucket';
  label: string;
  stats: GroupStats;
  enough: boolean;
  /** What the row says, in plain language. */
  text: string;
  /** Draft confidence − this group's hit rate, in points. */
  gapToDraft: number;
}

export interface RealityCheck {
  status: 'none' | 'thin' | 'ok';
  direction: Direction | null;
  kicker: string;
  headline: string;
  /** A second signal, e.g. the mood, when it also disagrees with the number. */
  secondary: string | null;
  rows: EvidenceRow[];
  suggestion: {
    value: number;
    basis: string;
    n: number;
    /** True when even 50% is above the record: the expected outcome itself may be wrong. */
    coinFlip: boolean;
  } | null;
}

const p = (rate: number) => `${Math.round(rate * 100)}%`;
const round5 = (x: number) => Math.round(x / 5) * 5;
const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

/** Pulls small samples toward 50% so three lucky calls don't read as certainty. */
export const smoothedRate = (s: GroupStats) => (s.hits + 1) / (s.n + 2);

const rowText = (key: EvidenceRow['key'], label: string, s: GroupStats) => {
  if (key === 'area') return `You’ve been right ${p(s.hitRate)} of the time, feeling ${Math.round(s.avgConfidence)}% sure on average.`;
  if (key === 'mood') return `You’ve been right ${p(s.hitRate)} of the time, and ${s.good} of ${s.n} turned out well.`;
  return `When you say ${label}, you’re right ${p(s.hitRate)} of the time.`;
};

export const realityCheck = (ds: Decision[], draft: Draft): RealityCheck => {
  const r = resolved(ds);
  const conf = draft.confidence;
  const bucket = bucketOf(conf);

  const candidates: { key: EvidenceRow['key']; label: string; items: Decision[] }[] = [];
  if (draft.area) candidates.push({ key: 'area', label: `In ${areaLabel(draft.area)}`, items: r.filter((d) => d.area === draft.area) });
  if (draft.mood) candidates.push({ key: 'mood', label: `When ${moodLabel(draft.mood).toLowerCase()}`, items: r.filter((d) => d.mood === draft.mood) });
  candidates.push({ key: 'bucket', label: `At ${bucket.label} sure`, items: r.filter((d) => bucketOf(d.confidence).id === bucket.id) });

  const rows: EvidenceRow[] = candidates.map(({ key, label, items }) => {
    const stats = groupStats(items);
    return {
      key,
      label,
      stats,
      enough: stats.n >= MIN_N,
      text: rowText(key, bucket.label, stats),
      gapToDraft: conf - stats.hitRate * 100,
    };
  });

  if (r.length === 0) {
    return {
      status: 'none',
      direction: null,
      kicker: 'No track record yet',
      headline: 'After a few outcomes, this panel will tell you how far to trust that number.',
      secondary: null,
      rows,
      suggestion: null,
    };
  }

  const usable = rows.filter((x) => x.enough);
  if (usable.length === 0) {
    return {
      status: 'thin',
      direction: null,
      kicker: 'Not enough history yet',
      headline: `Record ${MIN_N} outcomes for decisions like this and you’ll see how your ${conf}% usually holds up.`,
      secondary: null,
      rows,
      suggestion: null,
    };
  }

  // One group drives both the headline and the suggestion, so they can never
  // disagree: the most specific one with enough history (area + mood, then
  // area, then mood, then confidence level).
  const areaMoodItems = draft.area && draft.mood ? r.filter((d) => d.area === draft.area && d.mood === draft.mood) : [];
  const areaMood = groupStats(areaMoodItems);
  type Lead = { key: EvidenceRow['key'] | 'areaMood'; stats: GroupStats };
  const leads: Lead[] = [
    { key: 'areaMood', stats: areaMood },
    ...(['area', 'mood', 'bucket'] as const).flatMap((k) => usable.filter((x) => x.key === k).map((x) => ({ key: k, stats: x.stats }))),
  ];
  const lead = leads.find((x) => x.stats.n >= MIN_N)!;
  const leadGap = conf - lead.stats.hitRate * 100;
  const dir = direction(leadGap);
  const place = lead.key === 'areaMood' ? `on ${areaLabel(draft.area!)} decisions made while ${moodLabel(draft.mood!).toLowerCase()}` : where(lead.key, draft, bucket.label);
  const evidence = `${cap(place)}, you’ve been right ${p(lead.stats.hitRate)} of the time (${lead.stats.n} decisions).`;
  // At 50% there is no lower number to suggest: the expected outcome itself is the problem.
  const coinFlip = dir === 'over' && conf <= 50;
  const headline = coinFlip
    ? `Even 50% may be generous. ${evidence}`
    : dir === 'over'
      ? `${conf}% looks high. ${evidence}`
      : dir === 'under'
        ? `You may be underselling this. ${evidence}`
        : `${conf}% fits your record. ${evidence}`;
  const kicker = coinFlip
    ? 'Closer to a coin flip'
    : dir === 'over'
      ? 'Careful: likely overconfident'
      : dir === 'under'
        ? 'Likely underconfident'
        : 'About right';

  // Second line: the area or mood signal that most disagrees with the number
  // (generic confidence buckets make confusing second lines, so they're skipped).
  // When the headline is already about area + mood, the area on its own is
  // the most natural follow-up ("and on Money decisions in general…").
  const candidates2 = usable
    .filter((x) => (x.key === 'area' || x.key === 'mood') && x.key !== lead.key && direction(x.gapToDraft) !== 'even')
    .sort((a, b) => Math.abs(b.gapToDraft) - Math.abs(a.gapToDraft));
  const other = (lead.key === 'areaMood' && candidates2.find((x) => x.key === 'area')) || candidates2[0];
  const secondary = other
    ? `${direction(other.gapToDraft) === dir ? 'And' : 'But'} ${where(other.key, draft, bucket.label)}${lead.key === 'areaMood' ? ' in general' : ''}, it’s ${p(other.stats.hitRate)}.`
    : null;

  // Suggestion: only when the number is off. Start from the smoothed rate
  // (small samples pulled toward 50%), but stay within 10 points of what
  // actually happened, so taking the suggestion always lands on "fits".
  let suggestion: RealityCheck['suggestion'] = null;
  // A bucket-based number would move you into a different bucket, so only
  // area and mood history can produce a suggestion.
  if (dir !== 'even' && !coinFlip && lead.key !== 'bucket') {
    const raw = lead.stats.hitRate * 100;
    const smooth = smoothedRate(lead.stats) * 100;
    const value = clamp(round5(raw + clamp(smooth - raw, -10, 10)), 50, 100);
    if (value !== conf) {
      const basis =
        lead.key === 'areaMood'
          ? `your ${lead.stats.n} ${areaLabel(draft.area!)} decisions made while ${moodLabel(draft.mood!).toLowerCase()}`
          : lead.key === 'area'
            ? `your ${lead.stats.n} ${areaLabel(draft.area!)} decisions`
            : `your ${lead.stats.n} decisions made while ${moodLabel(draft.mood!).toLowerCase()}`;
      suggestion = { value, basis, n: lead.stats.n, coinFlip: value === 50 && direction(50 - raw) === 'over' };
    }
  }

  return { status: 'ok', direction: dir, kicker, headline, secondary, rows, suggestion };
};

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const where = (key: EvidenceRow['key'], draft: Draft, bucketLabel: string) =>
  key === 'area'
    ? `on ${areaLabel(draft.area!)} decisions`
    : key === 'mood'
      ? `when you’re ${moodLabel(draft.mood!).toLowerCase()}`
      : `when you say ${bucketLabel}`;

// ── Insights ────────────────────────────────────────────────────────────

export interface Summary {
  resolvedCount: number;
  openCount: number;
  overall: GroupStats;
  /** The one-sentence headline: how sure you feel vs how often you're right. */
  headline: { basis: 'high' | 'overall'; felt: string; real: number; n: number; direction: Direction } | null;
}

export const summarize = (ds: Decision[]): Summary => {
  const r = resolved(ds);
  const overall = groupStats(r);
  const high = groupStats(r.filter((d) => d.confidence >= 80));
  let headline: Summary['headline'] = null;
  if (high.n >= MIN_N) {
    headline = { basis: 'high', felt: '80%+ sure', real: high.hitRate, n: high.n, direction: direction(high.gap) };
  } else if (overall.n >= MIN_N) {
    headline = {
      basis: 'overall',
      felt: `${Math.round(overall.avgConfidence)}% sure`,
      real: overall.hitRate,
      n: overall.n,
      direction: direction(overall.gap),
    };
  }
  return { resolvedCount: r.length, openCount: ds.length - r.length, overall, headline };
};

export const areaGaps = (ds: Decision[]) =>
  AREAS.map((a) => ({ area: a.id, label: a.label, stats: groupStats(ds.filter((d) => d.area === a.id)) }))
    .filter((x) => x.stats.n > 0)
    .map((x) => ({ ...x, enough: x.stats.n >= MIN_N }));

export const moodPatterns = (ds: Decision[]) => {
  const rows = MOODS.map((m) => ({ mood: m.id, label: m.label, stats: groupStats(ds.filter((d) => d.mood === m.id)) }))
    .filter((x) => x.stats.n > 0)
    .map((x) => ({ ...x, enough: x.stats.n >= MIN_N }));
  const ranked = rows
    .filter((x) => x.enough)
    .sort((a, b) => b.stats.goodRate - a.stats.goodRate || b.stats.hitRate - a.stats.hitRate);
  // Only name a best and a riskiest mood when they genuinely differ.
  const top = ranked[0];
  const bottom = ranked[ranked.length - 1];
  const distinct = ranked.length >= 2 && top.stats.goodRate - bottom.stats.goodRate >= 0.15;
  const best = distinct && top.stats.goodRate >= 0.5 ? top.mood : null;
  const worst = distinct && bottom.stats.goodRate < 0.5 ? bottom.mood : null;
  return { rows, best, worst };
};

export interface BlindSpot {
  id: string;
  tone: 'over' | 'under' | 'good' | 'bad';
  kicker: string;
  title: string;
  body: string;
  foot: string;
  filter: { area?: Area; mood?: Mood };
}

export const blindSpots = (ds: Decision[]): BlindSpot[] => {
  const areas = areaGaps(ds).filter((x) => x.enough && direction(x.stats.gap) !== 'even');
  const over = areas.filter((x) => x.stats.gap > 0).sort((a, b) => b.stats.gap - a.stats.gap);
  const under = areas.filter((x) => x.stats.gap < 0).sort((a, b) => a.stats.gap - b.stats.gap);

  const areaCard = (x: (typeof areas)[number]): BlindSpot => {
    const isOver = x.stats.gap > 0;
    return {
      id: `area-${x.area}`,
      tone: isOver ? 'over' : 'under',
      kicker: isOver ? 'Overconfident' : 'Underconfident',
      title: `${x.label} decisions`,
      body: `You feel ${Math.round(x.stats.avgConfidence)}% sure on average. You’re right ${p(x.stats.hitRate)} of the time.`,
      foot: `${x.stats.n} decisions`,
      filter: { area: x.area },
    };
  };

  // Lead with the biggest miss in each direction, then fill with the next largest.
  const picked: typeof areas = [];
  if (over[0]) picked.push(over[0]);
  if (under[0]) picked.push(under[0]);
  for (const x of [...areas].sort((a, b) => Math.abs(b.stats.gap) - Math.abs(a.stats.gap))) {
    if (picked.length >= 2) break;
    if (!picked.includes(x)) picked.push(x);
  }
  const cards = picked.map(areaCard);

  const moods = moodPatterns(ds);
  const moodRow = (m: Mood | null) => moods.rows.find((x) => x.mood === m);
  const worst = moodRow(moods.worst);
  const best = moodRow(moods.best);
  if (worst) {
    cards.push({
      id: `mood-${worst.mood}`,
      tone: 'bad',
      kicker: 'Your riskiest state',
      title: `Deciding while ${worst.label.toLowerCase()}`,
      body: `${worst.stats.good} of ${worst.stats.n} turned out well. You were right ${p(worst.stats.hitRate)} of the time.`,
      foot: `${worst.stats.n} decisions`,
      filter: { mood: worst.mood },
    });
  }
  if (best) {
    cards.push({
      id: `mood-${best.mood}`,
      tone: 'good',
      kicker: 'Your best state',
      title: `Deciding while ${best.label.toLowerCase()}`,
      body: `${best.stats.good} of ${best.stats.n} turned out well. You were right ${p(best.stats.hitRate)} of the time.`,
      foot: `${best.stats.n} decisions`,
      filter: { mood: best.mood },
    });
  }
  return cards.slice(0, 4);
};

export const dueForReview = (ds: Decision[], now: Date) =>
  ds
    .filter((d) => !d.outcome && new Date(d.reviewAt).getTime() <= now.getTime())
    .sort((a, b) => a.reviewAt.localeCompare(b.reviewAt));
