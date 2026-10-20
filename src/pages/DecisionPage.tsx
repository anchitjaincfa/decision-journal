import { PredictionCard } from '../components/PredictionCard';
import { href } from '../lib/router';
import { useJournal } from '../lib/store';

export function DecisionPage({ id }: { id: string }) {
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
        <PredictionCard decision={decision} />
      </div>
    </div>
  );
}
