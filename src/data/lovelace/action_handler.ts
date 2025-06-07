import type { menuaiDomEvent } from "../../common/dom/fire_event";

export interface ActionHandlerOptions {
  hasHold?: boolean;
  hasDoubleClick?: boolean;
  disabled?: boolean;
}

export interface ActionHandlerDetail {
  action: "hold" | "tap" | "double_tap";
}

export type ActionHandlerEvent = menuaiDomEvent<ActionHandlerDetail>;
