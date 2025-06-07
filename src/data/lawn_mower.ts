import type {
  menuaiEntityAttributeBase,
  menuaiEntityBase,
} from "home-assistant-js-websocket";
import { UNAVAILABLE } from "./entity";

export type LawnMowerEntityState =
  | "paused"
  | "mowing"
  | "returning"
  | "docked"
  | "error";

export const enum LawnMowerEntityFeature {
  START_MOWING = 1,
  PAUSE = 2,
  DOCK = 4,
}

interface LawnMowerEntityAttributes
  extends menuaiEntityAttributeBase,
    Record<string, any> {}

export interface LawnMowerEntity extends menuaiEntityBase {
  attributes: LawnMowerEntityAttributes;
}

export function canStartMowing(stateObj: LawnMowerEntity): boolean {
  if (stateObj.state === UNAVAILABLE) {
    return false;
  }
  return stateObj.state !== "mowing";
}

export function canPause(stateObj: LawnMowerEntity): boolean {
  if (stateObj.state === UNAVAILABLE) {
    return false;
  }
  return stateObj.state !== "paused";
}

export function canDock(stateObj: LawnMowerEntity): boolean {
  if (stateObj.state === UNAVAILABLE) {
    return false;
  }
  return stateObj.state !== "docked";
}
