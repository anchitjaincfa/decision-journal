/** The mark: a hollow ring (what you felt) and a solid dot (what happened). */
export function BrandMark({ className = 'brand-mark' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 26 26" aria-hidden="true">
      <circle cx="11" cy="13" r="8" fill="none" stroke="currentColor" strokeWidth="2.25" />
      <circle cx="18.5" cy="13" r="4.5" fill="var(--over)" />
    </svg>
  );
}
