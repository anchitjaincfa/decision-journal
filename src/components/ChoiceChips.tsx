interface Props<T extends string | number> {
  name: string;
  legend: string;
  options: { id: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
  error?: string;
  hint?: string;
}

/** A radio group styled as chips: keyboard and screen-reader friendly. */
export function ChoiceChips<T extends string | number>({ name, legend, options, value, onChange, error, hint }: Props<T>) {
  const errorId = error ? `${name}-error` : undefined;
  return (
    <div className={`field${error ? ' has-error' : ''}`}>
      <fieldset className="choices" aria-describedby={errorId}>
        <legend className="label" style={{ marginBottom: 8, width: '100%' }}>
          {legend}
        </legend>
        {options.map((o) => (
          <label key={String(o.id)} className="choice">
            <input type="radio" name={name} value={String(o.id)} checked={value === o.id} onChange={() => onChange(o.id)} />
            <span>{o.label}</span>
          </label>
        ))}
      </fieldset>
      {hint && <p className="hint">{hint}</p>}
      {error && (
        <p className="error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}
