import { pct, pts } from '../lib/format';
import { direction, type Summary } from '../lib/stats';

export function StatTiles({ summary }: { summary: Summary }) {
  const { overall, resolvedCount, openCount } = summary;
  const dir = direction(overall.gap);
  // Averages hide patterns, so a smaller overall gap still gets a nudge.
  const lean = overall.gap >= 5 ? 'over' : overall.gap <= -5 ? 'under' : 'even';
  const gapText =
    dir === 'over'
      ? 'Overconfident'
      : dir === 'under'
        ? 'Underconfident'
        : lean === 'over'
          ? 'Leaning overconfident'
          : lean === 'under'
            ? 'Leaning underconfident'
            : 'About right';
  return (
    <div className="tiles">
      <div className="tile">
        <div className="tile-label">Outcomes recorded</div>
        <div className="tile-value">{resolvedCount}</div>
        <div className="tile-note">{openCount} still open</div>
      </div>
      <div className="tile">
        <div className="tile-label">Hit rate</div>
        <div className="tile-value">{pct(overall.hitRate)}</div>
        <div className="tile-note">How often what you expected actually happened</div>
      </div>
      <div className="tile">
        <div className="tile-label">Confidence gap</div>
        <div className="tile-value">{pts(overall.gap)}</div>
        <div className={`tile-tag is-${lean}`}>
          {gapText}: you feel {Math.round(overall.avgConfidence)}% sure on average
        </div>
      </div>
    </div>
  );
}
