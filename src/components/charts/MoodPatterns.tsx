import { pct } from '../../lib/format';
import { moodPatterns } from '../../lib/stats';
import type { Decision } from '../../lib/types';
import { ChartFrame, TableView, useTooltip } from './Tooltip';

const ROW = 46;
const BAR = 10;

/** Two bars per mood: how often you were right, and how often it turned out well. */
export function MoodPatterns({ decisions }: { decisions: Decision[] }) {
  const { wrapRef, tip, markProps, width } = useTooltip(1040);
  const W = Math.max(300, width);
  const narrow = W < 560;
  const M = { top: 4, right: 48, bottom: 8, left: narrow ? 104 : 200 };
  const PW = W - M.left - M.right;
  const tagX = narrow ? 0 : 112;
  const { rows, best, worst } = moodPatterns(decisions);
  const sorted = [...rows].sort(
    (a, b) => Number(b.enough) - Number(a.enough) || b.stats.goodRate - a.stats.goodRate || b.stats.hitRate - a.stats.hitRate,
  );
  const H = M.top + sorted.length * ROW + M.bottom;

  const bar = (y: number, rate: number, cls: string) => {
    const w = Math.max(rate * PW, 0);
    // 4px rounded data end, square at the baseline.
    const r = Math.min(4, w / 2, BAR / 2);
    const d =
      w <= 0
        ? ''
        : `M${M.left},${y} h${w - r} a${r},${r} 0 0 1 ${r},${r} v${BAR - 2 * r} a${r},${r} 0 0 1 ${-r},${r} h${-(w - r)} Z`;
    return (
      <>
        {d && <path className={cls} d={d} />}
        <text x={M.left + w + 8} y={y + BAR - 1}>
          {pct(rate)}
        </text>
      </>
    );
  };

  return (
    <>
      <div className="legend" style={{ marginBottom: 12 }}>
        <span className="legend-item">
          <span style={{ width: 12, height: 8, borderRadius: 2, background: 'var(--ink)' }} aria-hidden="true" /> Expectation came true
        </span>
        <span className="legend-item">
          <span style={{ width: 12, height: 8, borderRadius: 2, background: 'var(--ink-3)', opacity: 0.55 }} aria-hidden="true" /> Turned out well
        </span>
      </div>
      <ChartFrame wrapRef={wrapRef} tip={tip}>
        <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Outcomes by mood when deciding">
          {sorted.map((row, i) => {
            const y = M.top + i * ROW + 8;
            const tag = row.mood === best ? 'Best' : row.mood === worst ? 'Riskiest' : null;
            return (
              <g
                key={row.mood}
                className="mark-group"
                opacity={row.enough ? 1 : 0.5}
                {...markProps(`Deciding while ${row.label.toLowerCase()}`, [
                  ['Came true', pct(row.stats.hitRate)],
                  ['Turned out well', `${row.stats.good} of ${row.stats.n}`],
                  ['Avg. confidence', `${Math.round(row.stats.avgConfidence)}%`],
                ])}
              >
                <rect className="hit" x={0} y={y - 6} width={W} height={ROW} />
                <text className="t-strong" x={0} y={y + 12}>
                  {row.label}
                </text>
                <text x={0} y={y + 28}>
                  {narrow && tag ? `${tag} · ` : ''}
                  {row.stats.n} {row.stats.n === 1 ? 'decision' : 'decisions'}
                  {!row.enough && !narrow && ' · not enough yet'}
                </text>
                {tag && !narrow && (
                  <g>
                    <circle cx={tagX + 4} cy={y + 8} r={4} className={tag === 'Best' ? 'st-good' : 'real-over'} />
                    <text className="t-strong" x={tagX + 14} y={y + 12}>
                      {tag}
                    </text>
                  </g>
                )}
                {bar(y, row.stats.hitRate, 'bar-hit lift')}
                {bar(y + BAR + 4, row.stats.goodRate, 'bar-good lift')}
                <rect className="focus-ring" x={2} y={y - 4} width={W - 4} height={ROW - 4} rx={8} />
              </g>
            );
          })}
        </svg>
      </ChartFrame>
      <TableView
        head={['Mood', 'Decisions', 'Came true', 'Turned out well', 'Avg. confidence']}
        rows={sorted.map((r) => [r.label, r.stats.n, pct(r.stats.hitRate), `${r.stats.good} of ${r.stats.n}`, `${Math.round(r.stats.avgConfidence)}%`])}
      />
    </>
  );
}
