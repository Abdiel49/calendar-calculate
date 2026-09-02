# Changelog

All notable changes to **calendar-calculate** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0] — 2026-09-02

### Added

- **`WeekdayDatesOptions` interface** (`src/types.type.ts`) — new optional fourth
  parameter for `getWeekdayDates` that lets callers override the time component of
  every generated date. Supported fields:
  - `hours` — hour in 24-hour format (0–23).
  - `minutes` — minutes (0–59).
  - `seconds` — seconds (0–59).
  - `milliseconds` — milliseconds (0–999).
  - `time` — convenience string in `"HH:mm"`, `"HH:mm:ss"`, or `"HH:mm:ss.SSS"`
    format; when supplied it takes precedence over the individual numeric fields.

- **`parseTimeString(time: string)` export** (`src/index.ts`) — standalone helper
  that parses a 24-hour time string and returns `{ hours, minutes, seconds, milliseconds }`.
  Throws a descriptive `Error` for invalid formats or out-of-range values.

- **Local-time weekday evaluation** — `getWeekdayDates` now uses JavaScript's local
  date methods (`getFullYear`, `getMonth`, `getDate`, `getDay`) throughout the loop
  instead of UTC methods. This eliminates the off-by-one day error that appeared in
  v1.x for users in timezones behind UTC.

- **Local-time date iteration** — day-by-day advancement in `getWeekdayDates` is now
  performed using local calendar arithmetic (`new Date(year, month, day + 1)`),
  making the loop DST-safe across every timezone.

- **`_weekdays` mapping constant** (`src/index.ts`) — internal array that maps
  `Date.getDay()` indices (0 = Sunday … 6 = Saturday) to `WeekdaysType` names,
  replacing the previous inline lookup.

- **Test suite** — comprehensive tests covering both functions:
  - `tests/unit/getWeekdayDates.test.ts` — unit tests for date filtering, time
    override (string and numeric fields), DST edge cases, and backward compatibility.
  - `tests/unit/parseTimeString.test.ts` — unit tests for valid formats, fractional
    milliseconds, boundary values, and error paths.
  - `tests/e2e/calendar.e2e.test.ts` — end-to-end integration scenarios.

- **Test scripts** (`package.json`):
  - `test:unit` — runs only unit tests (`tests/unit`).
  - `test:e2e` — runs only end-to-end tests (`tests/e2e`).
  - `test:coverage` — runs the full suite with coverage reporting.

- **Updated `README.md`** — added usage examples for the `options` parameter
  (time-string and individual numeric fields), documented `parseTimeString`, added
  the `WeekdayDatesOptions` API table, the timezone note, and a migration guide from
  v1.x.

### Changed

- `getWeekdayDates` signature extended with an optional `options?: WeekdayDatesOptions`
  fourth parameter (fully backward-compatible — existing callers need no changes).
- `package.json` bumped to version **2.0.0** and dependencies updated:
  - `@types/jest` → `^30.0.0`
  - `jest` → `^30.5.1`
  - `ts-jest` → `^29.4.12`
  - `typescript` → `^5.4.5`

### Fixed

- **Timezone / UTC off-by-one bug** — in v1.x the weekday was determined in UTC
  (`getUTCDay()`), causing the wrong day to be returned for callers in timezones
  with a negative UTC offset (e.g. UTC−4 and earlier). v2.0.0 evaluates weekdays
  in local time.

---

## [1.0.0] — 2024-04-14

### Added

- Initial implementation of `getWeekdayDates(start, end, weekdays)` (`src/index.ts`).
- `WeekdaysType` union type (`src/types.type.ts`).
- `package.json`, `tsconfig.json`, `.gitignore`, `LICENCE.md`, and `README.md`.
