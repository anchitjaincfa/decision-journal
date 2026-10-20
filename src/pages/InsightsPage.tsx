import { BlindSpotCards } from '../components/BlindSpotCards';
import { AreaGapChart } from '../components/charts/AreaGapChart';
import { CalibrationChart } from '../components/charts/CalibrationChart';
import { MoodPatterns } from '../components/charts/MoodPatterns';
import { DueStrip } from '../components/DueStrip';
import { StatTiles } from '../components/StatTiles';
import { pct, plural } from '../lib/format';
import { href } from '../lib/router';
import { MIN_N, blindSpots, dueForReview, summarize } from '../lib/stats';
import { useJournal } from '../lib/store';

export function InsightsPage() {
  const { decisions, isSample } = useJournal();
  const now = new Date();
  const summary = summarize(decisions);
  const due = dueForReview(decisions, now);

  if (summary.resolvedCount < MIN_N) {
    return (
      <div className="container">
        <DueStrip due={due} />
        <div className="empty" style={{ marginTop: due.length ? 24 : 0 }}>
          <div className="progress" aria-hidden="true">
            {Array.from({ length: MIN_N }, (_, i) => (
              <span key={i} className={i < summary.resolvedCount ? 'is-done' : ''} />
            ))}
          </div>
          <h2>Your insights appear after you record {MIN_N} outcomes</h2>
          <p>
            {summary.resolvedCount} of {MIN_N} so far.{' '}
            {decisions.length === 0
              ? 'Start by logging a decision you’re about to make: what you expect, how sure you are, and how you feel.'
              : 'Come back when your decisions play out and record what actually happened.'}
          </p>
          <a className="btn btn-primary" href={href.new()}>
            Log a decision
          </a>
        </div>
        <HowItWorks />
      </div>
    );
  }

  const h = summary.headline!;
  const spots = blindSpots(decisions);

  return (
    <div className="container">
      <section className="hero" aria-labelledby="hero-line">
        <p className="hero-eyebrow">
          {isSample ? 'Sample journal (Maya)' : 'Your judgment'} · {plural(summary.resolvedCount, 'recorded outcome')}
        </p>
        <h1 id="hero-line" className={`hero-line is-${h.direction}`}>
          When you feel <span className="felt">{h.felt}</span>, you’re right{' '}
          <span className="real">{pct(h.real)}</span> of the time.
        </h1>
        <p className="hero-sub">
          {h.direction === 'over'
            ? `Across ${h.n} high-confidence calls, feeling sure hasn’t meant being right. Here’s where the gap comes from.`
            : h.direction === 'under'
              ? `Across ${h.n} calls, your gut has been better than you give it credit for.`
              : `Across ${h.n} calls, your confidence has matched reality well.`}
        </p>
      </section>

      <StatTiles summary={summary} />
      <DueStrip due={due} />

      <section className="section" aria-labelledby="spots-title">
        <div className="section-head">
          <h2 id="spots-title" className="section-title">
            Blind spots
          </h2>
          <span className="section-note">Only groups with {MIN_N}+ outcomes</span>
        </div>
        {spots.length > 0 ? (
          <BlindSpotCards spots={spots} />
        ) : (
          <p className="thin">No clear blind spots yet. Every area is within 15 points of reality, or still needs more outcomes.</p>
        )}
      </section>

      <section className="section" aria-labelledby="evidence-title">
        <div className="section-head">
          <h2 id="evidence-title" className="section-title">
            The evidence
          </h2>
          <span className="section-note">Hover or tab through any mark for details</span>
        </div>
        <div className="charts">
          <div className="chart-card">
            <div className="chart-head">
              <div>
                <h3 className="card-title">Confidence vs. reality</h3>
                <p className="chart-caption">
                  Each dot is a confidence level. The dashed line is perfect calibration; dots below it mean you were right less often than you felt.
                </p>
              </div>
            </div>
            <CalibrationChart decisions={decisions} />
          </div>
          <div className="chart-card">
            <div className="chart-head">
              <div>
                <h3 className="card-title">Expected vs. actual, by area</h3>
                <p className="chart-caption">The gap between how sure you felt and how often it came true.</p>
              </div>
              <div className="legend">
                <span className="legend-item">
                  <span className="key-felt" aria-hidden="true" /> Felt sure
                </span>
                <span className="legend-item">
                  <span className="key-real" aria-hidden="true" /> Came true
                </span>
              </div>
            </div>
            <AreaGapChart decisions={decisions} />
          </div>
          <div className="chart-card is-wide">
            <div className="chart-head">
              <div>
                <h3 className="card-title">Mood patterns</h3>
                <p className="chart-caption">How decisions went, depending on the mood you made them in. Best at the top.</p>
              </div>
            </div>
            <MoodPatterns decisions={decisions} />
          </div>
        </div>
      </section>

      <HowItWorks />
    </div>
  );
}

function HowItWorks() {
  return (
    <section className="how" aria-label="How Decision Journal works">
      <div className="how-step">
        <b>1. Predict</b>
        <p>Before deciding, write what you expect, how sure you are, and how you feel. The Reality check shows your record.</p>
      </div>
      <div className="how-step">
        <b>2. Record</b>
        <p>When it plays out, write what actually happened. Your logged prediction can’t be edited.</p>
      </div>
      <div className="how-step">
        <b>3. Recalibrate</b>
        <p>See where “90% sure” really means 50%, and which moods lead you astray. Everything stays in this browser.</p>
      </div>
    </section>
  );
}
