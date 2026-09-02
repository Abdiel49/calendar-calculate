# Calendar Calculate

A TypeScript library that retrieves dates within a specified range that fall on specific weekdays, with optional control over the time component of the generated dates.

## Installation

```bash
npm install calendar-calculate
```

## Usage

### Basic — keeping the time from `start` (backward-compatible)

```typescript
import { getWeekdayDates } from "calendar-calculate";

const start = new Date('2026-09-02');
const end   = new Date('2026-09-20');

const result = getWeekdayDates(start, end, ['monday', 'wednesday', 'friday']);

console.log(result);
// [
//   2026-09-02T00:00:00.000 (local),
//   2026-09-04T00:00:00.000 (local),
//   2026-09-07T00:00:00.000 (local),
//   ...
// ]
```

### With a fixed time string (24-hour format)

Use the `time` option to set a specific time for every generated date.
Accepted formats: `"HH:mm"`, `"HH:mm:ss"`, `"HH:mm:ss.SSS"`.

```typescript
import { getWeekdayDates } from "calendar-calculate";

const result = getWeekdayDates(
  new Date('2026-09-02'),
  new Date('2026-09-20'),
  ['monday', 'wednesday', 'friday'],
  { time: '08:30' },           // every match will have time 08:30:00.000
);

console.log(result);
// [
//   2026-09-02T08:30:00.000 (local),
//   2026-09-04T08:30:00.000 (local),
//   ...
// ]
```

### With individual time components

```typescript
import { getWeekdayDates } from "calendar-calculate";

const result = getWeekdayDates(
  new Date('2026-09-02'),
  new Date('2026-09-20'),
  ['monday', 'wednesday', 'friday'],
  { hours: 14, minutes: 45, seconds: 30, milliseconds: 0 },
);
```

### Parsing a time string independently

```typescript
import { parseTimeString } from "calendar-calculate";

const t = parseTimeString("14:30:00");
// { hours: 14, minutes: 30, seconds: 0, milliseconds: 0 }
```

---

## API

### `getWeekdayDates(start, end, weekdays, options?)`

Retrieves dates within a specified range that fall on specific weekdays.

| Parameter  | Type                  | Description |
|------------|-----------------------|-------------|
| `start`    | `Date`                | Start of the range (inclusive). |
| `end`      | `Date`                | End of the range (inclusive). |
| `weekdays` | `WeekdaysType[]`      | Weekday names to include (`'monday'` … `'sunday'`). |
| `options`  | `WeekdayDatesOptions` | _(optional)_ Time overrides for generated dates. |

Returns `Date[]` — one entry per matching calendar day.

> **Timezone note:** The weekday check is performed in **local time**, so the
> result always matches the calendar day as seen on the machine running the code,
> regardless of any UTC offset stored inside the `Date` objects.

---

### `WeekdayDatesOptions`

```typescript
interface WeekdayDatesOptions {
  /** Hour in 24-hour format (0–23). Ignored when `time` is set. */
  hours?: number;
  /** Minutes (0–59). Ignored when `time` is set. */
  minutes?: number;
  /** Seconds (0–59). Ignored when `time` is set. */
  seconds?: number;
  /** Milliseconds (0–999). Ignored when `time` is set. */
  milliseconds?: number;
  /**
   * Time string in "HH:mm", "HH:mm:ss", or "HH:mm:ss.SSS" format (24-hour).
   * Overrides `hours`, `minutes`, `seconds`, and `milliseconds`.
   */
  time?: string;
}
```

When **no `options`** are passed, every generated date keeps the same
hours/minutes/seconds/milliseconds as the `start` date — identical to the
behavior of v1.x.

---

### `parseTimeString(time)`

Parses a 24-hour time string and returns its numeric components.

```typescript
parseTimeString(time: string): { hours: number; minutes: number; seconds: number; milliseconds: number }
```

Throws an `Error` if the format is invalid or values are out of range.

---

### `WeekdaysType`

```typescript
type WeekdaysType =
  | 'monday' | 'tuesday' | 'wednesday' | 'thursday'
  | 'friday' | 'saturday' | 'sunday';
```

---

## Migration from v1.x

v2.0.0 is **fully backward-compatible**. Existing calls to `getWeekdayDates`
without a fourth argument continue to work exactly as before.

The only behavioral fix is the **timezone correction**: in v1.x the weekday was
evaluated in UTC, which could cause an off-by-one day error when the caller's
local timezone was behind UTC. v2.0.0 evaluates weekdays in local time.

---

## License

This library is licensed under the MIT License. See the [LICENSE](./LICENCE.md) file for details.
