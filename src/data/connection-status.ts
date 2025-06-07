/**
 * Broadcast connection status updates
 */

import type { menuaiDomEvent } from "../common/dom/fire_event";
import { fireEvent } from "../common/dom/fire_event";

export type ConnectionStatus = "connected" | "auth-invalid" | "disconnected";

declare global {
  // for fire event
  interface menuaiDomEvents {
    "connection-status": ConnectionStatus;
  }

  interface GlobalEventHandlersEventMap {
    "connection-status": menuaiDomEvent<ConnectionStatus>;
  }
}

export const broadcastConnectionStatus = (status: ConnectionStatus) => {
  fireEvent(window, "connection-status", status);
};
