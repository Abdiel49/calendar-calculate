export type WeekdaysType = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

/**
 * Options to customize the time component of generated dates.
 * All fields are optional. Unspecified fields are taken from the `start` date.
 */
export interface WeekdayDatesOptions {
  /**
   * Hour in 24-hour format (0–23).
   * If provided together with `time`, `time` takes precedence.
   */
  hours?: number;
  /** Minutes (0–59). */
  minutes?: number;
  /** Seconds (0–59). */
  seconds?: number;
  /** Milliseconds (0–999). */
  milliseconds?: number;
  /**
   * Time string in "HH:mm", "HH:mm:ss" or "HH:mm:ss.SSS" format (24-hour).
   * Overrides `hours`, `minutes`, `seconds`, and `milliseconds` when provided.
   * Example: "14:30", "09:00:00", "23:59:59.999"
   */
  time?: string;
}