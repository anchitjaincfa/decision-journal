import { useState } from 'react';
import { href, navigate } from '../lib/router';
import { useJournal } from '../lib/store';

export function Banners() {
  const { isSample, storageOk, recovered, decisions, startFresh } = useJournal();
  const [confirming, setConfirming] = useState(false);
  const [hideRecovered, setHideRecovered] = useState(false);

  return (
    <>
      {!storageOk && (
        <div className="banner banner-warn" role="alert">
          <div className="container banner-inner">
            <p className="banner-text">
              <strong>Changes won’t be saved in this browser.</strong> Storage is blocked (private mode or strict settings). Everything still
              works for this visit.
            </p>
          </div>
        </div>
      )}
      {recovered && !hideRecovered && (
        <div className="banner" role="status">
          <div className="container banner-inner">
            <p className="banner-text">
              <strong>We couldn’t read your saved journal</strong>, so the sample journal was loaded instead.
            </p>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setHideRecovered(true)}>
              Dismiss
            </button>
          </div>
        </div>
      )}
      {isSample && (
        <div className="banner" role="region" aria-label="Sample journal">
          <div className="container banner-inner">
            {confirming ? (
              <>
                <p className="banner-text">
                  <strong>Start your own journal?</strong> This clears the {decisions.length} sample entries. You can reload them from the footer
                  any time.
                </p>
                <div className="banner-actions">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      startFresh();
                      setConfirming(false);
                      navigate(href.insights());
                    }}
                  >
                    Clear and start
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirming(false)}>
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="banner-text">
                  <strong>You’re exploring a sample journal.</strong> Maya’s {decisions.length} decisions show how it works.
                </p>
                <div className="banner-actions">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setConfirming(true)}>
                    Start my own journal
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
