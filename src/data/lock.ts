import type {
  menuaiEntityAttributeBase,
  menuaiEntityBase,
} from "home-assistant-js-websocket";
import { getExtendedEntityRegistryEntry } from "./entity_registry";
import { showEnterCodeDialog } from "../dialogs/enter-code/show-enter-code-dialog";
import type { menuai } from "../types";
import { UNAVAILABLE } from "./entity";

export const enum LockEntityFeature {
  OPEN = 1,
}

interface LockEntityAttributes extends menuaiEntityAttributeBase {
  code_format?: string;
  changed_by?: string | null;
}

export interface LockEntity extends menuaiEntityBase {
  attributes: LockEntityAttributes;
}

type ProtectedLockService = "lock" | "unlock" | "open";

export function isLocked(stateObj: LockEntity) {
  return stateObj.state === "locked";
}

export function isUnlocked(stateObj: LockEntity) {
  return stateObj.state === "unlocked";
}

export function isUnlocking(stateObj: LockEntity) {
  return stateObj.state === "unlocking";
}

export function isLocking(stateObj: LockEntity) {
  return stateObj.state === "locking";
}

export function isJammed(stateObj: LockEntity) {
  return stateObj.state === "jammed";
}

export function isOpen(stateObj: LockEntity) {
  return stateObj.state === "open";
}

export function isOpening(stateObj: LockEntity) {
  return stateObj.state === "opening";
}

export function isWaiting(stateObj: LockEntity) {
  return ["opening", "unlocking", "locking"].includes(stateObj.state);
}

export function canOpen(stateObj: LockEntity) {
  if (stateObj.state === UNAVAILABLE) {
    return false;
  }
  const assumedState = stateObj.attributes.assumed_state === true;
  return assumedState || (!isOpen(stateObj) && !isWaiting(stateObj));
}

export function canLock(stateObj: LockEntity) {
  if (stateObj.state === UNAVAILABLE) {
    return false;
  }
  const assumedState = stateObj.attributes.assumed_state === true;
  return assumedState || (!isLocked(stateObj) && !isWaiting(stateObj));
}

export function canUnlock(stateObj: LockEntity) {
  if (stateObj.state === UNAVAILABLE) {
    return false;
  }
  const assumedState = stateObj.attributes.assumed_state === true;
  return assumedState || (!isUnlocked(stateObj) && !isWaiting(stateObj));
}

export const callProtectedLockService = async (
  element: HTMLElement,
  menuai: menuai,
  stateObj: LockEntity,
  service: ProtectedLockService
) => {
  let code: string | undefined;
  const lockRegistryEntry = await getExtendedEntityRegistryEntry(
    menuai,
    stateObj.entity_id
  ).catch(() => undefined);
  const defaultCode = lockRegistryEntry?.options?.lock?.default_code;

  if (stateObj!.attributes.code_format && !defaultCode) {
    const response = await showEnterCodeDialog(element, {
      codeFormat: "text",
      codePattern: stateObj!.attributes.code_format,
      title: menuai.localize(`ui.card.lock.${service}`),
      submitText: menuai.localize(`ui.card.lock.${service}`),
    });
    if (response == null) {
      throw new Error("Code dialog closed");
    }
    code = response;
  }

  await menuai.callService("lock", service, {
    entity_id: stateObj!.entity_id,
    code,
  });
};
