import type { EvidenceRow, RealityCheck as RC } from '../lib/stats';
import { MIN_N, direction } from '../lib/stats';

interface Props {
  rc: RC;
  confidence: number;
  onUse: (value: number) => void;
}

export function RealityCheck({ rc, confidence, onUse }: Props) {
  const tone = rc.direction ?? 'none';
  const s = rc.suggestion;
  return (
    <section className={`rc is-${tone}`} aria-labelledby="rc-title">
      <div className="rc-head">
        <h2 id="rc-title" className="visually-hidden">
          Reality check
        </h2>
        <div className="rc-kicker">
          <Signal tone={tone} />
          {rc.kicker}
        </div>
        <div aria-live="polite">
          <p className="rc-headline">{rc.headline}</p>
          {rc.secondary && <p className="rc-row-text" style={{ marginTop: 6 }}>{rc.secondary}</p>}
        </div>
      </div>

      <div className="rc-rows">
        {rc.rows.map((row) => (
          <Evidence key={row.key} row={row} confidence={confidence} />
        ))}
      </div>

      <div className="rc-foot">
        {s ? (
          <>
            <div className="rc-suggest">
              <p className="rc-suggest-text">
                Your track record suggests <strong>~{s.value}%</strong>
              </p>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onUse(s.value)}
                disabled={s.value === confidence}
              >
                {s.value === confidence ? 'Using it' : `Use ${s.value}%`}
              </button>
            </div>
            <p className="rc-note">
              Based on {s.basis}.{' '}
              {s.coinFlip && 'Your record says this is closer to a coin flip. Is there an outcome you’re more sure of?'}
            </p>
          </>
        ) : (
          <p className="rc-note" style={{ marginTop: 0 }}>
            Suggestions appear once you’ve recorded {MIN_N} outcomes for similar decisions.
          </p>
        )}
        <div className="legend" style={{ marginTop: 12 }}>
          <span className="legend-item">
            <span className="key-felt" aria-hidden="true" /> How sure you feel now
          </span>
          <span className="legend-item">
            <span className="key-real" aria-hidden="true" /> How often you’ve been right
          </span>
        </div>
      </div>
    </section>
  );
}

function Evidence({ row, confidence }: { row: EvidenceRow; confidence: number }) {
  const { stats } = row;
  const dir = direction(row.gapToDraft);
  const real = Math.round(stats.hitRate * 100);
  const lo = Math.min(real, confidence);
  const hi = Math.max(real, confidence);
  return (
    <div className="rc-row">
      <div className="rc-row-head">
        <span className="rc-row-label">{row.label}</span>
        <span className="rc-row-n">{stats.n === 1 ? '1 decision' : `${stats.n} decisions`}</span>
      </div>
      {row.enough ? (
        <>
          <p className="rc-row-text">{row.text}</p>
          <div
            className="rc-meter"
            role="img"
            aria-label={`You feel ${confidence}% sure; you've been right ${real}% of the time.`}
          >
            <div className="rc-meter-track" />
            <div className="rc-meter-gap" style={{ left: `${lo}%`, width: `${hi - lo}%`, background: `var(--${dir})` }} />
            <div className="rc-meter-real" style={{ left: `${real}%`, background: `var(--${dir === 'even' ? 'ink-3' : dir})` }} />
            <div className="rc-meter-felt" style={{ left: `${confidence}%` }} />
          </div>
        </>
      ) : (
        <p className="rc-row-thin">
          {stats.n === 0 ? 'No history yet.' : `Not enough history yet (${stats.n} of ${MIN_N}).`}
        </p>
      )}
    </div>
  );
}

function Signal({ tone }: { tone: string }) {
  const color = tone === 'over' ? 'var(--over)' : tone === 'under' ? 'var(--under)' : 'var(--ink-3)';
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      {tone === 'over' ? (
        <path d="M8 1.5l7 12.5H1z" fill={color} />
      ) : tone === 'under' ? (
        <path d="M8 14.5L1 2h14z" fill={color} />
      ) : (
        <circle cx="8" cy="8" r="6" fill="none" stroke={color} strokeWidth="2" />
      )}
      {tone === 'over' && <path d="M8 6v3.5M8 11.5v.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" />}
    </svg>
  );
}
