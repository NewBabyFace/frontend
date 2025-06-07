import type { menuaiEntity } from "home-assistant-js-websocket";
import type { menuai } from "../types";

export interface InputDateTime {
  id: string;
  name: string;
  icon?: string;
  initial?: string;
  has_time: boolean;
  has_date: boolean;
}

export interface InputDateTimeMutableParams {
  name: string;
  icon: string;
  initial: string;
  has_time: boolean;
  has_date: boolean;
}

export const stateToIsoDateString = (entityState: menuaiEntity) =>
  `${entityState.attributes.year || "1970"}-${String(
    entityState.attributes.month || "01"
  ).padStart(2, "0")}-${String(entityState.attributes.day || "01").padStart(
    2,
    "0"
  )}T${String(entityState.attributes.hour || "00").padStart(2, "0")}:${String(
    entityState.attributes.minute || "00"
  ).padStart(2, "0")}:${String(entityState.attributes.second || "00").padStart(
    2,
    "0"
  )}`;

export const setInputDateTimeValue = (
  menuai: menuai,
  entityId: string,
  time: string | undefined = undefined,
  date: string | undefined = undefined
) => {
  const param = { entity_id: entityId, time, date };
  menuai.callService("input_datetime", "set_datetime", param);
};

export const fetchInputDateTime = (menuai: menuai) =>
  menuai.callWS<InputDateTime[]>({ type: "input_datetime/list" });

export const createInputDateTime = (
  menuai: menuai,
  values: InputDateTimeMutableParams
) =>
  menuai.callWS<InputDateTime>({
    type: "input_datetime/create",
    ...values,
  });

export const updateInputDateTime = (
  menuai: menuai,
  id: string,
  updates: Partial<InputDateTimeMutableParams>
) =>
  menuai.callWS<InputDateTime>({
    type: "input_datetime/update",
    input_datetime_id: id,
    ...updates,
  });

export const deleteInputDateTime = (menuai: menuai, id: string) =>
  menuai.callWS({
    type: "input_datetime/delete",
    input_datetime_id: id,
  });
