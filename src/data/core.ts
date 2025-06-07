import type { menuaiConfig } from "home-assistant-js-websocket";
import type { menuai } from "../types";

export interface ConfigUpdateValues {
  location_name: string;
  latitude: number;
  longitude: number;
  elevation: number;
  radius: number;
  unit_system: "metric" | "us_customary";
  time_zone: string;
  external_url?: string | null;
  internal_url?: string | null;
  currency?: string | null;
  country?: string | null;
  language?: string | null;
}

export interface CheckConfigResult {
  result: "valid" | "invalid";
  errors: string | null;
  warnings: string | null;
}

export const saveCoreConfig = (
  menuai: menuai,
  values: Partial<ConfigUpdateValues>
) =>
  menuai.callWS<menuaiConfig>({
    type: "config/core/update",
    ...values,
  });

export const detectCoreConfig = (menuai: menuai) =>
  menuai.callWS<Partial<ConfigUpdateValues>>({
    type: "config/core/detect",
  });

export const checkCoreConfig = (menuai: menuai) =>
  menuai.callApi<CheckConfigResult>("POST", "config/core/check_config");
