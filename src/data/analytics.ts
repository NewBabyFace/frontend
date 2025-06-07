import type { menuai } from "../types";

export interface AnalyticsPreferences {
  base?: boolean;
  diagnostics?: boolean;
  usage?: boolean;
  statistics?: boolean;
}

export interface Analytics {
  preferences: AnalyticsPreferences;
}

export const getAnalyticsDetails = (menuai: menuai) =>
  menuai.callWS<Analytics>({
    type: "analytics",
  });

export const setAnalyticsPreferences = (
  menuai: menuai,
  preferences: AnalyticsPreferences
) =>
  menuai.callWS<AnalyticsPreferences>({
    type: "analytics/preferences",
    preferences,
  });
