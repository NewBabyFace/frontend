import type { menuai } from "../types";
import type { DataEntryFlowStep } from "./data_entry_flow";

export const createOptionsFlow = (menuai: menuai, handler: string) =>
  menuai.callApi<DataEntryFlowStep>(
    "POST",
    "config/config_entries/options/flow",
    {
      handler,
      show_advanced_options: Boolean(menuai.userData?.showAdvanced),
    }
  );

export const fetchOptionsFlow = (menuai: menuai, flowId: string) =>
  menuai.callApi<DataEntryFlowStep>(
    "GET",
    `config/config_entries/options/flow/${flowId}`
  );

export const handleOptionsFlowStep = (
  menuai: menuai,
  flowId: string,
  data: Record<string, any>
) =>
  menuai.callApi<DataEntryFlowStep>(
    "POST",
    `config/config_entries/options/flow/${flowId}`,
    data
  );

export const deleteOptionsFlow = (menuai: menuai, flowId: string) =>
  menuai.callApi("DELETE", `config/config_entries/options/flow/${flowId}`);
