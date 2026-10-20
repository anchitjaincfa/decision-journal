import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { JournalProvider } from './lib/store';
import './styles/tokens.css';
import './styles/app.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <JournalProvider>
      <App />
    </JournalProvider>
  </StrictMode>,
);
