import { TopBar } from './components/TopBar';
import { useRoute } from './lib/router';
import { DecisionPage } from './pages/DecisionPage';
import { InsightsPage } from './pages/InsightsPage';
import { JournalPage } from './pages/JournalPage';
import { NewDecisionPage } from './pages/NewDecisionPage';

export default function App() {
  const route = useRoute();
  return (
    <div className="app">
      <TopBar route={route} />
      <main className="main" id="main">
        {route.page === 'insights' && <InsightsPage />}
        {route.page === 'journal' && <JournalPage params={route.params} />}
        {route.page === 'new' && <NewDecisionPage />}
        {route.page === 'decision' && <DecisionPage key={route.id} id={route.id} />}
      </main>
    </div>
  );
}
