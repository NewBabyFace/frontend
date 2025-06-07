import { atLeastVersion } from "../../common/config/version";
import type { menuai } from "../../types";
import type { menuaiioResponse } from "./common";
import { menuaiioApiResultExtractor } from "./common";

export interface menuaiioHostInfo {
  agent_version: string;
  cmenuaiis: string;
  cpe: string;
  deployment: string;
  disk_life_time: number | "";
  disk_free: number;
  disk_total: number;
  disk_used: number;
  features: string[];
  hostname: string;
  kernel: string;
  operating_system: string;
  boot_timestamp: number;
  startup_time: number;
}

export interface menuaiiomenuaiOSInfo {
  board: string | null;
  boot: string | null;
  update_available: boolean;
  version_latest: string | null;
  version: string | null;
  data_disk: string;
}

export interface Datadisk {
  name: string;
  vendor: string;
  model: string;
  serial: string;
  size: number;
  id: string;
  dev_path: string;
}

export interface DatadiskList {
  devices: string[];
  disks: Datadisk[];
}

export const fetchmenuaiioHostInfo = async (
  menuai: menuai
): Promise<menuaiioHostInfo> => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    return menuai.callWS({
      type: "supervisor/api",
      endpoint: "/host/info",
      method: "get",
    });
  }

  const response = await menuai.callApi<menuaiioResponse<menuaiioHostInfo>>(
    "GET",
    "menuaiio/host/info"
  );
  return menuaiioApiResultExtractor(response);
};

export const fetchmenuaiiomenuaiOsInfo = async (
  menuai: menuai
): Promise<menuaiiomenuaiOSInfo> => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    return menuai.callWS({
      type: "supervisor/api",
      endpoint: "/os/info",
      method: "get",
    });
  }

  return menuaiioApiResultExtractor(
    await menuai.callApi<menuaiioResponse<menuaiiomenuaiOSInfo>>(
      "GET",
      "menuaiio/os/info"
    )
  );
};

export const rebootHost = async (menuai: menuai) => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    return menuai.callWS({
      type: "supervisor/api",
      endpoint: "/host/reboot",
      method: "post",
      timeout: null,
    });
  }

  return menuai.callApi<menuaiioResponse<void>>("POST", "menuaiio/host/reboot");
};

export const shutdownHost = async (menuai: menuai) => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    return menuai.callWS({
      type: "supervisor/api",
      endpoint: "/host/shutdown",
      method: "post",
      timeout: null,
    });
  }

  return menuai.callApi<menuaiioResponse<void>>("POST", "menuaiio/host/shutdown");
};

export const updateOS = async (menuai: menuai) => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    return menuai.callWS({
      type: "supervisor/api",
      endpoint: "/os/update",
      method: "post",
      timeout: null,
    });
  }

  return menuai.callApi<menuaiioResponse<void>>("POST", "menuaiio/os/update");
};

export const configSyncOS = async (menuai: menuai) => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    return menuai.callWS({
      type: "supervisor/api",
      endpoint: "/os/config/sync",
      method: "post",
      timeout: null,
    });
  }

  return menuai.callApi<menuaiioResponse<void>>("POST", "menuaiio/os/config/sync");
};

export const changeHostOptions = async (menuai: menuai, options: any) => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    return menuai.callWS({
      type: "supervisor/api",
      endpoint: "/host/options",
      method: "post",
      data: options,
    });
  }

  return menuai.callApi<menuaiioResponse<void>>(
    "POST",
    "menuaiio/host/options",
    options
  );
};

export const moveDatadisk = async (menuai: menuai, device: string) => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    return menuai.callWS({
      type: "supervisor/api",
      endpoint: "/os/datadisk/move",
      method: "post",
      timeout: null,
      data: { device },
    });
  }

  return menuai.callApi<menuaiioResponse<void>>("POST", "menuaiio/os/datadisk/move");
};

export const listDatadisks = async (
  menuai: menuai
): Promise<DatadiskList> => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    return menuai.callWS<DatadiskList>({
      type: "supervisor/api",
      endpoint: "/os/datadisk/list",
      method: "get",
      timeout: null,
    });
  }

  return menuaiioApiResultExtractor(
    await menuai.callApi<menuaiioResponse<DatadiskList>>("GET", "/os/datadisk/list")
  );
};
