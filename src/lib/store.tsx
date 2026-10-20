import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { addDays } from './format';
import { loadJournal, sampleJournal, saveJournal } from './storage';
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

  const commit = useCallback((next: StoredJournal) => {
    setJournal(next);
    setStorageOk(saveJournal(next));
  }, []);

  const addDecision = useCallback(
    ({ reviewInDays, ...fields }: NewDecision) => {
      const createdAt = new Date().toISOString();
      const decision: Decision = { ...fields, id: newId(), createdAt, reviewAt: addDays(createdAt, reviewInDays) };
      commit({ ...journal, decisions: [decision, ...journal.decisions] });
      return decision;
    },
    [journal, commit],
  );

  const recordOutcome = useCallback(
    (id: string, o: Omit<Outcome, 'recordedAt'>) =>
      commit({
        ...journal,
        decisions: journal.decisions.map((d) =>
          d.id === id ? { ...d, outcome: { ...o, recordedAt: new Date().toISOString() } } : d,
        ),
      }),
    [journal, commit],
  );

  const deleteDecision = useCallback(
    (id: string) => commit({ ...journal, decisions: journal.decisions.filter((d) => d.id !== id) }),
    [journal, commit],
  );

  const startFresh = useCallback(() => commit({ version: 1, isSample: false, decisions: [] }), [commit]);
  const loadSample = useCallback(() => commit(sampleJournal()), [commit]);

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
