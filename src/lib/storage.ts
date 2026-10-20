import { buildSampleJournal } from './sampleData';
import { isArea, isMood, type Decision, type StoredJournal } from './types';

const KEY = 'decision-journal:v1';

export interface LoadResult {
  journal: StoredJournal;
  /** False when the browser refuses storage; the app then runs in memory. */
  storageOk: boolean;
  /** True when saved data was unreadable and the sample was restored. */
  recovered: boolean;
}

const isDecision = (d: unknown): d is Decision => {
  if (!d || typeof d !== 'object') return false;
  const x = d as Record<string, unknown>;
  return (
    typeof x.id === 'string' &&
    typeof x.title === 'string' &&
    typeof x.expected === 'string' &&
    isArea(x.area) &&
    isMood(x.mood) &&
    typeof x.confidence === 'number' &&
    typeof x.createdAt === 'string' &&
    typeof x.reviewAt === 'string'
  );
};

const parse = (raw: string): StoredJournal | null => {
  try {
    const data = JSON.parse(raw);
    if (data?.version !== 1 || !Array.isArray(data.decisions) || !data.decisions.every(isDecision)) return null;
    return { version: 1, isSample: Boolean(data.isSample), decisions: data.decisions };
  } catch {
    return null;
  }
};

export const sampleJournal = (now = new Date()): StoredJournal => ({
  version: 1,
  isSample: true,
  decisions: buildSampleJournal(now),
});

export const loadJournal = (now = new Date()): LoadResult => {
  let raw: string | null;
  try {
    raw = localStorage.getItem(KEY);
  } catch {
    return { journal: sampleJournal(now), storageOk: false, recovered: false };
  }
  if (raw === null) {
    const journal = sampleJournal(now);
    return { journal, storageOk: saveJournal(journal), recovered: false };
  }
  const parsed = parse(raw);
  if (parsed) return { journal: parsed, storageOk: true, recovered: false };
  const journal = sampleJournal(now);
  return { journal, storageOk: saveJournal(journal), recovered: true };
};

/** Returns false when the write was refused (private mode, quota, blocked storage). */
export const saveJournal = (journal: StoredJournal): boolean => {
  try {
    localStorage.setItem(KEY, JSON.stringify(journal));
    return true;
  } catch {
    return false;
  }
};
