import {
  addDays,
  subHours,
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
  startOfQuarter,
  endOfQuarter,
  subDays,
  subMonths,
} from "date-fns";
import type { menuai } from "../../types";
import { calcDate } from "./calc_date";
import { firstWeekdayIndex } from "./first_weekday";

export type DateRange =
  | "today"
  | "yesterday"
  | "this_week"
  | "this_month"
  | "this_quarter"
  | "this_year"
  | "now-7d"
  | "now-30d"
  | "now-12m"
  | "now-1h"
  | "now-12h"
  | "now-24h";

export const calcDateRange = (
  menuai: menuai,
  range: DateRange
): [Date, Date] => {
  const today = new Date();
  const weekStartsOn = firstWeekdayIndex(menuai.locale);
  switch (range) {
    case "today":
      return [
        calcDate(today, startOfDay, menuai.locale, menuai.config, {
          weekStartsOn,
        }),
        calcDate(today, endOfDay, menuai.locale, menuai.config, {
          weekStartsOn,
        }),
      ];
    case "yesterday":
      return [
        calcDate(addDays(today, -1), startOfDay, menuai.locale, menuai.config, {
          weekStartsOn,
        }),
        calcDate(addDays(today, -1), endOfDay, menuai.locale, menuai.config, {
          weekStartsOn,
        }),
      ];
    case "this_week":
      return [
        calcDate(today, startOfWeek, menuai.locale, menuai.config, {
          weekStartsOn,
        }),
        calcDate(today, endOfWeek, menuai.locale, menuai.config, {
          weekStartsOn,
        }),
      ];
    case "this_month":
      return [
        calcDate(today, startOfMonth, menuai.locale, menuai.config),
        calcDate(today, endOfMonth, menuai.locale, menuai.config),
      ];
    case "this_quarter":
      return [
        calcDate(today, startOfQuarter, menuai.locale, menuai.config),
        calcDate(today, endOfQuarter, menuai.locale, menuai.config),
      ];
    case "this_year":
      return [
        calcDate(today, startOfYear, menuai.locale, menuai.config),
        calcDate(today, endOfYear, menuai.locale, menuai.config),
      ];
    case "now-7d":
      return [
        calcDate(today, subDays, menuai.locale, menuai.config, 7),
        calcDate(today, subDays, menuai.locale, menuai.config, 0),
      ];
    case "now-30d":
      return [
        calcDate(today, subDays, menuai.locale, menuai.config, 30),
        calcDate(today, subDays, menuai.locale, menuai.config, 0),
      ];
    case "now-12m":
      return [
        calcDate(subMonths(today, 12), startOfMonth, menuai.locale, menuai.config),
        calcDate(subMonths(today, 1), endOfMonth, menuai.locale, menuai.config),
      ];
    case "now-1h":
      return [
        calcDate(today, subHours, menuai.locale, menuai.config, 1),
        calcDate(today, subHours, menuai.locale, menuai.config, 0),
      ];
    case "now-12h":
      return [
        calcDate(today, subHours, menuai.locale, menuai.config, 12),
        calcDate(today, subHours, menuai.locale, menuai.config, 0),
      ];
    case "now-24h":
      return [
        calcDate(today, subHours, menuai.locale, menuai.config, 24),
        calcDate(today, subHours, menuai.locale, menuai.config, 0),
      ];
  }
  return [today, today];
};
