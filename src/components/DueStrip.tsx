import { href } from '../lib/router';
import type { Decision } from '../lib/types';
import { ArrowIcon } from './Icons';

export function DueStrip({ due }: { due: Decision[] }) {
  if (due.length === 0) return null;
  return (
    <section className="due" aria-labelledby="due-title">
      <h2 id="due-title" className="due-title" style={{ fontSize: 15 }}>
        <span className="due-badge">{due.length}</span>
        Ready to review
      </h2>
      <div className="due-items">
        {due.slice(0, 3).map((d) => (
          <a key={d.id} className="due-item" href={href.decision(d.id)}>
            <span>{d.title}</span>
            <ArrowIcon />
          </a>
        ))}
        {due.length > 3 && (
          <a className="due-item" href={href.journal({ status: 'open' })}>
            +{due.length - 3} more
          </a>
        )}
      </div>
    </section>
  );
}
