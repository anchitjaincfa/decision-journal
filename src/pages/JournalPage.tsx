import { DecisionRow } from '../components/DecisionRow';
import { plural } from '../lib/format';
import { href, navigate } from '../lib/router';
import { useJournal } from '../lib/store';
import { AREAS, isArea, type Area, type Decision } from '../lib/types';

type Status = 'all' | 'open' | 'resolved';
const STATUSES: { id: Status; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'resolved', label: 'Resolved' },
];

const matches = (d: Decision, status: Status, area: Area | null) =>
  (status === 'all' || (status === 'open' ? !d.outcome : Boolean(d.outcome))) && (!area || d.area === area);

export function JournalPage({ params }: { params: URLSearchParams }) {
  const { decisions } = useJournal();
  const now = new Date();
  const statusParam = params.get('status');
  const status: Status = statusParam === 'open' || statusParam === 'resolved' ? statusParam : 'all';
  const areaParam = params.get('area');
  const area = isArea(areaParam) ? areaParam : null;

  const setFilter = (next: { status?: Status; area?: Area | null }) => {
    const s = next.status ?? status;
    const a = next.area === undefined ? area : next.area;
    const q: Record<string, string> = {};
    if (s !== 'all') q.status = s;
    if (a) q.area = a;
    navigate(href.journal(q));
  };

  const sorted = [...decisions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const shown = sorted.filter((d) => matches(d, status, area));

  return (
    <div className="container">
      <div className="page-head">
        <div>
          <h1 className="page-title">Journal</h1>
          <p className="page-sub">Every prediction you’ve logged, and what actually happened.</p>
        </div>
      </div>

      {decisions.length === 0 ? (
        <div className="empty">
          <h2>No decisions yet</h2>
          <p>Log the next decision you’re about to make. Write down what you expect and how sure you are before you know the answer.</p>
          <a className="btn btn-primary" href={href.new()}>
            Log your first decision
          </a>
        </div>
      ) : (
        <>
          <div className="toolbar">
            <div className="segmented" role="group" aria-label="Filter by status">
              {STATUSES.map((s) => (
                <button key={s.id} type="button" aria-pressed={status === s.id} onClick={() => setFilter({ status: s.id })}>
                  {s.label}
                </button>
              ))}
            </div>
            <label className="visually-hidden" htmlFor="area-filter">
              Filter by area
            </label>
            <select
              id="area-filter"
              className="select"
              value={area ?? ''}
              onChange={(e) => setFilter({ area: isArea(e.target.value) ? e.target.value : null })}
            >
              <option value="">All areas</option>
              {AREAS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
            <span className="count-note num">{plural(shown.length, 'decision')}</span>
          </div>

          {shown.length === 0 ? (
            <div className="empty">
              <h2>Nothing matches these filters</h2>
              <p>Try a different area or status.</p>
              <button type="button" className="btn btn-secondary" onClick={() => navigate(href.journal())}>
                Clear filters
              </button>
            </div>
          ) : (
            <div className="list">
              {shown.map((d) => (
                <DecisionRow key={d.id} decision={d} now={now} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
