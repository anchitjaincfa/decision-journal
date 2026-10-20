import { pct, pts } from '../../lib/format';
import { areaGaps, direction } from '../../lib/stats';
import type { Decision } from '../../lib/types';
import { ChartFrame, TableView, useTooltip } from './Tooltip';

const ROW = 48;

/** Dumbbell rows: hollow = how sure you felt on average, solid = how often you were right. */
export function AreaGapChart({ decisions }: { decisions: Decision[] }) {
  const { wrapRef, tip, markProps, width } = useTooltip();
  const W = Math.max(300, width);
  const M = { top: 8, right: 64, bottom: 30, left: W < 420 ? 96 : 112 };
  const PW = W - M.left - M.right;
  const xs = (pct100: number) => M.left + (pct100 / 100) * PW;
  const rows = areaGaps(decisions).sort((a, b) => b.stats.gap - a.stats.gap);
  const H = M.top + rows.length * ROW + M.bottom;

  return (
    <>
      <ChartFrame wrapRef={wrapRef} tip={tip}>
        <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Confidence versus hit rate by life area">
          {[0, 25, 50, 75, 100].map((t) => (
            <g key={t}>
              <line className="grid" x1={xs(t)} x2={xs(t)} y1={M.top} y2={H - M.bottom} />
              <text x={xs(t)} y={H - 10} textAnchor="middle">
                {t}%
              </text>
            </g>
          ))}
          {rows.map((row, i) => {
            const y = M.top + i * ROW + ROW / 2;
            const felt = row.stats.avgConfidence;
            const real = row.stats.hitRate * 100;
            const dir = row.enough ? direction(row.stats.gap) : 'even';
            return (
              <g
                key={row.area}
                className="mark-group"
                opacity={row.enough ? 1 : 0.5}
                {...markProps(`${row.label}`, [
                  ['Felt sure', `${Math.round(felt)}%`],
                  ['Right', pct(row.stats.hitRate)],
                  ['Gap', pts(row.stats.gap)],
                  ['Decisions', row.enough ? String(row.stats.n) : `${row.stats.n} (not enough yet)`],
                ])}
              >
                <rect className="hit" x={0} y={y - ROW / 2} width={W} height={ROW} />
                <text className="t-strong" x={0} y={y - 2}>
                  {row.label}
                </text>
                <text x={0} y={y + 14}>
                  {row.stats.n} {row.stats.n === 1 ? 'decision' : 'decisions'}
                </text>
                <line
                  className={`link-${dir}`}
                  x1={xs(Math.min(felt, real))}
                  x2={xs(Math.max(felt, real))}
                  y1={y}
                  y2={y}
                  strokeWidth={2}
                  strokeLinecap="round"
                />
                <circle className={`lift real-${dir} ring`} cx={xs(real)} cy={y} r={6} />
                <circle className="felt" cx={xs(felt)} cy={y} r={5.5} />
                <text className="t-strong" x={W - 4} y={y + 4} textAnchor="end">
                  {row.enough ? pts(row.stats.gap) : 'few'}
                </text>
                <rect className="focus-ring" x={2} y={y - ROW / 2 + 3} width={W - 4} height={ROW - 6} rx={8} />
              </g>
            );
          })}
        </svg>
      </ChartFrame>
      <TableView
        head={['Area', 'Decisions', 'Felt sure', 'Right', 'Gap']}
        rows={rows.map((r) => [r.label, r.stats.n, `${Math.round(r.stats.avgConfidence)}%`, pct(r.stats.hitRate), pts(r.stats.gap)])}
      />
    </>
  );
}
