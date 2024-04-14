# Calendar calculate

This TypeScript library retrieves dates within a specified range that fall on specific weekdays.

## Installation

You can install the `weekday-date-finder` library via npm:

```bash
npm install calendar-calculate
```

## Usage

```typescript
import { getWeekdayDates } from "calendar-calculate";

const startDate = new Date('2024-04-01');
const endDate = new Date('2024-04-15');
const weekdays = ['monday', 'wednesday', 'friday'];

const result = getWeekdayDates(startDate, endDate, weekdays);

console.log(result);
// output
// [
//   2024-04-01T00:00:00.000Z,
//   2024-04-03T00:00:00.000Z,
//   2024-04-05T00:00:00.000Z,
//   2024-04-08T00:00:00.000Z,
//   2024-04-10T00:00:00.000Z,
//   2024-04-12T00:00:00.000Z,
//   2024-04-15T00:00:00.000Z
// ]
```

This will output an array of Date objects representing the dates that fall within the specified range and match the specified weekdays.

## API

```typescript
getWeekdayDates(start: Date, end: Date, weekdays: WeekdaysType[]): Date[]
```

Retrieves dates within a specified range that fall on specific weekdays.

- `start`: The starting date from which you want to find the weekday dates.
- `end`: The end date until which you want to generate weekday dates.
- `weekdays`: An array of weekday names (e.g., 'monday', 'tuesday', etc.).
- Returns an array of Date objects representing the dates that fall within the specified range and match the specified weekdays.

# License
This library is licensed under the MIT License. See the LICENSE file for details.





