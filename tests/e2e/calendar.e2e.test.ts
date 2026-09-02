/**
 * E2E tests for calendar-calculate
 *
 * These tests simulate real-world usage scenarios: scheduling recurring classes,
 * generating a work-week calendar, handling edge cases around DST changes, etc.
 * They consume the public API exactly as a downstream consumer would.
 */
import { getWeekdayDates, parseTimeString } from '../../src/index';
import type { WeekdayDatesOptions } from '../../src/types.type';

// Helpers
/** Build a local Date — avoids UTC-offset surprises in assertions. */
const local = (y: number, m: number, d: number, h = 0, min = 0, s = 0, ms = 0) =>
  new Date(y, m - 1, d, h, min, s, ms);

const fmt = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Scenario 1 — Weekly recurring class schedule (Mon, Wed, Fri at 08:30)
describe('E2E — Weekly recurring class schedule', () => {
  const classStart = local(2026, 9, 1);   // Tue Sep  1 2026
  const classEnd = local(2026, 9, 30);   // Wed Sep 30 2026
  const classDays = ['monday', 'wednesday', 'friday'] as const;
  const classTime = { time: '08:30' } satisfies WeekdayDatesOptions;

  let schedule: Date[];

  beforeAll(() => {
    schedule = getWeekdayDates(classStart, classEnd, [...classDays], classTime);
  });

  it('generates a non-empty schedule', () => {
    expect(schedule.length).toBeGreaterThan(0);
  });

  it('every session falls on Mon, Wed, or Fri', () => {
    const allowed = new Set([1, 3, 5]); // Mon, Wed, Fri
    schedule.forEach(d => expect(allowed.has(d.getDay())).toBe(true));
  });

  it('every session starts at 08:30:00.000 local time', () => {
    schedule.forEach(d => {
      expect(d.getHours()).toBe(8);
      expect(d.getMinutes()).toBe(30);
      expect(d.getSeconds()).toBe(0);
      expect(d.getMilliseconds()).toBe(0);
    });
  });

  it('schedule stays within Sep 2026', () => {
    schedule.forEach(d => {
      expect(d.getMonth()).toBe(8); // 0-indexed → September
      expect(d.getFullYear()).toBe(2026);
    });
  });

  it('first session is the first Mon/Wed/Fri on or after Sep 1', () => {
    // Sep 1 2026 is a Tuesday → first match should be Wednesday Sep 2
    expect(fmt(schedule[0])).toBe('2026-09-02');
  });

  it('last session is the last Mon/Wed/Fri on or before Sep 30', () => {
    // Sep 30 2026 is a Wednesday → last match should be Sep 30
    expect(fmt(schedule[schedule.length - 1])).toBe('2026-09-30');
  });
});

// Scenario 2 — Weekend-only events (Sat, Sun) with specific time
describe('E2E — Weekend events (Sat & Sun)', () => {
  const start = local(2026, 9, 1);
  const end = local(2026, 9, 30);
  const options = { hours: 10, minutes: 0, seconds: 0, milliseconds: 0 } satisfies WeekdayDatesOptions;

  let events: Date[];

  beforeAll(() => {
    events = getWeekdayDates(start, end, ['saturday', 'sunday'], options);
  });

  it('only Saturdays and Sundays are included', () => {
    events.forEach(d => expect([0, 6]).toContain(d.getDay())); // 0=Sun, 6=Sat
  });

  it('every event is at 10:00:00.000', () => {
    events.forEach(d => {
      expect(d.getHours()).toBe(10);
      expect(d.getMinutes()).toBe(0);
    });
  });

  it('September 2026 has 4 full weekends (8 weekend days)', () => {
    // Sep 2026: weekends are 5-6, 12-13, 19-20, 26-27 = 8 days
    expect(events).toHaveLength(8);
  });
});

// Scenario 3 — Original example from the spec (user's exact case)
describe('E2E — Original spec example', () => {
  // Use local dates to ensure weekday detection is TZ-independent
  const start = local(2026, 9, 2);
  const end = local(2026, 9, 20);

  let result: Date[];

  beforeAll(() => {
    result = getWeekdayDates(start, end, ['monday', 'friday', 'wednesday']);
  });

  it('returns exactly 8 dates', () => {
    expect(result).toHaveLength(8);
  });

  it('returns the correct calendar dates in order', () => {
    const expected = [
      '2026-09-02', // Wed
      '2026-09-04', // Fri
      '2026-09-07', // Mon
      '2026-09-09', // Wed
      '2026-09-11', // Fri
      '2026-09-14', // Mon
      '2026-09-16', // Wed
      '2026-09-18', // Fri
    ];
    expect(result.map(fmt)).toEqual(expected);
  });
});

// Scenario 4 — Multi-month semester (Sep → Dec, business days)
describe('E2E — Multi-month semester, business days only', () => {
  const semStart = local(2026, 9, 1);
  const semEnd = local(2026, 12, 18); // end before Christmas break
  const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const;

  let days: Date[];

  beforeAll(() => {
    days = getWeekdayDates(semStart, semEnd, [...weekdays], { time: '07:00' });
  });

  it('generates many working days', () => {
    expect(days.length).toBeGreaterThan(50);
  });

  it('no weekends included', () => {
    days.forEach(d => {
      expect(d.getDay()).not.toBe(0); // not Sunday
      expect(d.getDay()).not.toBe(6); // not Saturday
    });
  });

  it('all dates have time 07:00:00.000', () => {
    days.forEach(d => {
      expect(d.getHours()).toBe(7);
      expect(d.getMinutes()).toBe(0);
    });
  });

  it('spans all four months Sep–Dec', () => {
    const months = new Set(days.map(d => d.getMonth() + 1));
    expect(months.has(9)).toBe(true);
    expect(months.has(10)).toBe(true);
    expect(months.has(11)).toBe(true);
    expect(months.has(12)).toBe(true);
  });
});

// Scenario 5 — Year boundary: last week of 2025 → first week of 2026
describe('E2E — Year boundary (Dec 2025 → Jan 2026)', () => {
  const start = local(2025, 12, 29); // Mon Dec 29 2025
  const end = local(2026, 1, 4);  // Sun Jan  4 2026

  let result: Date[];

  beforeAll(() => {
    result = getWeekdayDates(start, end, ['monday', 'wednesday', 'friday'], { time: '09:00' });
  });

  it('includes dates from both 2025 and 2026', () => {
    const years = new Set(result.map(d => d.getFullYear()));
    expect(years.has(2025)).toBe(true);
    expect(years.has(2026)).toBe(true);
  });

  it('all results are Mon, Wed, or Fri', () => {
    result.forEach(d => expect([1, 3, 5]).toContain(d.getDay()));
  });

  it('all results have time 09:00:00.000', () => {
    result.forEach(d => {
      expect(d.getHours()).toBe(9);
      expect(d.getMinutes()).toBe(0);
    });
  });

  it('returns the correct dates across the boundary', () => {
    // Dec 29 Mon, Dec 31 Wed, Jan 2 Fri
    expect(result.map(fmt)).toEqual(['2025-12-29', '2025-12-31', '2026-01-02']);
  });
});

// Scenario 6 — Backward compatibility: no options (v1.x API)
describe('E2E — Backward compatibility (v1.x, no options param)', () => {
  it('works without the fourth argument', () => {
    const result = getWeekdayDates(local(2026, 9, 1), local(2026, 9, 7), ['monday']);
    expect(Array.isArray(result)).toBe(true);
  });

  it('inherits time from start when no options passed', () => {
    const start = local(2026, 9, 1, 15, 30, 45, 500);
    const result = getWeekdayDates(start, local(2026, 9, 7), ['wednesday']);
    // Sep 2 is a Wednesday
    expect(result).toHaveLength(1);
    const d = result[0];
    expect(d.getHours()).toBe(15);
    expect(d.getMinutes()).toBe(30);
    expect(d.getSeconds()).toBe(45);
    expect(d.getMilliseconds()).toBe(500);
  });
});

// Scenario 7 — parseTimeString used outside getWeekdayDates (standalone)
describe('E2E — parseTimeString standalone usage', () => {
  it('can be used to build dynamic options', () => {
    const userInput = '16:45:00';
    const { hours, minutes, seconds, milliseconds } = parseTimeString(userInput);

    const result = getWeekdayDates(
      local(2026, 9, 1), local(2026, 9, 14), ['tuesday'],
      { hours, minutes, seconds, milliseconds }
    );

    result.forEach(d => {
      expect(d.getHours()).toBe(16);
      expect(d.getMinutes()).toBe(45);
      expect(d.getSeconds()).toBe(0);
    });
  });

  it('throws a user-friendly error for clearly invalid time input', () => {
    expect(() => parseTimeString('not-a-time')).toThrow(Error);
  });
});
