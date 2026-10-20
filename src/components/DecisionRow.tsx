import { shortDate } from '../lib/format';
import { href } from '../lib/router';
import { areaLabel, moodLabel, type Decision } from '../lib/types';
import { StatusPill } from './StatusPill';

export function DecisionRow({ decision, now }: { decision: Decision; now: Date }) {
  return (
    <a className="row" href={href.decision(decision.id)}>
      <div style={{ minWidth: 0 }}>
        <div className="row-title">{decision.title}</div>
        <div className="row-meta">
          <span className="chip">{areaLabel(decision.area)}</span>
          <span>Felt {moodLabel(decision.mood).toLowerCase()}</span>
          <span aria-hidden="true">·</span>
          <span>{shortDate(decision.createdAt)}</span>
        </div>
      </div>
      <div className="row-conf">
        {decision.confidence}%<small>sure</small>
      </div>
      <div className="row-status">
        <StatusPill decision={decision} now={now} />
      </div>
    </a>
  );
}
