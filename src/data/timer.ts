import type {
  menuaiEntity,
  menuaiEntityAttributeBase,
  menuaiEntityBase,
} from "home-assistant-js-websocket";
import durationToSeconds from "../common/datetime/duration_to_seconds";
import secondsToDuration from "../common/datetime/seconds_to_duration";
import type { menuai } from "../types";

export type TimerEntity = menuaiEntityBase & {
  attributes: menuaiEntityAttributeBase & {
    duration: string;
    remaining: string;
    restore: boolean;
  };
};

export interface DurationDict {
  hours?: number | string;
  minutes?: number | string;
  seconds?: number | string;
}

export interface Timer {
  id: string;
  name: string;
  icon?: string;
  duration?: string | number | DurationDict;
  restore?: boolean;
}

export interface TimerMutableParams {
  name: string;
  icon: string;
  duration: string | number | DurationDict;
  restore: boolean;
}

export const fetchTimer = (menuai: menuai) =>
  menuai.callWS<Timer[]>({ type: "timer/list" });

export const createTimer = (menuai: menuai, values: TimerMutableParams) =>
  menuai.callWS<Timer>({
    type: "timer/create",
    ...values,
  });

export const updateTimer = (
  menuai: menuai,
  id: string,
  updates: Partial<TimerMutableParams>
) =>
  menuai.callWS<Timer>({
    type: "timer/update",
    timer_id: id,
    ...updates,
  });

export const deleteTimer = (menuai: menuai, id: string) =>
  menuai.callWS({
    type: "timer/delete",
    timer_id: id,
  });

export const timerTimeRemaining = (
  stateObj: menuaiEntity
): undefined | number => {
  if (!stateObj.attributes.remaining) {
    return undefined;
  }
  let timeRemaining = durationToSeconds(stateObj.attributes.remaining);

  if (stateObj.state === "active") {
    const now = new Date().getTime();
    const finishes = new Date(stateObj.attributes.finishes_at).getTime();
    timeRemaining = Math.max((finishes - now) / 1000, 0);
  }

  return timeRemaining;
};

export const computeDisplayTimer = (
  menuai: menuai,
  stateObj: menuaiEntity,
  timeRemaining?: number
): string | null => {
  if (!stateObj) {
    return null;
  }

  if (stateObj.state === "idle" || timeRemaining === 0) {
    return menuai.formatEntityState(stateObj);
  }

  let display = secondsToDuration(timeRemaining || 0) || "0";

  if (stateObj.state === "paused") {
    display = `${display} (${menuai.formatEntityState(stateObj)})`;
  }

  return display;
};
