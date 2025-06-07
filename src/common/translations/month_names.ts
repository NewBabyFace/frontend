import { addMonths, startOfYear } from "date-fns";
import type { menuaiConfig } from "home-assistant-js-websocket";
import memoizeOne from "memoize-one";
import type { FrontendLocaleData } from "../../data/translation";
import { formatDateMonth } from "../datetime/format_date";

export const monthNames = memoizeOne(
  (locale: FrontendLocaleData, config: menuaiConfig): string[] =>
    Array.from({ length: 12 }, (_, m) =>
      formatDateMonth(addMonths(startOfYear(new Date()), m), locale, config)
    )
);
