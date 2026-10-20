import { pct } from '../lib/format';
import { href } from '../lib/router';
import type { GroupStats } from '../lib/stats';
import type { Verdict } from '../lib/types';
import { CheckIcon, CrossIcon, HalfIcon } from './Icons';

export interface Change {
  label: string;
  before: GroupStats;
  after: GroupStats;
}

const COPY: Record<Verdict, { title: string; lead: (c: number) => string }> = {
  yes: { title: 'Called it.', lead: (c) => `You were ${c}% sure, and it happened.` },
  partly: { title: 'Partly right.', lead: (c) => `You were ${c}% sure. It half happened, which counts as half a hit.` },
  no: {
    title: 'Missed it.',
    lead: (c) => `You were ${c}% sure, and it didn’t happen. This is exactly the data that sharpens your next call.`,
  },
};

export function ResultCard({ verdict, confidence, changes }: { verdict: Verdict; confidence: number; changes: Change[] }) {
  const copy = COPY[verdict];
  return (
    <section className={`result is-${verdict}`} role="status" aria-live="polite">
      <div className="result-kicker">
        <span className="result-icon" aria-hidden="true">
          {verdict === 'yes' ? <CheckIcon /> : verdict === 'no' ? <CrossIcon /> : <HalfIcon />}
        </span>
        {copy.title}
      </div>
      <p className="result-lead">{copy.lead(confidence)}</p>
      <div className="deltas">
        {changes.map((c) => (
          <div className="delta" key={c.label}>
            <div className="delta-label">{c.label}</div>
            <div className="delta-value">
              {c.before.n > 0 ? (
                <>
                  <span className="from">{pct(c.before.hitRate)}</span>
                  <span className="arrow" aria-label="to">
                    →
                  </span>
                </>
              ) : null}
              <span>{pct(c.after.hitRate)}</span>
            </div>
            <div className="delta-note">
              right, across {c.after.n} {c.after.n === 1 ? 'decision' : 'decisions'}
            </div>
          </div>
        ))}
      </div>
      <div className="form-actions" style={{ marginTop: 20 }}>
        <a className="btn btn-primary" href={href.insights()}>
          See your insights
        </a>
        <a className="btn btn-ghost" href={href.journal()}>
          Back to journal
        </a>
      </div>
    </section>
  );
}
