import { navigate } from "../common/navigate";
import type { menuai } from "../types";

export interface Zone {
  id: string;
  name: string;
  icon?: string;
  latitude: number;
  longitude: number;
  passive?: boolean;
  radius?: number;
}

export interface HomeZoneMutableParams {
  latitude: number;
  longitude: number;
  radius: number;
}

export interface ZoneMutableParams {
  name: string;
  icon?: string;
  latitude: number;
  longitude: number;
  passive?: boolean;
  radius?: number;
}

export const fetchZones = (menuai: menuai) =>
  menuai.callWS<Zone[]>({ type: "zone/list" });

export const createZone = (menuai: menuai, values: ZoneMutableParams) =>
  menuai.callWS<Zone>({
    type: "zone/create",
    ...values,
  });

export const updateZone = (
  menuai: menuai,
  zoneId: string,
  updates: Partial<ZoneMutableParams>
) =>
  menuai.callWS<Zone>({
    type: "zone/update",
    zone_id: zoneId,
    ...updates,
  });

export const deleteZone = (menuai: menuai, zoneId: string) =>
  menuai.callWS({
    type: "zone/delete",
    zone_id: zoneId,
  });

let inititialZoneEditorData: Partial<ZoneMutableParams> | undefined;

export const showZoneEditor = (data?: Partial<ZoneMutableParams>) => {
  inititialZoneEditorData = data;
  navigate("/config/zone/new");
};

export const getZoneEditorInitData = () => {
  const data = inititialZoneEditorData;
  inititialZoneEditorData = undefined;
  return data;
};
