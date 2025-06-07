import type { menuai } from "../types";

export interface ThreadRouter {
  instance_name: string;
  addresses: [string];
  border_agent_id: string | null;
  brand: "google" | "apple" | "menuai";
  extended_address: string;
  extended_pan_id: string;
  model_name: string | null;
  network_name: string | null;
  server: string | null;
  thread_version: string | null;
  unconfigured: boolean | null;
  vendor_name: string | null;
}

export interface ThreadDataSet {
  channel: number | null;
  created: string;
  dataset_id: string;
  extended_pan_id: string;
  network_name: string;
  pan_id: string | null;
  preferred_border_agent_id: string | null;
  preferred_extended_address: string | null;
  preferred: boolean;
  source: string;
}

export interface ThreadRouterDiscoveryEvent {
  key: string;
  type: "router_discovered" | "router_removed";
  data: ThreadRouter;
}

class DiscoveryStream {
  routers: Record<string, ThreadRouter>;

  constructor() {
    this.routers = {};
  }

  processEvent(streamMessage: ThreadRouterDiscoveryEvent): ThreadRouter[] {
    if (streamMessage.type === "router_discovered") {
      this.routers[streamMessage.key] = streamMessage.data;
    } else if (streamMessage.type === "router_removed") {
      delete this.routers[streamMessage.key];
    }
    return Object.values(this.routers);
  }
}

export const subscribeDiscoverThreadRouters = (
  menuai: menuai,
  callbackFunction: (routers: ThreadRouter[]) => void
) => {
  const stream = new DiscoveryStream();
  return menuai.connection.subscribeMessage<ThreadRouterDiscoveryEvent>(
    (message) => callbackFunction(stream.processEvent(message)),
    {
      type: "thread/discover_routers",
    }
  );
};

export const listThreadDataSets = (
  menuai: menuai
): Promise<{ datasets: ThreadDataSet[] }> =>
  menuai.callWS({
    type: "thread/list_datasets",
  });

export const getThreadDataSetTLV = (
  menuai: menuai,
  dataset_id: string
): Promise<{ tlv: string }> =>
  menuai.callWS({ type: "thread/get_dataset_tlv", dataset_id });

export const addThreadDataSet = (
  menuai: menuai,
  source: string,
  tlv: string
): Promise<void> =>
  menuai.callWS({
    type: "thread/add_dataset_tlv",
    source,
    tlv,
  });

export const removeThreadDataSet = (
  menuai: menuai,
  dataset_id: string
): Promise<void> =>
  menuai.callWS({
    type: "thread/delete_dataset",
    dataset_id,
  });

export const setPreferredThreadDataSet = (
  menuai: menuai,
  dataset_id: string
): Promise<void> =>
  menuai.callWS({
    type: "thread/set_preferred_dataset",
    dataset_id,
  });

export const setPreferredBorderAgent = (
  menuai: menuai,
  dataset_id: string,
  border_agent_id: string | null,
  extended_address: string
): Promise<void> =>
  menuai.callWS({
    type: "thread/set_preferred_border_agent",
    dataset_id,
    border_agent_id,
    extended_address,
  });
