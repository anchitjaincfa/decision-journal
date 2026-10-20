import { shortDate } from '../lib/format';
import { areaLabel, moodLabel, type Decision } from '../lib/types';

/** The prediction exactly as it was logged. Read-only on purpose. */
export function PredictionCard({ decision }: { decision: Decision }) {
  return (
    <section className="card prediction" aria-labelledby="prediction-title">
      <div className="prediction-stamp">
        <span>
          <LockIcon /> Logged {shortDate(decision.createdAt)} · can’t be edited
        </span>
        <span>Check back {shortDate(decision.reviewAt)}</span>
      </div>
      <h1 id="prediction-title" className="prediction-title">
        {decision.title}
      </h1>
      <div className="prediction-grid">
        <dl className="kv">
          <dt>What you expected</dt>
          <dd>{decision.expected}</dd>
          {decision.why && (
            <>
              <dt>Why</dt>
              <dd>{decision.why}</dd>
            </>
          )}
        </dl>
        <div className="big-conf">
          <div className="value">{decision.confidence}%</div>
          <div className="label-sm">how sure you were</div>
        </div>
      </div>
      <div className="prediction-tags">
        <span className="chip">{areaLabel(decision.area)}</span>
        <span className="chip">Felt {moodLabel(decision.mood).toLowerCase()}</span>
      </div>
    </section>
  );
}

function LockIcon() {
  return (
    <svg width="11" height="12" viewBox="0 0 11 12" aria-hidden="true" style={{ marginRight: 4, verticalAlign: -1 }}>
      <rect x="1" y="5" width="9" height="6.5" rx="1.5" fill="currentColor" />
      <path d="M3 5V3.5a2.5 2.5 0 015 0V5" fill="none" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}
