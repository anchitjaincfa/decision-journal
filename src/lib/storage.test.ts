import { afterEach, describe, expect, it } from 'vitest';
import { loadJournal, saveJournal } from './storage';

const KEY = 'decision-journal:v1';

const fakeStorage = (opts: { blocked?: boolean; initial?: Record<string, string> } = {}) => {
  const data = new Map(Object.entries(opts.initial ?? {}));
  return {
    getItem: (k: string) => {
      if (opts.blocked) throw new Error('SecurityError');
      return data.get(k) ?? null;
    },
    setItem: (k: string, v: string) => {
      if (opts.blocked) throw new Error('QuotaExceededError');
      data.set(k, v);
    },
    data,
  };
};

const install = (s: ReturnType<typeof fakeStorage>) => Object.defineProperty(globalThis, 'localStorage', { value: s, configurable: true });

afterEach(() => {
  Reflect.deleteProperty(globalThis, 'localStorage');
});

describe('storage', () => {
  it('seeds and saves the sample journal on first visit', () => {
    const s = fakeStorage();
    install(s);
    const r = loadJournal();
    expect(r.journal.isSample).toBe(true);
    expect(r.journal.decisions.length).toBeGreaterThan(30);
    expect(r.storageOk).toBe(true);
    expect(s.data.has(KEY)).toBe(true);
  });

  it('keeps working in memory when storage is blocked', () => {
    install(fakeStorage({ blocked: true }));
    const r = loadJournal();
    expect(r.storageOk).toBe(false);
    expect(r.journal.decisions.length).toBeGreaterThan(0);
    expect(saveJournal(r.journal)).toBe(false);
  });

  it('recovers from unreadable data by restoring the sample', () => {
    install(fakeStorage({ initial: { [KEY]: '{"version":1,"decisions":[{"id":3}]}' } }));
    const r = loadJournal();
    expect(r.recovered).toBe(true);
    expect(r.journal.isSample).toBe(true);
  });

  it('round-trips a saved journal', () => {
    const s = fakeStorage();
    install(s);
    const first = loadJournal().journal;
    saveJournal({ ...first, isSample: false, decisions: first.decisions.slice(0, 2) });
    const again = loadJournal();
    expect(again.journal.isSample).toBe(false);
    expect(again.journal.decisions).toHaveLength(2);
    expect(again.recovered).toBe(false);
  });
});
