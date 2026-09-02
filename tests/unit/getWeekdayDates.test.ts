import { getWeekdayDates } from '../../src/index';

// Helper — create a LOCAL date at a given time so tests are TZ-independent.
// Using new Date(y,m,d,h,min,s,ms) always produces local time.

const local = (
  year: number,
  month: number, // 1-based for readability
  day: number,
  hour = 0,
  minute = 0,
  second = 0,
  ms = 0,
) => new Date(year, month - 1, day, hour, minute, second, ms);

// Convenience: extract local components from a Date for assertions
const localParts = (d: Date) => ({
  year:    d.getFullYear(),
  month:   d.getMonth() + 1, // back to 1-based
  day:     d.getDate(),
  weekday: d.getDay(),        // 0=Sun … 6=Sat
  hour:    d.getHours(),
  minute:  d.getMinutes(),
  second:  d.getSeconds(),
  ms:      d.getMilliseconds(),
});

// Map weekday name → JS getDay() number
const DAY: Record<string, number> = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
  thursday: 4, friday: 5, saturday: 6,
};

// getWeekdayDates — unit tests

describe('getWeekdayDates', () => {

  // Return type

  describe('return type', () => {
    it('always returns an array', () => {
      const result = getWeekdayDates(local(2026, 9, 1), local(2026, 9, 7), ['monday']);
      expect(Array.isArray(result)).toBe(true);
    });

    it('every element is a Date instance', () => {
      const result = getWeekdayDates(local(2026, 9, 1), local(2026, 9, 30), ['monday', 'friday']);
      result.forEach(d => expect(d).toBeInstanceOf(Date));
    });
  });

  // Empty cases

  describe('empty results', () => {
    it('returns [] when weekdays array is empty', () => {
      expect(getWeekdayDates(local(2026, 9, 1), local(2026, 9, 30), [])).toEqual([]);
    });

    it('returns [] when start > end', () => {
      expect(
        getWeekdayDates(local(2026, 9, 30), local(2026, 9, 1), ['monday'])
      ).toEqual([]);
    });

    it('returns [] when requested weekday does not appear in range', () => {
      // 2026-09-07 is a Monday — a 1-day range on Monday → no Wednesday
      const result = getWeekdayDates(local(2026, 9, 7), local(2026, 9, 7), ['wednesday']);
      expect(result).toEqual([]);
    });
  });

  // Boundary inclusion

  describe('boundary inclusion', () => {
    it('includes start date when it matches the weekday', () => {
      // 2026-09-07 is a Monday
      const result = getWeekdayDates(local(2026, 9, 7), local(2026, 9, 14), ['monday']);
      const first = localParts(result[0]);
      expect(first.day).toBe(7);
      expect(first.weekday).toBe(DAY.monday);
    });

    it('includes end date when it matches the weekday', () => {
      // 2026-09-11 is a Friday
      const result = getWeekdayDates(local(2026, 9, 7), local(2026, 9, 11), ['friday']);
      const last = localParts(result[result.length - 1]);
      expect(last.day).toBe(11);
      expect(last.weekday).toBe(DAY.friday);
    });

    it('single-day range where day matches returns exactly 1 result', () => {
      // 2026-09-07 is a Monday
      const result = getWeekdayDates(local(2026, 9, 7), local(2026, 9, 7), ['monday']);
      expect(result).toHaveLength(1);
      expect(localParts(result[0]).day).toBe(7);
    });
  });

  // Weekday filtering

  describe('weekday filtering', () => {
    it('every result falls on one of the requested weekdays', () => {
      const weekdays = ['monday', 'wednesday', 'friday'] as const;
      const result = getWeekdayDates(
        local(2026, 9, 1), local(2026, 9, 30), [...weekdays]
      );
      const allowedDays = new Set(weekdays.map(w => DAY[w]));
      result.forEach(d => {
        expect(allowedDays.has(d.getDay())).toBe(true);
      });
    });

    it('returns only the matched weekday when a single day is given', () => {
      const result = getWeekdayDates(local(2026, 9, 1), local(2026, 9, 30), ['tuesday']);
      result.forEach(d => expect(d.getDay()).toBe(DAY.tuesday));
    });

    it('supports all 7 weekdays at once and returns every day in range', () => {
      const all: ReturnType<typeof getWeekdayDates> = getWeekdayDates(
        local(2026, 9, 1), local(2026, 9, 7),
        ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      );
      // Sep 1–7 is exactly 7 days
      expect(all).toHaveLength(7);
    });

    it('results are sorted in ascending chronological order', () => {
      const result = getWeekdayDates(
        local(2026, 9, 1), local(2026, 9, 30), ['monday', 'friday']
      );
      for (let i = 1; i < result.length; i++) {
        expect(result[i].getTime()).toBeGreaterThan(result[i - 1].getTime());
      }
    });
  });

  // Time inheritance from start (no options)

  describe('time component — default (inherits from start)', () => {
    it('preserves the hours/minutes/seconds/ms from start on every result', () => {
      const start = local(2026, 9, 1, 10, 45, 30, 123);
      const result = getWeekdayDates(start, local(2026, 9, 30), ['monday']);
      result.forEach(d => {
        const p = localParts(d);
        expect(p.hour).toBe(10);
        expect(p.minute).toBe(45);
        expect(p.second).toBe(30);
        expect(p.ms).toBe(123);
      });
    });

    it('preserves midnight (00:00:00.000) time from start', () => {
      const start = local(2026, 9, 1, 0, 0, 0, 0);
      const result = getWeekdayDates(start, local(2026, 9, 7), ['tuesday']);
      result.forEach(d => {
        const p = localParts(d);
        expect(p.hour).toBe(0);
        expect(p.minute).toBe(0);
        expect(p.second).toBe(0);
        expect(p.ms).toBe(0);
      });
    });
  });

  // options.time (time string)

  describe('options.time — time string', () => {
    it('sets correct hour and minute from "HH:mm"', () => {
      const result = getWeekdayDates(
        local(2026, 9, 1), local(2026, 9, 30), ['monday'],
        { time: '08:30' }
      );
      result.forEach(d => {
        const p = localParts(d);
        expect(p.hour).toBe(8);
        expect(p.minute).toBe(30);
        expect(p.second).toBe(0);
        expect(p.ms).toBe(0);
      });
    });

    it('sets correct time from "HH:mm:ss"', () => {
      const result = getWeekdayDates(
        local(2026, 9, 1), local(2026, 9, 14), ['friday'],
        { time: '14:00:45' }
      );
      result.forEach(d => {
        const p = localParts(d);
        expect(p.hour).toBe(14);
        expect(p.minute).toBe(0);
        expect(p.second).toBe(45);
        expect(p.ms).toBe(0);
      });
    });

    it('sets correct time from "HH:mm:ss.SSS"', () => {
      const result = getWeekdayDates(
        local(2026, 9, 1), local(2026, 9, 14), ['wednesday'],
        { time: '23:59:59.999' }
      );
      result.forEach(d => {
        const p = localParts(d);
        expect(p.hour).toBe(23);
        expect(p.minute).toBe(59);
        expect(p.second).toBe(59);
        expect(p.ms).toBe(999);
      });
    });

    it('time string overrides individual numeric options when both provided', () => {
      // Even though hours:5 is provided, time:'08:30' should win
      const result = getWeekdayDates(
        local(2026, 9, 1), local(2026, 9, 7), ['monday'],
        { time: '08:30', hours: 5 }
      );
      result.forEach(d => expect(localParts(d).hour).toBe(8));
    });

    it('propagates invalid time string error', () => {
      expect(() =>
        getWeekdayDates(local(2026, 9, 1), local(2026, 9, 30), ['monday'], {
          time: 'invalid',
        })
      ).toThrow(/Invalid time format/);
    });
  });

  // options numeric fields

  describe('options — individual numeric fields', () => {
    it('overrides only hours, keeps rest from start', () => {
      const start = local(2026, 9, 1, 10, 45, 30, 123);
      const result = getWeekdayDates(start, local(2026, 9, 30), ['monday'], {
        hours: 20,
      });
      result.forEach(d => {
        const p = localParts(d);
        expect(p.hour).toBe(20);
        expect(p.minute).toBe(45); // from start
        expect(p.second).toBe(30); // from start
        expect(p.ms).toBe(123);    // from start
      });
    });

    it('overrides minutes only', () => {
      const start = local(2026, 9, 1, 10, 45, 30, 0);
      const result = getWeekdayDates(start, local(2026, 9, 14), ['tuesday'], {
        minutes: 0,
      });
      result.forEach(d => {
        expect(localParts(d).minute).toBe(0);
        expect(localParts(d).hour).toBe(10); // from start
      });
    });

    it('overrides seconds only', () => {
      const start = local(2026, 9, 1, 10, 45, 30, 0);
      const result = getWeekdayDates(start, local(2026, 9, 14), ['wednesday'], {
        seconds: 59,
      });
      result.forEach(d => expect(localParts(d).second).toBe(59));
    });

    it('overrides milliseconds only', () => {
      const start = local(2026, 9, 1, 10, 45, 30, 0);
      const result = getWeekdayDates(start, local(2026, 9, 14), ['thursday'], {
        milliseconds: 500,
      });
      result.forEach(d => expect(localParts(d).ms).toBe(500));
    });

    it('overrides all four components simultaneously', () => {
      const start = local(2026, 9, 1, 1, 1, 1, 1);
      const result = getWeekdayDates(start, local(2026, 9, 30), ['friday'], {
        hours: 14, minutes: 45, seconds: 30, milliseconds: 250,
      });
      result.forEach(d => {
        const p = localParts(d);
        expect(p.hour).toBe(14);
        expect(p.minute).toBe(45);
        expect(p.second).toBe(30);
        expect(p.ms).toBe(250);
      });
    });

    it('respects hour=0 (falsy number) correctly', () => {
      const result = getWeekdayDates(
        local(2026, 9, 1, 10, 0, 0, 0),
        local(2026, 9, 14),
        ['monday'],
        { hours: 0 }
      );
      result.forEach(d => expect(localParts(d).hour).toBe(0));
    });
  });

  // Cross-month range

  describe('cross-month range', () => {
    it('correctly spans months — August to October', () => {
      const result = getWeekdayDates(
        local(2026, 8, 31), local(2026, 10, 1), ['monday']
      );
      // Every result must be a Monday
      result.forEach(d => expect(d.getDay()).toBe(DAY.monday));
      // Must span at least two different months
      const months = new Set(result.map(d => d.getMonth()));
      expect(months.size).toBeGreaterThanOrEqual(2);
    });
  });

  // Cross-year range

  describe('cross-year range', () => {
    it('correctly spans a year boundary (Dec → Jan)', () => {
      // Dec 29 2025 = Mon, Dec 31 = Wed (2025); Jan 2 = Fri, Jan 5 = Mon … (2026)
      const result = getWeekdayDates(
        local(2025, 12, 29), local(2026, 1, 9), ['monday', 'wednesday', 'friday']
      );
      result.forEach(d => expect([DAY.monday, DAY.wednesday, DAY.friday]).toContain(d.getDay()));
      const years = new Set(result.map(d => d.getFullYear()));
      expect(years.has(2025)).toBe(true);
      expect(years.has(2026)).toBe(true);
    });
  });

  // Exact count assertions

  describe('expected count', () => {
    it('returns 8 dates for Mon/Wed/Fri over Sep 2–20, 2026', () => {
      // This is the original example from the library's spec
      const result = getWeekdayDates(
        local(2026, 9, 2), local(2026, 9, 20), ['monday', 'wednesday', 'friday']
      );
      expect(result).toHaveLength(8);
    });

    it('returns 4 Mondays in a 4-week range', () => {
      // Sep 7 is Monday → Sep 7, 14, 21, 28
      const result = getWeekdayDates(
        local(2026, 9, 7), local(2026, 9, 28), ['monday']
      );
      expect(result).toHaveLength(4);
    });
  });
});
