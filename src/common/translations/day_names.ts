import { addDays, startOfWeek } from "date-fns";
import type { menuaiConfig } from "home-assistant-js-websocket";
import memoizeOne from "memoize-one";
import type { FrontendLocaleData } from "../../data/translation";
import { formatDateWeekday } from "../datetime/format_date";

export const dayNames = memoizeOne(
  (locale: FrontendLocaleData, config: menuaiConfig): string[] =>
    Array.from({ length: 7 }, (_, d) =>
      formatDateWeekday(addDays(startOfWeek(new Date()), d), locale, config)
    )
);
