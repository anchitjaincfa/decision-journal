import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { addDays } from './format';
import { JOURNAL_KEY, loadJournal, sampleJournal, saveJournal } from './storage';
import type { Decision, Outcome, StoredJournal } from './types';

export type NewDecision = Omit<Decision, 'id' | 'createdAt' | 'reviewAt' | 'outcome'> & { reviewInDays: number };

interface JournalApi {
  decisions: Decision[];
  isSample: boolean;
  storageOk: boolean;
  recovered: boolean;
  addDecision: (d: NewDecision) => Decision;
  recordOutcome: (id: string, o: Omit<Outcome, 'recordedAt'>) => void;
  deleteDecision: (id: string) => void;
  startFresh: () => void;
  loadSample: () => void;
}

const JournalContext = createContext<JournalApi | null>(null);

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export function JournalProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(() => loadJournal());
  const [journal, setJournal] = useState<StoredJournal>(initial.journal);
  const [storageOk, setStorageOk] = useState(initial.storageOk);
  // Every write starts from the latest journal, never from a stale render.
  const latest = useRef(initial.journal);

  const commit = useCallback((update: (j: StoredJournal) => StoredJournal) => {
    const next = update(latest.current);
    latest.current = next;
    setJournal(next);
    setStorageOk(saveJournal(next));
  }, []);

  // Another tab changed the journal: pick up its version instead of overwriting it later.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== JOURNAL_KEY) return;
      const { journal: fresh } = loadJournal();
      latest.current = fresh;
      setJournal(fresh);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addDecision = useCallback(
    ({ reviewInDays, ...fields }: NewDecision) => {
      const createdAt = new Date().toISOString();
      const decision: Decision = { ...fields, id: newId(), createdAt, reviewAt: addDays(createdAt, reviewInDays) };
      commit((j) => ({ ...j, decisions: [decision, ...j.decisions] }));
      return decision;
    },
    [commit],
  );

  const recordOutcome = useCallback(
    (id: string, o: Omit<Outcome, 'recordedAt'>) =>
      commit((j) => ({
        ...j,
        decisions: j.decisions.map((d) => (d.id === id ? { ...d, outcome: { ...o, recordedAt: new Date().toISOString() } } : d)),
      })),
    [commit],
  );

  const deleteDecision = useCallback(
    (id: string) => commit((j) => ({ ...j, decisions: j.decisions.filter((d) => d.id !== id) })),
    [commit],
  );

  const startFresh = useCallback(() => commit(() => ({ version: 1, isSample: false, decisions: [] })), [commit]);
  const loadSample = useCallback(() => commit(() => sampleJournal()), [commit]);

  const api = useMemo<JournalApi>(
    () => ({
      decisions: journal.decisions,
      isSample: journal.isSample,
      storageOk,
      recovered: initial.recovered,
      addDecision,
      recordOutcome,
      deleteDecision,
      startFresh,
      loadSample,
    }),
    [journal, storageOk, initial.recovered, addDecision, recordOutcome, deleteDecision, startFresh, loadSample],
  );

  return <JournalContext.Provider value={api}>{children}</JournalContext.Provider>;
}

export const useJournal = () => {
  const ctx = useContext(JournalContext);
  if (!ctx) throw new Error('useJournal must be used inside <JournalProvider>');
  return ctx;
};
