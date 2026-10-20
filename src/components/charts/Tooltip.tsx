import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

export interface Tip {
  x: number;
  y: number;
  title: string;
  rows: [string, string][];
}

/** One tooltip per chart. Marks call show() on hover and focus, so keyboard users get it too. */
export function useTooltip(fallbackWidth = 520) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<Tip | null>(null);
  // Charts lay out at their real pixel width so text stays 12px+ on phones
  // instead of shrinking with a scaled viewBox.
  const [width, setWidth] = useState(fallbackWidth);
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const measure = () => el.clientWidth > 0 && setWidth(Math.round(el.clientWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const show = useCallback((target: Element, title: string, rows: [string, string][]) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const a = target.getBoundingClientRect();
    const b = wrap.getBoundingClientRect();
    const x = Math.min(Math.max(a.left + a.width / 2 - b.left, 90), b.width - 90);
    setTip({ x, y: a.top - b.top, title, rows });
  }, []);

  const hide = useCallback(() => setTip(null), []);

  const markProps = (title: string, rows: [string, string][]) => ({
    tabIndex: 0,
    role: 'img' as const,
    'aria-label': `${title}: ${rows.map(([k, v]) => `${k} ${v}`).join(', ')}`,
    onPointerEnter: (e: React.PointerEvent<SVGGElement>) => show(e.currentTarget, title, rows),
    onPointerLeave: hide,
    onFocus: (e: React.FocusEvent<SVGGElement>) => show(e.currentTarget, title, rows),
    onBlur: hide,
  });

  return { wrapRef, tip, markProps, width };
}

export function ChartFrame({
  wrapRef,
  tip,
  children,
}: {
  wrapRef: React.RefObject<HTMLDivElement | null>;
  tip: Tip | null;
  children: ReactNode;
}) {
  return (
    <div className="chart-wrap" ref={wrapRef}>
      {children}
      {tip && (
        <div className="tooltip" style={{ left: tip.x, top: tip.y }} role="presentation">
          <div className="tooltip-title">{tip.title}</div>
          {tip.rows.map(([k, v]) => (
            <div className="tooltip-row" key={k}>
              <span>{k}</span>
              <strong>{v}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function TableView({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <details className="chart-table">
      <summary>Show as a table</summary>
      <table>
        <thead>
          <tr>
            {head.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((c, j) => (
                <td key={j}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
