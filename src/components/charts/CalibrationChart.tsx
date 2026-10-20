import { pct } from '../../lib/format';
import { calibrationBuckets, direction, MIN_N } from '../../lib/stats';
import type { Decision } from '../../lib/types';
import { ChartFrame, TableView, useTooltip } from './Tooltip';

const M = { top: 16, right: 16, bottom: 44, left: 64 };

export function CalibrationChart({ decisions }: { decisions: Decision[] }) {
  const { wrapRef, tip, markProps, width } = useTooltip();
  const W = Math.max(300, width);
  const H = Math.round(Math.min(380, Math.max(280, W * 0.7)));
  const PW = W - M.left - M.right;
  const PH = H - M.top - M.bottom;
  /** x: stated confidence 50–100%. y: actual hit rate 0–100%. */
  const xs = (conf: number) => M.left + ((conf - 50) / 50) * PW;
  const ys = (rate: number) => M.top + (1 - rate) * PH;
  const buckets = calibrationBuckets(decisions).filter((b) => b.stats.n > 0);
  const worst = [...buckets].filter((b) => b.stats.n >= MIN_N).sort((a, b) => Math.abs(b.stats.gap) - Math.abs(a.stats.gap))[0];

  return (
    <>
      <ChartFrame wrapRef={wrapRef} tip={tip}>
        <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="group" aria-label="Confidence versus how often you were right">
          {/* Zones: below the diagonal you were right less often than you felt. */}
          <path className="zone-over" d={`M${xs(50)},${ys(0.5)} L${xs(100)},${ys(1)} L${xs(100)},${ys(0)} L${xs(50)},${ys(0)} Z`} opacity={0.7} />
          <path className="zone-under" d={`M${xs(50)},${ys(0.5)} L${xs(100)},${ys(1)} L${xs(50)},${ys(1)} Z`} opacity={0.7} />

          {[0, 0.25, 0.5, 0.75, 1].map((t) => (
            <g key={t}>
              <line className="grid" x1={M.left} x2={W - M.right} y1={ys(t)} y2={ys(t)} />
              <text x={M.left - 10} y={ys(t) + 4} textAnchor="end">
                {Math.round(t * 100)}%
              </text>
            </g>
          ))}
          {[50, 60, 70, 80, 90, 100].map((c) => (
            <text key={c} x={xs(c)} y={H - M.bottom + 20} textAnchor="middle">
              {c}%
            </text>
          ))}
          <text x={M.left + PW / 2} y={H - 4} textAnchor="middle">
            How sure you said you were
          </text>
          <text x={12} y={M.top + PH / 2} textAnchor="middle" transform={`rotate(-90 12 ${M.top + PH / 2})`}>
            How often you were right
          </text>
          <line className="axis" x1={M.left} x2={W - M.right} y1={ys(0)} y2={ys(0)} />

          <line className="diag" x1={xs(50)} y1={ys(0.5)} x2={xs(100)} y2={ys(1)} />
          <text className="t-strong" x={xs(99)} y={ys(0.04)} textAnchor="end">
            Overconfident zone
          </text>
          <text className="t-strong" x={xs(72)} y={ys(1) + 18}>
            Underconfident zone
          </text>

          {buckets.map(({ bucket, stats }) => {
            const cx = xs(stats.avgConfidence);
            const cy = ys(stats.hitRate);
            const r = Math.min(16, 5 + Math.sqrt(stats.n) * 2.6);
            const dir = stats.n >= MIN_N ? direction(stats.gap) : 'even';
            return (
              <g
                key={bucket.id}
                className="mark-group"
                {...markProps(`When you said ${bucket.label}`, [
                  ['Right', pct(stats.hitRate)],
                  ['Avg. confidence', `${Math.round(stats.avgConfidence)}%`],
                  ['Decisions', String(stats.n)],
                ])}
              >
                <circle className="hit" cx={cx} cy={cy} r={Math.max(r + 6, 14)} />
                <circle className={`lift real-${dir} ring`} cx={cx} cy={cy} r={r} opacity={stats.n >= MIN_N ? 1 : 0.45} />
                <circle className="focus-ring" cx={cx} cy={cy} r={r + 4} fill="none" />
              </g>
            );
          })}

          {worst && (
            <text
              className="t-strong"
              x={xs(worst.stats.avgConfidence) + (worst.stats.avgConfidence > 85 ? -20 : 20)}
              y={ys(worst.stats.hitRate) + 4}
              textAnchor={worst.stats.avgConfidence > 85 ? 'end' : 'start'}
            >
              {pct(worst.stats.hitRate)} right at {worst.bucket.label}
            </text>
          )}
        </svg>
      </ChartFrame>
      <TableView
        head={['You said', 'Decisions', 'Avg. confidence', 'Right']}
        rows={buckets.map(({ bucket, stats }) => [bucket.label, stats.n, `${Math.round(stats.avgConfidence)}%`, pct(stats.hitRate)])}
      />
    </>
  );
}
