import { parseTimeString } from '../../src/index';

describe('parseTimeString', () => {
  // ── Valid inputs

  describe('valid formats', () => {
    it('parses "HH:mm" — sets seconds and ms to 0', () => {
      expect(parseTimeString('14:30')).toEqual({
        hours: 14,
        minutes: 30,
        seconds: 0,
        milliseconds: 0,
      });
    });

    it('parses "HH:mm" with zero-padded hour', () => {
      expect(parseTimeString('09:05')).toEqual({
        hours: 9,
        minutes: 5,
        seconds: 0,
        milliseconds: 0,
      });
    });

    it('parses "HH:mm:ss"', () => {
      expect(parseTimeString('09:05:30')).toEqual({
        hours: 9,
        minutes: 5,
        seconds: 30,
        milliseconds: 0,
      });
    });

    it('parses "HH:mm:ss.SSS" — full precision', () => {
      expect(parseTimeString('23:59:59.999')).toEqual({
        hours: 23,
        minutes: 59,
        seconds: 59,
        milliseconds: 999,
      });
    });

    it('parses milliseconds with 1 digit (".5" → 500 ms)', () => {
      expect(parseTimeString('10:00:00.5')).toEqual({
        hours: 10,
        minutes: 0,
        seconds: 0,
        milliseconds: 500,
      });
    });

    it('parses milliseconds with 2 digits (".50" → 500 ms)', () => {
      expect(parseTimeString('10:00:00.50')).toEqual({
        hours: 10,
        minutes: 0,
        seconds: 0,
        milliseconds: 500,
      });
    });

    it('parses midnight "00:00:00.000"', () => {
      expect(parseTimeString('00:00:00.000')).toEqual({
        hours: 0,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
      });
    });

    it('parses end-of-day "23:59:59.999"', () => {
      const result = parseTimeString('23:59:59.999');
      expect(result.hours).toBe(23);
      expect(result.minutes).toBe(59);
      expect(result.seconds).toBe(59);
      expect(result.milliseconds).toBe(999);
    });

    it('parses single-digit hour "8:00"', () => {
      expect(parseTimeString('8:00')).toEqual({
        hours: 8,
        minutes: 0,
        seconds: 0,
        milliseconds: 0,
      });
    });
  });

  // Invalid formats

  describe('invalid formats', () => {
    it.each([
      ['empty string', ''],
      ['only hours', '14'],
      ['wrong separator', '14-30'],
      ['extra segment', '14:30:00:00'],
      ['letters', 'ab:cd'],
      ['HH:mm:ss with extra dot', '14:30:00.'],
    ])('throws for %s → "%s"', (_label, input) => {
      expect(() => parseTimeString(input)).toThrow(
        /Invalid time format/
      );
    });
  });

  // Out-of-range values

  describe('out-of-range values', () => {
    it('throws when hours > 23', () => {
      expect(() => parseTimeString('24:00')).toThrow(/out of range/);
    });

    it('throws when minutes > 59', () => {
      expect(() => parseTimeString('12:60')).toThrow(/out of range/);
    });

    it('throws when seconds > 59', () => {
      expect(() => parseTimeString('12:00:60')).toThrow(/out of range/);
    });
  });
});
