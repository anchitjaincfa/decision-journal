import { href, type Route } from '../lib/router';
import { BrandMark } from './BrandMark';

export function TopBar({ route }: { route: Route }) {
  const current = (page: Route['page']) => (route.page === page ? 'page' : undefined);
  return (
    <header className="topbar">
      <div className="container topbar-inner">
        <a className="brand" href={href.insights()} aria-label="Decision Journal, home">
          <BrandMark />
          <span className="brand-name">Decision Journal</span>
        </a>
        <nav className="tabs" aria-label="Main">
          <a className="tab" href={href.insights()} aria-current={current('insights')}>
            Insights
          </a>
          <a className="tab" href={href.journal()} aria-current={current('journal')}>
            Journal
          </a>
        </nav>
        <div className="topbar-spacer" />
        <a className="btn btn-primary btn-new" href={href.new()} aria-current={current('new')}>
          <PlusIcon /> New decision
        </a>
      </div>
    </header>
  );
}

export function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M7 1.5v11M1.5 7h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
