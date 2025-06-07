import type { Context, menuai } from "../types";
import type { Action } from "./script";

export const callExecuteScript = (
  menuai: menuai,
  sequence: Action | Action[]
): Promise<{ context: Context; response: Record<string, any> }> =>
  menuai.callWS({
    type: "execute_script",
    sequence,
  });

export const serviceCallWillDisconnect = (
  domain: string,
  service: string,
  serviceData?: Record<string, any>
) =>
  (domain === "menuai" && ["restart", "stop"].includes(service)) ||
  (domain === "update" &&
    service === "install" &&
    [
      "update.home_assistant_core_update",
      "update.home_assistant_operating_system_update",
    ].includes(serviceData?.entity_id));
