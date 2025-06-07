import type { Connection } from "home-assistant-js-websocket";
import type { LocalizeFunc } from "../common/translations/localize";
import type { menuai } from "../types";
import type {
  DataEntryFlowProgress,
  DataEntryFlowStep,
} from "./data_entry_flow";
import type { IntegrationType } from "./integration";
import { domainToName } from "./integration";

export const DISCOVERY_SOURCES = [
  "bluetooth",
  "dhcp",
  "discovery",
  "hardware",
  "menuaiio",
  "homekit",
  "integration_discovery",
  "mqtt",
  "ssdp",
  "unignore",
  "usb",
  "zeroconf",
];

export const ATTENTION_SOURCES = ["reauth"];

const HEADERS = {
  "HA-Frontend-Base": `${location.protocol}//${location.host}`,
};

export const createConfigFlow = (
  menuai: menuai,
  handler: string,
  entry_id?: string
) =>
  menuai.callApi<DataEntryFlowStep>(
    "POST",
    "config/config_entries/flow",
    {
      handler,
      show_advanced_options: Boolean(menuai.userData?.showAdvanced),
      entry_id,
    },
    HEADERS
  );

export const fetchConfigFlow = (menuai: menuai, flowId: string) =>
  menuai.callApi<DataEntryFlowStep>(
    "GET",
    `config/config_entries/flow/${flowId}`,
    undefined,
    HEADERS
  );

export const handleConfigFlowStep = (
  menuai: menuai,
  flowId: string,
  data: Record<string, any>
) =>
  menuai.callApi<DataEntryFlowStep>(
    "POST",
    `config/config_entries/flow/${flowId}`,
    data,
    HEADERS
  );

export const ignoreConfigFlow = (
  menuai: menuai,
  flowId: string,
  title: string
) =>
  menuai.callWS({ type: "config_entries/ignore_flow", flow_id: flowId, title });

export const deleteConfigFlow = (menuai: menuai, flowId: string) =>
  menuai.callApi("DELETE", `config/config_entries/flow/${flowId}`);

export const getConfigFlowHandlers = (
  menuai: menuai,
  type?: IntegrationType[]
) =>
  menuai.callApi<string[]>(
    "GET",
    `config/config_entries/flow_handlers${type ? `?type=${type}` : ""}`
  );

export const fetchConfigFlowInProgress = (
  conn: Connection
): Promise<DataEntryFlowProgress[]> =>
  conn.sendMessagePromise({
    type: "config_entries/flow/progress",
  });

export interface ConfigFlowInProgressMessage {
  type: null | "added" | "removed";
  flow_id: string;
  flow: DataEntryFlowProgress;
}

export const subscribeConfigFlowInProgress = (
  menuai: menuai,
  onChange: (update: ConfigFlowInProgressMessage[]) => void
) =>
  menuai.connection.subscribeMessage<ConfigFlowInProgressMessage[]>(
    (message) => onChange(message),
    { type: "config_entries/flow/subscribe" }
  );

export const localizeConfigFlowTitle = (
  localize: LocalizeFunc,
  flow: DataEntryFlowProgress
) => {
  if (
    !flow.context.title_placeholders ||
    Object.keys(flow.context.title_placeholders).length === 0
  ) {
    return domainToName(localize, flow.handler);
  }
  return (
    localize(
      `component.${flow.handler}.config.flow_title`,
      flow.context.title_placeholders
    ) ||
    ("name" in flow.context.title_placeholders
      ? flow.context.title_placeholders.name
      : domainToName(localize, flow.handler))
  );
};
