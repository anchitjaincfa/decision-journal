import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { PlusIcon } from './components/Icons';
import { Banners } from './components/SampleBanner';
import { TopBar } from './components/TopBar';
import { href, useRoute } from './lib/router';
import { DecisionPage } from './pages/DecisionPage';
import { InsightsPage } from './pages/InsightsPage';
import { JournalPage } from './pages/JournalPage';
import { NewDecisionPage } from './pages/NewDecisionPage';

export default function App() {
  const route = useRoute();
  return (
    <div className="app">
      {/* Focus moves without touching the hash, which the router owns. */}
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById('main')?.focus();
        }}
      >
        Skip to content
      </a>
      <TopBar route={route} />
      <Banners />
      <main className="main" id="main" tabIndex={-1}>
        <ErrorBoundary key={route.page}>
          {route.page === 'insights' && <InsightsPage />}
          {route.page === 'journal' && <JournalPage params={route.params} />}
          {route.page === 'new' && <NewDecisionPage />}
          {route.page === 'decision' && <DecisionPage key={route.id} id={route.id} params={route.params} />}
        </ErrorBoundary>
      </main>
      <Footer />
      {route.page !== 'new' && (
        <div className="mobile-cta">
          <a className="btn btn-primary" href={href.new()}>
            <PlusIcon /> New decision
          </a>
        </div>
      )}
    </div>
  );
}
