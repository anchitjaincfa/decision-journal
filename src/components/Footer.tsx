import { useState } from 'react';
import { href, navigate } from '../lib/router';
import { useJournal } from '../lib/store';

const REPO = 'https://github.com/anchitjaincfa/decision-journal';

export function Footer() {
  const { isSample, loadSample } = useJournal();
  const [confirming, setConfirming] = useState(false);

  const reload = () => {
    loadSample();
    setConfirming(false);
    navigate(href.insights());
  };

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <span>Everything stays in this browser. Nothing is sent anywhere.</span>
        <span style={{ display: 'inline-flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          {confirming ? (
            <>
              <span>Replace your journal with the sample?</span>
              <button id="confirm-reload" type="button" className="link" onClick={reload}>
                Yes, replace it
              </button>
              <button type="button" className="link" onClick={() => setConfirming(false)}>
                Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              className="link"
              onClick={() => {
                if (isSample) return reload();
                setConfirming(true);
                setTimeout(() => document.getElementById('confirm-reload')?.focus(), 0);
              }}
            >
              Reload sample journal
            </button>
          )}
          <a className="link" href={REPO} target="_blank" rel="noreferrer">
            Source on GitHub
          </a>
        </span>
      </div>
    </footer>
  );
}
