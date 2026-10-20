export type Area = 'money' | 'career' | 'health' | 'relationships' | 'home' | 'other';
export type Mood = 'calm' | 'confident' | 'excited' | 'anxious' | 'rushed' | 'tired';
export type Verdict = 'yes' | 'partly' | 'no';
export type Result = 'good' | 'mixed' | 'bad';

export interface Outcome {
  actual: string;
  verdict: Verdict;
  result: Result;
  recordedAt: string;
}

export interface Decision {
  id: string;
  title: string;
  expected: string;
  why?: string;
  area: Area;
  mood: Mood;
  /** 50–100, step 5: how likely the learner felt the expected outcome was. */
  confidence: number;
  createdAt: string;
  reviewAt: string;
  outcome?: Outcome;
}

export interface StoredJournal {
  version: 1;
  isSample: boolean;
  decisions: Decision[];
}

export const AREAS: { id: Area; label: string }[] = [
  { id: 'money', label: 'Money' },
  { id: 'career', label: 'Career' },
  { id: 'health', label: 'Health' },
  { id: 'relationships', label: 'Relationships' },
  { id: 'home', label: 'Home' },
  { id: 'other', label: 'Other' },
];

export const MOODS: { id: Mood; label: string }[] = [
  { id: 'calm', label: 'Calm' },
  { id: 'confident', label: 'Confident' },
  { id: 'excited', label: 'Excited' },
  { id: 'anxious', label: 'Anxious' },
  { id: 'rushed', label: 'Rushed' },
  { id: 'tired', label: 'Tired' },
];

export const VERDICTS: { id: Verdict; label: string }[] = [
  { id: 'yes', label: 'Yes' },
  { id: 'partly', label: 'Partly' },
  { id: 'no', label: 'No' },
];

export const RESULTS: { id: Result; label: string }[] = [
  { id: 'good', label: 'Good' },
  { id: 'mixed', label: 'Mixed' },
  { id: 'bad', label: 'Bad' },
];

export const REVIEW_INTERVALS: { days: number; label: string }[] = [
  { days: 7, label: '1 week' },
  { days: 30, label: '1 month' },
  { days: 90, label: '3 months' },
];

export const areaLabel = (a: Area) => AREAS.find((x) => x.id === a)?.label ?? a;
export const moodLabel = (m: Mood) => MOODS.find((x) => x.id === m)?.label ?? m;
export const isArea = (v: unknown): v is Area => AREAS.some((x) => x.id === v);
export const isMood = (v: unknown): v is Mood => MOODS.some((x) => x.id === v);
