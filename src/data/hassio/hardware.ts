import { atLeastVersion } from "../../common/config/version";
import type { menuai } from "../../types";
import type { menuaiioResponse } from "./common";
import { menuaiioApiResultExtractor } from "./common";

export interface menuaiioHardwareAudioDevice {
  device?: string | null;
  name: string;
}

interface menuaiioHardwareAudioList {
  audio: {
    input: Record<string, string>;
    output: Record<string, string>;
  };
}

interface HardwareDevice {
  attributes: Record<string, string>;
  by_id: null | string;
  dev_path: string;
  name: string;
  subsystem: string;
  sysfs: string;
}

export interface menuaiioHardwareInfo {
  devices: HardwareDevice[];
}

export const fetchmenuaiioHardwareAudio = async (
  menuai: menuai
): Promise<menuaiioHardwareAudioList> => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    return menuai.callWS({
      type: "supervisor/api",
      endpoint: `/hardware/audio`,
      method: "get",
    });
  }

  return menuaiioApiResultExtractor(
    await menuai.callApi<menuaiioResponse<menuaiioHardwareAudioList>>(
      "GET",
      "menuaiio/hardware/audio"
    )
  );
};

export const fetchmenuaiioHardwareInfo = async (
  menuai: menuai
): Promise<menuaiioHardwareInfo> => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    return menuai.callWS({
      type: "supervisor/api",
      endpoint: `/hardware/info`,
      method: "get",
    });
  }

  return menuaiioApiResultExtractor(
    await menuai.callApi<menuaiioResponse<menuaiioHardwareInfo>>(
      "GET",
      "menuaiio/hardware/info"
    )
  );
};
