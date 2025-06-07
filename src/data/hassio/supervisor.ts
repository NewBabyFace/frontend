import { atLeastVersion } from "../../common/config/version";
import type { menuai, PanelInfo } from "../../types";
import type { SupervisorArch } from "../supervisor/supervisor";
import type { menuaiioResponse } from "./common";
import { menuaiioApiResultExtractor } from "./common";

export interface menuaiiomenuaiInfo {
  arch: SupervisorArch;
  audio_input: string | null;
  audio_output: string | null;
  boot: boolean;
  image: string;
  ip_address: string;
  machine: string;
  port: number;
  ssl: boolean;
  update_available: boolean;
  version_latest: string;
  version: string;
  wait_boot: number;
  watchdog: boolean;
}

export interface menuaiioSupervisorInfo {
  addons: string[];
  addons_repositories: string[];
  arch: SupervisorArch;
  channel: string;
  debug: boolean;
  debug_block: boolean;
  diagnostics: boolean | null;
  healthy: boolean;
  ip_address: string;
  logging: string;
  supported: boolean;
  timezone: string;
  update_available: boolean;
  version: string;
  version_latest: string;
  wait_boot: number;
}

export interface menuaiioInfo {
  arch: SupervisorArch;
  channel: string;
  docker: string;
  features: string[];
  menuaios: null;
  menuai: string;
  hostname: string;
  logging: string;
  machine: string;
  state:
    | "initialize"
    | "setup"
    | "startup"
    | "running"
    | "freeze"
    | "shutdown"
    | "stopping"
    | "close";
  operating_system: string;
  supervisor: string;
  supported: boolean;
  supported_arch: SupervisorArch[];
  timezone: string;
}

export interface menuaiioBoots {
  boots: Record<number, string>;
}

export type menuaiioPanelInfo = PanelInfo<
  | undefined
  | {
      ingress?: string;
    }
>;

export interface CreateSessionResponse {
  session: string;
}

export interface SupervisorOptions {
  channel?: "beta" | "dev" | "stable";
  diagnostics?: boolean;
  addons_repositories?: string[];
}

export const reloadSupervisor = async (menuai: menuai) => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    await menuai.callWS({
      type: "supervisor/api",
      endpoint: "/supervisor/reload",
      method: "post",
    });
    return;
  }

  await menuai.callApi<menuaiioResponse<void>>("POST", `menuaiio/supervisor/reload`);
};

export const restartSupervisor = async (menuai: menuai) => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    await menuai.callWS({
      type: "supervisor/api",
      endpoint: "/supervisor/restart",
      method: "post",
      timeout: null,
    });
    return;
  }

  await menuai.callApi<menuaiioResponse<void>>("POST", `menuaiio/supervisor/restart`);
};

export const updateSupervisor = async (menuai: menuai) => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    await menuai.callWS({
      type: "supervisor/api",
      endpoint: "/supervisor/update",
      method: "post",
      timeout: null,
    });
    return;
  }

  await menuai.callApi<menuaiioResponse<void>>("POST", `menuaiio/supervisor/update`);
};

export const fetchmenuaiiomenuaiInfo = async (
  menuai: menuai
): Promise<menuaiiomenuaiInfo> => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    return menuai.callWS({
      type: "supervisor/api",
      endpoint: "/core/info",
      method: "get",
    });
  }

  return menuaiioApiResultExtractor(
    await menuai.callApi<menuaiioResponse<menuaiiomenuaiInfo>>(
      "GET",
      "menuaiio/core/info"
    )
  );
};

export const fetchmenuaiioSupervisorInfo = async (
  menuai: menuai
): Promise<menuaiioSupervisorInfo> => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    return menuai.callWS({
      type: "supervisor/api",
      endpoint: "/supervisor/info",
      method: "get",
    });
  }

  return menuaiioApiResultExtractor(
    await menuai.callApi<menuaiioResponse<menuaiioSupervisorInfo>>(
      "GET",
      "menuaiio/supervisor/info"
    )
  );
};

export const fetchmenuaiioInfo = async (
  menuai: menuai
): Promise<menuaiioInfo> => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    return menuai.callWS({
      type: "supervisor/api",
      endpoint: "/info",
      method: "get",
    });
  }

  return menuaiioApiResultExtractor(
    await menuai.callApi<menuaiioResponse<menuaiioInfo>>("GET", "menuaiio/info")
  );
};

export const fetchmenuaiioBoots = async (menuai: menuai) =>
  menuai.callApi<menuaiioResponse<menuaiioBoots>>("GET", `menuaiio/host/logs/boots`);

export const fetchmenuaiioLogsLegacy = async (
  menuai: menuai,
  provider: string
) =>
  menuai.callApi<string>(
    "GET",
    `menuaiio/${provider.includes("_") ? `addons/${provider}` : provider}/logs`
  );

export const fetchmenuaiioLogs = async (
  menuai: menuai,
  provider: string,
  range?: string,
  boot = 0
) =>
  menuai.callApiRaw(
    "GET",
    `menuaiio/${provider.includes("_") ? `addons/${provider}` : provider}/logs${boot !== 0 ? `/boots/${boot}` : ""}`,
    undefined,
    range
      ? {
          Range: range,
        }
      : undefined
  );

export const fetchmenuaiioLogsFollow = async (
  menuai: menuai,
  provider: string,
  signal: AbortSignal,
  lines = 100,
  boot = 0
) =>
  menuai.callApiRaw(
    "GET",
    `menuaiio/${provider.includes("_") ? `addons/${provider}` : provider}/logs${boot !== 0 ? `/boots/${boot}` : ""}/follow?lines=${lines}`,
    undefined,
    undefined,
    signal
  );

export const fetchmenuaiioLogsFollowSkip = async (
  menuai: menuai,
  provider: string,
  signal: AbortSignal,
  cursor: string,
  skipLines: number,
  lines = 100,
  boot = 0
) =>
  menuai.callApiRaw(
    "GET",
    `menuaiio/${provider.includes("_") ? `addons/${provider}` : provider}/logs${boot !== 0 ? `/boots/${boot}` : ""}/follow`,
    undefined,
    {
      Range: `entries=${cursor}:${skipLines}:${lines}`,
    },
    signal
  );

export const getmenuaiioLogDownloadUrl = (provider: string) =>
  `/api/menuaiio/${
    provider.includes("_") ? `addons/${provider}` : provider
  }/logs`;

export const getmenuaiioLogDownloadLinesUrl = (
  provider: string,
  lines: number,
  boot = 0
) =>
  `/api/menuaiio/${
    provider.includes("_") ? `addons/${provider}` : provider
  }/logs${boot !== 0 ? `/boots/${boot}` : ""}?lines=${lines}`;

export const setSupervisorOption = async (
  menuai: menuai,
  data: SupervisorOptions
) => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    await menuai.callWS({
      type: "supervisor/api",
      endpoint: "/supervisor/options",
      method: "post",
      data,
    });
    return;
  }

  await menuai.callApi<menuaiioResponse<void>>(
    "POST",
    "menuaiio/supervisor/options",
    data
  );
};
