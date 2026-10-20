import { useState, type FormEvent } from 'react';
import { RESULTS, VERDICTS, type Decision, type Result, type Verdict } from '../lib/types';
import { ChoiceChips } from './ChoiceChips';

type Errors = Partial<Record<'actual' | 'verdict' | 'result', string>>;

export function OutcomeForm({
  decision,
  onSave,
}: {
  decision: Decision;
  onSave: (o: { actual: string; verdict: Verdict; result: Result }) => void;
}) {
  const [actual, setActual] = useState('');
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [errors, setErrors] = useState<Errors>({});

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!actual.trim()) next.actual = 'Describe what actually happened, even briefly.';
    if (!verdict) next.verdict = 'Did what you expected happen?';
    if (!result) next.result = 'How did it turn out for you?';
    setErrors(next);
    if (Object.keys(next).length > 0) {
      if (next.actual) setTimeout(() => document.getElementById('actual')?.focus(), 0);
      return;
    }
    onSave({ actual: actual.trim(), verdict: verdict!, result: result! });
  };

  return (
    <form className="card" onSubmit={submit} noValidate aria-labelledby="outcome-title">
      <h2 id="outcome-title" className="section-title">
        What actually happened?
      </h2>
      <p className="card-sub" style={{ marginBottom: 20 }}>
        Be as honest as you were when you logged it. You expected: “{decision.expected}”
      </p>

      <div className={`field${errors.actual ? ' has-error' : ''}`}>
        <label className="label" htmlFor="actual">
          In a sentence or two
        </label>
        <textarea
          id="actual"
          className="textarea"
          value={actual}
          maxLength={400}
          placeholder="What happened, and anything future you should know."
          onChange={(e) => {
            setActual(e.target.value);
            if (errors.actual) setErrors((x) => ({ ...x, actual: undefined }));
          }}
          aria-invalid={Boolean(errors.actual)}
          aria-describedby={errors.actual ? 'actual-error' : undefined}
        />
        {errors.actual && (
          <p className="error" id="actual-error">
            {errors.actual}
          </p>
        )}
      </div>

      <div style={{ height: 24 }} />
      <ChoiceChips
        name="verdict"
        legend="Did what you expected happen?"
        options={VERDICTS}
        value={verdict}
        onChange={(v) => {
          setVerdict(v);
          if (errors.verdict) setErrors((x) => ({ ...x, verdict: undefined }));
        }}
        error={errors.verdict}
        hint="Partly counts as half right."
      />
      <div style={{ height: 24 }} />
      <ChoiceChips
        name="result"
        legend="How did it turn out for you?"
        options={RESULTS}
        value={result}
        onChange={(v) => {
          setResult(v);
          if (errors.result) setErrors((x) => ({ ...x, result: undefined }));
        }}
        error={errors.result}
        hint="Separate from being right: a prediction can miss and still work out fine."
      />

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">
          Record outcome
        </button>
      </div>
    </form>
  );
}
