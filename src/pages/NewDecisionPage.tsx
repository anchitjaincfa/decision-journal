import { useMemo, useRef, useState, type FormEvent } from 'react';
import { ChoiceChips } from '../components/ChoiceChips';
import { ConfidenceSlider } from '../components/ConfidenceSlider';
import { RealityCheck } from '../components/RealityCheck';
import { href, navigate } from '../lib/router';
import { realityCheck } from '../lib/stats';
import { useMedia } from '../lib/useMedia';
import { useJournal } from '../lib/store';
import { AREAS, MOODS, REVIEW_INTERVALS, type Area, type Mood } from '../lib/types';

type Errors = Partial<Record<'title' | 'expected' | 'area' | 'mood', string>>;

export function NewDecisionPage() {
  const { decisions, addDecision } = useJournal();
  const [title, setTitle] = useState('');
  const [expected, setExpected] = useState('');
  const [why, setWhy] = useState('');
  const [area, setArea] = useState<Area | null>(null);
  const [mood, setMood] = useState<Mood | null>(null);
  const [confidence, setConfidence] = useState(70);
  const [reviewInDays, setReviewInDays] = useState(30);
  const [errors, setErrors] = useState<Errors>({});
  const formRef = useRef<HTMLFormElement>(null);
  const narrow = useMedia('(max-width: 960px)');

  const rc = useMemo(() => realityCheck(decisions, { area, mood, confidence }), [decisions, area, mood, confidence]);

  const clear = (k: keyof Errors) => errors[k] && setErrors((e) => ({ ...e, [k]: undefined }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (!title.trim()) next.title = 'Give the decision a short name.';
    if (!expected.trim()) next.expected = 'Write down what you expect to happen. This is what you’ll check later.';
    if (!area) next.area = 'Pick the area this decision belongs to.';
    if (!mood) next.mood = 'Pick the mood closest to how you feel right now.';
    setErrors(next);
    if (Object.keys(next).length > 0) {
      setTimeout(() => formRef.current?.querySelector<HTMLElement>('.has-error input, .has-error textarea')?.focus(), 0);
      return;
    }
    const d = addDecision({
      title: title.trim(),
      expected: expected.trim(),
      ...(why.trim() ? { why: why.trim() } : {}),
      area: area!,
      mood: mood!,
      confidence,
      reviewInDays,
    });
    navigate(href.decision(d.id, { logged: '1' }));
  };

  const panel = <RealityCheck rc={rc} confidence={confidence} onUse={setConfidence} />;

  return (
    <div className="container">
      <div className="page-head">
        <div>
          <h1 className="page-title">New decision</h1>
          <p className="page-sub">Write it down before you know how it turns out. The Reality check updates as you go.</p>
        </div>
      </div>

      <div className="new-layout">
        <form ref={formRef} className="card new-form" onSubmit={submit} noValidate>
          <div className={`field${errors.title ? ' has-error' : ''}`}>
            <label className="label" htmlFor="title">
              The decision
            </label>
            <input
              id="title"
              className="input"
              value={title}
              maxLength={120}
              placeholder="e.g. Take the job offer from Northwind"
              onChange={(e) => {
                setTitle(e.target.value);
                clear('title');
              }}
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? 'title-error' : undefined}
            />
            {errors.title && (
              <p className="error" id="title-error">
                {errors.title}
              </p>
            )}
          </div>

          <div className={`field${errors.expected ? ' has-error' : ''}`}>
            <label className="label" htmlFor="expected">
              What do you expect to happen?
            </label>
            <textarea
              id="expected"
              className="textarea"
              value={expected}
              maxLength={400}
              placeholder="Be specific enough that future you can answer yes or no."
              onChange={(e) => {
                setExpected(e.target.value);
                clear('expected');
              }}
              aria-invalid={Boolean(errors.expected)}
              aria-describedby={errors.expected ? 'expected-error' : undefined}
            />
            {errors.expected && (
              <p className="error" id="expected-error">
                {errors.expected}
              </p>
            )}
          </div>

          <div className="field">
            <label className="label" htmlFor="why">
              Why do you think so?<span className="optional">Optional</span>
            </label>
            <textarea
              id="why"
              className="textarea"
              value={why}
              maxLength={400}
              placeholder="The reasons you'd want to remember later."
              onChange={(e) => setWhy(e.target.value)}
            />
          </div>

          <h2 className="form-group-title">How you’re deciding</h2>

          <ChoiceChips
            name="area"
            legend="Life area"
            options={AREAS}
            value={area}
            onChange={(v) => {
              setArea(v);
              clear('area');
            }}
            error={errors.area}
          />
          <div style={{ height: 24 }} />
          <ChoiceChips
            name="mood"
            legend="Mood right now"
            options={MOODS}
            value={mood}
            onChange={(v) => {
              setMood(v);
              clear('mood');
            }}
            error={errors.mood}
          />
          <div style={{ height: 24 }} />
          <ConfidenceSlider value={confidence} onChange={setConfidence} />
          {narrow && <div className="rc-slot-inline">{panel}</div>}

          <div style={{ height: 24 }} />
          <ChoiceChips
            name="review"
            legend="Check back in"
            options={REVIEW_INTERVALS.map((r) => ({ id: r.days, label: r.label }))}
            value={reviewInDays}
            onChange={setReviewInDays}
            hint="We’ll put it in “Ready to review” on that day."
          />

          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              Save prediction
            </button>
            <a className="btn btn-ghost" href={href.journal()}>
              Cancel
            </a>
            <span className="hint">Once saved, a prediction can’t be edited, so your record stays honest.</span>
          </div>
        </form>

        {!narrow && (
          <aside className="rc-slot-side rc-sticky" aria-label="Reality check">
            {panel}
          </aside>
        )}
      </div>
    </div>
  );
}
