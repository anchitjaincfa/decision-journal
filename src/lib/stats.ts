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
    /** True when the record says the expected outcome is a coin flip or worse. */
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

  // Headline: the area you're deciding in leads (that's how people think about
  // their own judgment), then mood, then confidence level. The strongest other
  // signal that disagrees with your number becomes a second line.
  const lead = usable.find((x) => x.key === 'area') ?? usable.find((x) => x.key === 'mood') ?? usable[0];
  const dir = direction(lead.gapToDraft);
  const sentence = (row: EvidenceRow) => `${cap(where(row.key, draft, bucket.label))}, you’ve been right ${p(row.stats.hitRate)} of the time.`;
  const headline =
    dir === 'over'
      ? `${conf}% looks high. ${sentence(lead)}`
      : dir === 'under'
        ? `You may be underselling this. ${sentence(lead)}`
        : `${conf}% fits your record. ${sentence(lead)}`;
  const kicker = dir === 'over' ? 'Careful: likely overconfident' : dir === 'under' ? 'Likely underconfident' : 'About right';
  // The mood the person chose is a more meaningful second signal than a
  // generic confidence bucket, so it wins whenever it disagrees.
  const others = usable.filter((x) => x !== lead && direction(x.gapToDraft) !== 'even');
  const other =
    others.find((x) => x.key === 'mood') ??
    others.sort((a, b) => Math.abs(b.gapToDraft) - Math.abs(a.gapToDraft))[0];
  const secondary = other
    ? `${direction(other.gapToDraft) === dir ? 'And' : 'But'} ${where(other.key, draft, bucket.label)}, it’s ${p(other.stats.hitRate)}.`
    : null;

  // Suggestion: the most specific group with enough history.
  const areaMood = draft.area && draft.mood ? r.filter((d) => d.area === draft.area && d.mood === draft.mood) : [];
  const options: { items: Decision[]; basis: (n: number) => string }[] = [
    {
      items: areaMood,
      basis: (n) => `your ${n} ${areaLabel(draft.area ?? 'other')} decisions made while ${moodLabel(draft.mood ?? 'calm').toLowerCase()}`,
    },
    { items: draft.area ? r.filter((d) => d.area === draft.area) : [], basis: (n) => `your ${n} ${areaLabel(draft.area ?? 'other')} decisions` },
    { items: r.filter((d) => bucketOf(d.confidence).id === bucket.id), basis: (n) => `your ${n} decisions at ${bucket.label} sure` },
  ];
  const pick = options.find((o) => o.items.length >= MIN_N);
  let suggestion: RealityCheck['suggestion'] = null;
  if (pick) {
    const s = groupStats(pick.items);
    const raw = smoothedRate(s) * 100;
    suggestion = { value: clamp(round5(raw), 50, 100), basis: pick.basis(s.n), n: s.n, coinFlip: raw < 50 };
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
  headline: { felt: string; real: number; n: number; direction: Direction } | null;
}

export const summarize = (ds: Decision[]): Summary => {
  const r = resolved(ds);
  const overall = groupStats(r);
  const high = groupStats(r.filter((d) => d.confidence >= 80));
  let headline: Summary['headline'] = null;
  if (high.n >= MIN_N) {
    headline = { felt: '80%+ sure', real: high.hitRate, n: high.n, direction: direction(high.gap) };
  } else if (overall.n >= MIN_N) {
    headline = {
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
  const best = ranked.length >= 2 ? ranked[0].mood : null;
  const worst = ranked.length >= 2 ? ranked[ranked.length - 1].mood : null;
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
