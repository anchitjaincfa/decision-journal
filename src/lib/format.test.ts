import { describe, expect, it } from 'vitest';
import { addDays, dueLabel } from './format';

describe('dueLabel', () => {
  const now = new Date('2026-10-20T12:00:00Z');
  it('is not "ready" until the moment it is due', () => {
    expect(dueLabel('2026-10-20T20:00:00Z', now)).toBe('Check back tomorrow');
    expect(dueLabel('2026-10-20T11:59:00Z', now)).toBe('Ready to review');
  });
  it('rounds future days up', () => {
    expect(dueLabel('2026-10-26T13:00:00Z', now)).toBe('Check back in 7 days');
  });
});

describe('addDays', () => {
  it('adds calendar days', () => {
    expect(new Date(addDays('2026-01-01T09:00:00Z', 30)).getUTCDate()).toBe(31);
  });
});
