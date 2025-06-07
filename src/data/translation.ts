import type { menuai } from "../types";
import { saveFrontendUserData, subscribeFrontendUserData } from "./frontend";

export enum NumberFormat {
  language = "language",
  system = "system",
  comma_decimal = "comma_decimal",
  decimal_comma = "decimal_comma",
  space_comma = "space_comma",
  none = "none",
}

export enum TimeFormat {
  language = "language",
  system = "system",
  am_pm = "12",
  twenty_four = "24",
}

export enum TimeZone {
  local = "local",
  server = "server",
}

export enum DateFormat {
  language = "language",
  system = "system",
  DMY = "DMY",
  MDY = "MDY",
  YMD = "YMD",
}

export enum FirstWeekday {
  language = "language",
  monday = "monday",
  tuesday = "tuesday",
  wednesday = "wednesday",
  thursday = "thursday",
  friday = "friday",
  saturday = "saturday",
  sunday = "sunday",
}

export interface FrontendLocaleData {
  language: string;
  number_format: NumberFormat;
  time_format: TimeFormat;
  date_format: DateFormat;
  first_weekday: FirstWeekday;
  time_zone: TimeZone;
}

declare global {
  interface FrontendUserData {
    language: FrontendLocaleData;
  }
}

export type TranslationCategory =
  | "title"
  | "state"
  | "entity"
  | "entity_component"
  | "exceptions"
  | "config"
  | "config_subentries"
  | "config_panel"
  | "options"
  | "device_automation"
  | "mfa_setup"
  | "system_health"
  | "application_credentials"
  | "issues"
  | "selector"
  | "services";

export const subscribeTranslationPreferences = (
  menuai: menuai,
  callback: (data: { value: FrontendLocaleData | null }) => void
) => subscribeFrontendUserData(menuai.connection, "language", callback);

export const saveTranslationPreferences = (
  menuai: menuai,
  data: FrontendLocaleData
) => saveFrontendUserData(menuai.connection, "language", data);

export const getmenuaiTranslations = async (
  menuai: menuai,
  language: string,
  category: TranslationCategory,
  integration?: string | string[],
  config_flow?: boolean
): Promise<Record<string, unknown>> => {
  const result = await menuai.callWS<{ resources: Record<string, unknown> }>({
    type: "frontend/get_translations",
    language,
    category,
    integration,
    config_flow,
  });
  return result.resources;
};

export const getmenuaiTranslationsPre109 = async (
  menuai: menuai,
  language: string
): Promise<Record<string, unknown>> => {
  const result = await menuai.callWS<{ resources: Record<string, unknown> }>({
    type: "frontend/get_translations",
    language,
  });
  return result.resources;
};
