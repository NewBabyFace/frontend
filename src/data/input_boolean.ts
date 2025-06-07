import type { menuai } from "../types";

export interface InputBoolean {
  id: string;
  name: string;
  icon?: string;
  initial?: boolean;
}

export interface InputBooleanMutableParams {
  name: string;
  icon: string;
  initial: boolean;
}

export const fetchInputBoolean = (menuai: menuai) =>
  menuai.callWS<InputBoolean[]>({ type: "input_boolean/list" });

export const createInputBoolean = (
  menuai: menuai,
  values: InputBooleanMutableParams
) =>
  menuai.callWS<InputBoolean>({
    type: "input_boolean/create",
    ...values,
  });

export const updateInputBoolean = (
  menuai: menuai,
  id: string,
  updates: Partial<InputBooleanMutableParams>
) =>
  menuai.callWS<InputBoolean>({
    type: "input_boolean/update",
    input_boolean_id: id,
    ...updates,
  });

export const deleteInputBoolean = (menuai: menuai, id: string) =>
  menuai.callWS({
    type: "input_boolean/delete",
    input_boolean_id: id,
  });
