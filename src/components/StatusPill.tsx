import { dueLabel } from '../lib/format';
import type { Decision } from '../lib/types';

const VERDICT_TEXT = { yes: 'Came true', partly: 'Partly', no: 'Didn’t happen' } as const;

export function StatusPill({ decision, now }: { decision: Decision; now: Date }) {
  if (decision.outcome) {
    const v = decision.outcome.verdict;
    return (
      <span className={`pill is-${v}`}>
        <span className="pill-dot" aria-hidden="true" />
        {VERDICT_TEXT[v]}
      </span>
    );
  }
  const due = new Date(decision.reviewAt) <= now;
  return (
    <span className={`pill ${due ? 'is-due' : 'is-open'}`}>
      <span className="pill-dot" aria-hidden="true" />
      {dueLabel(decision.reviewAt, now)}
    </span>
  );
}
