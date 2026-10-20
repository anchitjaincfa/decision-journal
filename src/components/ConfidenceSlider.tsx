export function ConfidenceSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const fill = `${((value - 50) / 50) * 100}%`;
  return (
    <div className="field">
      <label className="label" htmlFor="confidence">
        How sure are you that it’ll happen?
      </label>
      <div className="confidence">
        <div>
          <input
            id="confidence"
            className="range"
            type="range"
            min={50}
            max={100}
            step={5}
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            style={{ ['--fill' as string]: fill }}
            aria-describedby="confidence-hint"
            aria-valuetext={`${value}% sure`}
          />
          <div className="range-scale" aria-hidden="true">
            <span>50% · coin flip</span>
            <span>75%</span>
            <span>100% · certain</span>
          </div>
        </div>
        <output className="confidence-value" htmlFor="confidence" aria-live="off">
          {value}%
        </output>
      </div>
      <p className="hint" id="confidence-hint">
        Below 50% means you expect something else to happen. Write that down instead.
      </p>
    </div>
  );
}
