import type { menuai } from "../types";

export interface InputText {
  id: string;
  name: string;
  icon?: string;
  initial?: string;
  min?: number;
  max?: number;
  pattern?: string;
  mode?: "text" | "password";
}

export interface InputTextMutableParams {
  name: string;
  icon: string;
  initial: string;
  min: number;
  max: number;
  pattern: string;
  mode: "text" | "password";
}

export const setValue = (menuai: menuai, entity: string, value: string) =>
  menuai.callService(entity.split(".", 1)[0], "set_value", {
    value,
    entity_id: entity,
  });

export const fetchInputText = (menuai: menuai) =>
  menuai.callWS<InputText[]>({ type: "input_text/list" });

export const createInputText = (
  menuai: menuai,
  values: InputTextMutableParams
) =>
  menuai.callWS<InputText>({
    type: "input_text/create",
    ...values,
  });

export const updateInputText = (
  menuai: menuai,
  id: string,
  updates: Partial<InputTextMutableParams>
) =>
  menuai.callWS<InputText>({
    type: "input_text/update",
    input_text_id: id,
    ...updates,
  });

export const deleteInputText = (menuai: menuai, id: string) =>
  menuai.callWS({
    type: "input_text/delete",
    input_text_id: id,
  });
