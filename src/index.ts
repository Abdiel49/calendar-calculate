import { WeekdaysType, WeekdayDatesOptions } from "./types.type";

/* This array maps JavaScript's `getDay()` index (0 = Sunday) to WeekdaysType names.
   NOTE: JavaScript's Date.getDay() returns 0 for Sunday, 1 for Monday, …, 6 for Saturday.
   We use LOCAL time methods (getFullYear, getMonth, getDate, getDay) throughout this
   function so that the weekday is always determined in the machine's local timezone,
   matching the intent of the caller regardless of the UTC offset embedded in the Date. */
const _weekdays: WeekdaysType[] = [
  'sunday',    // 0
  'monday',    // 1
  'tuesday',   // 2
  'wednesday', // 3
  'thursday',  // 4
  'friday',    // 5
  'saturday',  // 6
];

/**
 * Parses a time string in "HH:mm", "HH:mm:ss" or "HH:mm:ss.SSS" format and returns
 * an object with hours, minutes, seconds, and milliseconds components.
 *
 * @param time - Time string in 24-hour format.
 * @returns Parsed time components.
 * @throws {Error} If the time string format is invalid.
 *
 * @example
 * parseTimeString("14:30")          // { hours: 14, minutes: 30, seconds: 0, milliseconds: 0 }
 * parseTimeString("09:05:30")       // { hours: 9, minutes: 5, seconds: 30, milliseconds: 0 }
 * parseTimeString("23:59:59.999")   // { hours: 23, minutes: 59, seconds: 59, milliseconds: 999 }
 */
export function parseTimeString(time: string): Required<Omit<WeekdayDatesOptions, 'time'>> {
  const match = time.match(/^(\d{1,2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/);
  if (!match) {
    throw new Error(
      `Invalid time format "${time}". Expected "HH:mm", "HH:mm:ss", or "HH:mm:ss.SSS".`
    );
  }
  const hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const seconds = match[3] !== undefined ? parseInt(match[3], 10) : 0;
  // Pad milliseconds to 3 digits if fewer were provided (e.g. ".5" → 500 ms)
  const msRaw = match[4] !== undefined ? (match[4] + '000').slice(0, 3) : '0';
  const milliseconds = parseInt(msRaw, 10);

  if (hours > 23 || minutes > 59 || seconds > 59 || milliseconds > 999) {
    throw new Error(
      `Time value out of range in "${time}". Hours 0-23, Minutes 0-59, Seconds 0-59, Milliseconds 0-999.`
    );
  }

  return { hours, minutes, seconds, milliseconds };
}

/**
 * Retrieves dates within a specified range that fall on specific weekdays.
 *
 * The weekday check is performed using **local time** so that the result is
 * consistent regardless of the UTC offset stored inside the `Date` objects.
 *
 * ### Time component of generated dates
 * By default every returned date keeps the **same time** (hours, minutes,
 * seconds, milliseconds) as the `start` date.  You can override any or all of
 * those components via the optional `options` parameter:
 *
 * - Pass individual numeric fields (`hours`, `minutes`, `seconds`,
 *   `milliseconds`) to set specific components.
 * - Pass a `time` string in `"HH:mm"`, `"HH:mm:ss"`, or `"HH:mm:ss.SSS"`
 *   (24-hour) format to set all time components at once.  When `time` is
 *   provided it takes precedence over the individual numeric fields.
 *
 * @param start    - The starting date (inclusive) of the range.
 * @param end      - The ending date (inclusive) of the range.
 * @param weekdays - An array of weekday names to include.
 * @param options  - Optional time overrides for the generated dates.
 * @returns An array of `Date` objects for every matching day in the range.
 *
 * @example
 * // Basic usage — backward-compatible, keeps the time from `start`
 * const result = getWeekdayDates(
 *   new Date('2026-09-02'),
 *   new Date('2026-09-20'),
 *   ['monday', 'wednesday', 'friday']
 * );
 *
 * @example
 * // Set a fixed time via string (24-hour format)
 * const result = getWeekdayDates(
 *   new Date('2026-09-02'),
 *   new Date('2026-09-20'),
 *   ['monday', 'wednesday', 'friday'],
 *   { time: '08:30' }
 * );
 *
 * @example
 * // Set time using individual numeric fields
 * const result = getWeekdayDates(
 *   new Date('2026-09-02'),
 *   new Date('2026-09-20'),
 *   ['monday', 'wednesday', 'friday'],
 *   { hours: 8, minutes: 30, seconds: 0 }
 * );
 */
export function getWeekdayDates(
  start: Date,
  end: Date,
  weekdays: WeekdaysType[],
  options?: WeekdayDatesOptions,
): Date[] {
  // Resolve the time components to apply to every generated date.
  let timeHours: number | undefined;
  let timeMinutes: number | undefined;
  let timeSeconds: number | undefined;
  let timeMs: number | undefined;

  if (options) {
    if (options.time !== undefined) {
      // `time` string overrides individual numeric fields
      const parsed = parseTimeString(options.time);
      timeHours = parsed.hours;
      timeMinutes = parsed.minutes;
      timeSeconds = parsed.seconds;
      timeMs = parsed.milliseconds;
    } else {
      timeHours = options.hours;
      timeMinutes = options.minutes;
      timeSeconds = options.seconds;
      timeMs = options.milliseconds;
    }
  }

  const dates: Date[] = [];

  // Iterate day by day using LOCAL date components to avoid DST / UTC-offset
  // issues when crossing midnight.
  let year = start.getFullYear();
  let month = start.getMonth();
  let day = start.getDate();

  // Build a Date for the end boundary using local midnight so comparisons work
  // purely on calendar dates regardless of time.
  const endYear = end.getFullYear();
  const endMonth = end.getMonth();
  const endDay = end.getDate();

  while (
    year < endYear ||
    (year === endYear && month < endMonth) ||
    (year === endYear && month === endMonth && day <= endDay)
  ) {
    const current = new Date(
      year,
      month,
      day,
      timeHours  !== undefined ? timeHours  : start.getHours(),
      timeMinutes !== undefined ? timeMinutes : start.getMinutes(),
      timeSeconds !== undefined ? timeSeconds : start.getSeconds(),
      timeMs      !== undefined ? timeMs      : start.getMilliseconds(),
    );

    const weekdayName = _weekdays[current.getDay()];
    if (weekdays.includes(weekdayName)) {
      dates.push(current);
    }

    // Advance by one calendar day using local date arithmetic
    const next = new Date(year, month, day + 1);
    year  = next.getFullYear();
    month = next.getMonth();
    day   = next.getDate();
  }

  return dates;
}
