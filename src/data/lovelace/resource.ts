import type { Connection } from "home-assistant-js-websocket";
import type { menuai } from "../../types";

export interface LovelaceResource {
  id: string;
  type: "css" | "js" | "module" | "html";
  url: string;
}

export interface LovelaceResourcesMutableParams {
  res_type: LovelaceResource["type"];
  url: string;
}

export const fetchResources = (conn: Connection): Promise<LovelaceResource[]> =>
  conn.sendMessagePromise({
    type: "lovelace/resources",
  });

export const createResource = (
  menuai: menuai,
  values: LovelaceResourcesMutableParams
) =>
  menuai.callWS<LovelaceResource>({
    type: "lovelace/resources/create",
    ...values,
  });

export const updateResource = (
  menuai: menuai,
  id: string,
  updates: Partial<LovelaceResourcesMutableParams>
) =>
  menuai.callWS<LovelaceResource>({
    type: "lovelace/resources/update",
    resource_id: id,
    ...updates,
  });

export const deleteResource = (menuai: menuai, id: string) =>
  menuai.callWS({
    type: "lovelace/resources/delete",
    resource_id: id,
  });
