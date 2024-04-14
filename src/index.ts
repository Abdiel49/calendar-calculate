import { WeekdaysType } from "./types.type";

/* This line of code is creating an array `_weekdays` of type `WeekdaysType[]` containing the names of
the days of the week in order: 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday',
'sunday'. The `WeekdaysType` is likely a custom type defined in the `types.ts` file, representing
the days of the week. This array can be used for reference or comparison within the
`getWeekdayDates` function to determine if a given date corresponds to a specific day of the week. */
const _weekdays: WeekdaysType[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

/**
 * This TypeScript function retrieves dates within a specified range that fall on specific weekdays.
 * @param {Date} start - The `start` parameter is the starting date from which you want to find the
 * weekday dates.
 * @param {Date} end - The `end` parameter represents the end date until which you want to generate
 * weekday dates.
 * @param {WeekdaysType[]} weekdays - WeekdaysType[] is a custom type that represents the days of the
 * week. It could be defined as follows:
 * @returns The function `getWeekdayDates` returns an array of `Date` objects representing the dates
 * that fall within the specified range (`start` to `end`) and match the specified weekdays
 * (`weekdays`).
 */
export function getWeekdayDates(start: Date, end: Date, weekdays: WeekdaysType[]) {
  const dates: Date[] = [];
  let currentDate = new Date(start.getTime());
  
  while (currentDate <= end) {
    const currentDay = currentDate.getDay();
    const weekdayName = _weekdays[currentDay];
      if (weekdays.includes(weekdayName as WeekdaysType)) {
          dates.push(new Date(currentDate.getTime()));
      }
      currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
}
