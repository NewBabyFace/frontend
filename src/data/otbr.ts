import type { menuai } from "../types";

export interface OTBRInfo {
  active_dataset_tlvs: string;
  border_agent_id: string;
  channel: number;
  extended_address: string;
  extended_pan_id: string;
  url: string;
}

export type OTBRInfoDict = Record<string, OTBRInfo>;

export const getOTBRInfo = (menuai: menuai): Promise<OTBRInfoDict> =>
  menuai.callWS({
    type: "otbr/info",
  });

export const OTBRCreateNetwork = (
  menuai: menuai,
  extended_address: string
): Promise<void> =>
  menuai.callWS({
    type: "otbr/create_network",
    extended_address,
  });

export const OTBRSetNetwork = (
  menuai: menuai,
  extended_address: string,
  dataset_id: string
): Promise<void> =>
  menuai.callWS({
    type: "otbr/set_network",
    extended_address,
    dataset_id,
  });

export const OTBRSetChannel = (
  menuai: menuai,
  extended_address: string,
  channel: number
): Promise<{ delay: number }> =>
  menuai.callWS({
    type: "otbr/set_channel",
    extended_address,
    channel,
  });
