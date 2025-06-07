import type { menuai } from "../types";
import type { DataEntryFlowStep } from "./data_entry_flow";

const HEADERS = {
  "HA-Frontend-Base": `${location.protocol}//${location.host}`,
};

export const createSubConfigFlow = (
  menuai: menuai,
  configEntryId: string,
  subFlowType: string,
  subentry_id?: string
) =>
  menuai.callApi<DataEntryFlowStep>(
    "POST",
    "config/config_entries/subentries/flow",
    {
      handler: [configEntryId, subFlowType],
      show_advanced_options: Boolean(menuai.userData?.showAdvanced),
      subentry_id,
    },
    HEADERS
  );

export const fetchSubConfigFlow = (menuai: menuai, flowId: string) =>
  menuai.callApi<DataEntryFlowStep>(
    "GET",
    `config/config_entries/subentries/flow/${flowId}`,
    undefined,
    HEADERS
  );

export const handleSubConfigFlowStep = (
  menuai: menuai,
  flowId: string,
  data: Record<string, any>
) =>
  menuai.callApi<DataEntryFlowStep>(
    "POST",
    `config/config_entries/subentries/flow/${flowId}`,
    data,
    HEADERS
  );

export const deleteSubConfigFlow = (menuai: menuai, flowId: string) =>
  menuai.callApi("DELETE", `config/config_entries/subentries/flow/${flowId}`);
