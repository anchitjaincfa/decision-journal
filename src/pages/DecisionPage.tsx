import { PredictionCard } from '../components/PredictionCard';
import { shortDate } from '../lib/format';
import { href } from '../lib/router';
import { useJournal } from '../lib/store';

export function DecisionPage({ id, params }: { id: string; params: URLSearchParams }) {
  const { decisions } = useJournal();
  const decision = decisions.find((d) => d.id === id);

  if (!decision) {
    return (
      <div className="container detail">
        <div className="empty">
          <h2>This decision isn’t in your journal</h2>
          <p>It may have been deleted, or the journal was reset.</p>
          <a className="btn btn-secondary" href={href.journal()}>
            Back to journal
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="container detail">
      <a className="back-link" href={href.journal()}>
        ← Journal
      </a>
      <div className="stack">
        {params.get('logged') && !decision.outcome && (
          <div className="result is-yes" role="status">
            <div className="result-kicker">
              <span className="result-icon" aria-hidden="true">
                <CheckIcon />
              </span>
              Logged.
            </div>
            <p className="result-lead">
              We’ll ask how it went on {shortDate(decision.reviewAt)}. It will show up in “Ready to review” on Insights.
            </p>
          </div>
        )}
        <PredictionCard decision={decision} />
      </div>
    </div>
  );
}

export function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M2.5 7.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
