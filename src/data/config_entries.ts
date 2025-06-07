import type { UnsubscribeFunc } from "home-assistant-js-websocket";
import type { menuai } from "../types";
import type { IntegrationType } from "./integration";

export interface ConfigEntry {
  entry_id: string;
  domain: string;
  title: string;
  source: string;
  state:
    | "loaded"
    | "setup_error"
    | "migration_error"
    | "setup_retry"
    | "not_loaded"
    | "failed_unload"
    | "setup_in_progress";
  supports_options: boolean;
  supports_remove_device: boolean;
  supports_unload: boolean;
  supports_reconfigure: boolean;
  supported_subentry_types: Record<string, { supports_reconfigure: boolean }>;
  num_subentries: number;
  pref_disable_new_entities: boolean;
  pref_disable_polling: boolean;
  disabled_by: "user" | null;
  reason: string | null;
  error_reason_translation_key: string | null;
  error_reason_translation_placeholders: Record<string, string> | null;
}

export interface SubEntry {
  subentry_id: string;
  subentry_type: string;
  title: string;
  unique_id: string;
}

export const getSubEntries = (menuai: menuai, entry_id: string) =>
  menuai.callWS<SubEntry[]>({
    type: "config_entries/subentries/list",
    entry_id,
  });

export const deleteSubEntry = (
  menuai: menuai,
  entry_id: string,
  subentry_id: string
) =>
  menuai.callWS({
    type: "config_entries/subentries/delete",
    entry_id,
    subentry_id,
  });

export type ConfigEntryMutableParams = Partial<
  Pick<
    ConfigEntry,
    "title" | "pref_disable_new_entities" | "pref_disable_polling"
  >
>;

// https://github.com/home-assistant/core/blob/2286dea636fda001f03433ba14d7adbda43979e5/menuai/config_entries.py#L81
export const ERROR_STATES: ConfigEntry["state"][] = [
  "migration_error",
  "setup_error",
  "setup_retry",
];

// https://github.com/home-assistant/core/blob/2286dea636fda001f03433ba14d7adbda43979e5/menuai/config_entries.py#L81
export const RECOVERABLE_STATES: ConfigEntry["state"][] = [
  "not_loaded",
  "loaded",
  "setup_error",
  "setup_retry",
];

export interface ConfigEntryUpdate {
  // null means no update as is the current state
  type: null | "added" | "removed" | "updated";
  entry: ConfigEntry;
}

export const subscribeConfigEntries = (
  menuai: menuai,
  callbackFunction: (message: ConfigEntryUpdate[]) => void,
  filters?: {
    type?: IntegrationType[];
    domain?: string;
  }
): Promise<UnsubscribeFunc> => {
  const params: any = {
    type: "config_entries/subscribe",
  };
  if (filters && filters.type) {
    params.type_filter = filters.type;
  }
  return menuai.connection.subscribeMessage<ConfigEntryUpdate[]>(
    (message) => callbackFunction(message),
    params
  );
};

export const getConfigEntries = (
  menuai: menuai,
  filters?: {
    type?: IntegrationType[];
    domain?: string;
  }
): Promise<ConfigEntry[]> => {
  const params: any = {};
  if (filters) {
    if (filters.type) {
      params.type_filter = filters.type;
    }
    if (filters.domain) {
      params.domain = filters.domain;
    }
  }
  return menuai.callWS<ConfigEntry[]>({
    type: "config_entries/get",
    ...params,
  });
};

export const getConfigEntry = (menuai: menuai, configEntryId: string) =>
  menuai.callWS<{ config_entry: ConfigEntry }>({
    type: "config_entries/get_single",
    entry_id: configEntryId,
  });

export const updateConfigEntry = (
  menuai: menuai,
  configEntryId: string,
  updatedValues: ConfigEntryMutableParams
) =>
  menuai.callWS<{ require_restart: boolean; config_entry: ConfigEntry }>({
    type: "config_entries/update",
    entry_id: configEntryId,
    ...updatedValues,
  });

export const deleteConfigEntry = (menuai: menuai, configEntryId: string) =>
  menuai.callApi<{
    require_restart: boolean;
  }>("DELETE", `config/config_entries/entry/${configEntryId}`);

export const reloadConfigEntry = (menuai: menuai, configEntryId: string) =>
  menuai.callApi<{
    require_restart: boolean;
  }>("POST", `config/config_entries/entry/${configEntryId}/reload`);

export interface DisableConfigEntryResult {
  require_restart: boolean;
}

export const disableConfigEntry = (
  menuai: menuai,
  configEntryId: string
) =>
  menuai.callWS<DisableConfigEntryResult>({
    type: "config_entries/disable",
    entry_id: configEntryId,
    disabled_by: "user",
  });

export const enableConfigEntry = (menuai: menuai, configEntryId: string) =>
  menuai.callWS<{
    require_restart: boolean;
  }>({
    type: "config_entries/disable",
    entry_id: configEntryId,
    disabled_by: null,
  });

export const sortConfigEntries = (
  configEntries: ConfigEntry[],
  primaryConfigEntry: string | null
): ConfigEntry[] => {
  if (!primaryConfigEntry) {
    return configEntries;
  }
  const primaryEntry = configEntries.find(
    (e) => e.entry_id === primaryConfigEntry
  );
  if (!primaryEntry) {
    return configEntries;
  }
  const otherEntries = configEntries.filter(
    (e) => e.entry_id !== primaryConfigEntry
  );
  return [primaryEntry, ...otherEntries];
};
