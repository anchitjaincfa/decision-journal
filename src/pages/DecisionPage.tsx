import { useState } from 'react';
import { CheckIcon } from '../components/Icons';
import { OutcomeForm } from '../components/OutcomeForm';
import { PredictionCard } from '../components/PredictionCard';
import { ResultCard, type Change } from '../components/ResultCard';
import { StatusPill } from '../components/StatusPill';
import { shortDate } from '../lib/format';
import { href, navigate } from '../lib/router';
import { groupStats } from '../lib/stats';
import { useJournal } from '../lib/store';
import { RESULTS, areaLabel, type Decision, type Result, type Verdict } from '../lib/types';

export function DecisionPage({ id, params }: { id: string; params: URLSearchParams }) {
  const { decisions, recordOutcome, deleteDecision } = useJournal();
  const [justRecorded, setJustRecorded] = useState<{ verdict: Verdict; changes: Change[] } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const decision = decisions.find((d) => d.id === id);
  const now = new Date();

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

  const save = (o: { actual: string; verdict: Verdict; result: Result }) => {
    // Recompute the same stats with this outcome included, so the result card
    // shows real before → after numbers.
    const after: Decision[] = decisions.map((d) =>
      d.id === decision.id ? { ...d, outcome: { ...o, recordedAt: new Date().toISOString() } } : d,
    );
    const inArea = (ds: Decision[]) => ds.filter((d) => d.area === decision.area);
    setJustRecorded({
      verdict: o.verdict,
      changes: [
        { label: `${areaLabel(decision.area)} hit rate`, before: groupStats(inArea(decisions)), after: groupStats(inArea(after)) },
        { label: 'Overall hit rate', before: groupStats(decisions), after: groupStats(after) },
      ],
    });
    recordOutcome(decision.id, o);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => document.getElementById('result-card')?.focus({ preventScroll: true }), 0);
  };

  const notDueYet = !decision.outcome && new Date(decision.reviewAt) > now;

  return (
    <div className="container detail">
      <a className="back-link" href={href.journal()}>
        ← Journal
      </a>
      <div className="stack">
        {justRecorded && <ResultCard verdict={justRecorded.verdict} confidence={decision.confidence} changes={justRecorded.changes} />}

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

        {decision.outcome ? (
          <section className="card outcome-card" aria-labelledby="outcome-heading">
            <div className="prediction-stamp">
              <h2 id="outcome-heading" className="card-title" style={{ color: 'var(--ink)' }}>
                What actually happened
              </h2>
              <span>Recorded {shortDate(decision.outcome.recordedAt)}</span>
            </div>
            <p style={{ fontSize: 16 }}>{decision.outcome.actual}</p>
            <div className="prediction-tags">
              <StatusPill decision={decision} now={now} />
              <span className="chip">
                Turned out {RESULTS.find((r) => r.id === decision.outcome!.result)?.label.toLowerCase()}
              </span>
            </div>
          </section>
        ) : (
          <>
            {notDueYet && !params.get('logged') && (
              <p className="hint">
                You planned to check back on {shortDate(decision.reviewAt)}. If you already know how it went, you can record it now.
              </p>
            )}
            <OutcomeForm decision={decision} onSave={save} />
          </>
        )}
      </div>

      <div className="danger-zone">
        {confirmDelete ? (
          <>
            <span>Delete this decision? This can’t be undone.</span>
            <button
              id="confirm-delete"
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => {
                const id = decision.id;
                navigate(href.journal());
                setTimeout(() => deleteDecision(id), 0);
              }}
            >
              Delete
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(false)}>
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            className="link"
            onClick={() => {
              setConfirmDelete(true);
              setTimeout(() => document.getElementById('confirm-delete')?.focus(), 0);
            }}
          >
            Delete decision
          </button>
        )}
      </div>
    </div>
  );
}
