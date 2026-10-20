const DAY = 86_400_000;

export const pct = (rate: number) => `${Math.round(rate * 100)}%`;

/** Signed gap in points, e.g. "+14 pts" / "−8 pts". */
export const pts = (gap: number) => {
  const r = Math.round(gap);
  return `${r > 0 ? '+' : r < 0 ? '−' : ''}${Math.abs(r)} pts`;
};

export const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

export const addDays = (iso: string, days: number) => new Date(new Date(iso).getTime() + days * DAY).toISOString();

export const daysBetween = (fromIso: string, toIso: string) =>
  Math.round((new Date(toIso).getTime() - new Date(fromIso).getTime()) / DAY);

/** "Due now", "Due in 12 days", "Due tomorrow". */
export const dueLabel = (reviewAt: string, now: Date) => {
  const d = daysBetween(now.toISOString(), reviewAt);
  if (d <= 0) return 'Ready to review';
  if (d === 1) return 'Check back tomorrow';
  return `Check back in ${d} days`;
};

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
