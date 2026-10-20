import { href, type Route } from '../lib/router';
import { BrandMark } from './BrandMark';
import { PlusIcon } from './Icons';

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
