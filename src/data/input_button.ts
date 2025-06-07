import type { menuai } from "../types";

export interface InputButton {
  id: string;
  name: string;
  icon?: string;
}

export interface InputButtonMutableParams {
  name: string;
  icon: string;
}

export const fetchInputButton = (menuai: menuai) =>
  menuai.callWS<InputButton[]>({ type: "input_button/list" });

export const createInputButton = (
  menuai: menuai,
  values: InputButtonMutableParams
) =>
  menuai.callWS<InputButton>({
    type: "input_button/create",
    ...values,
  });

export const updateInputButton = (
  menuai: menuai,
  id: string,
  updates: Partial<InputButtonMutableParams>
) =>
  menuai.callWS<InputButton>({
    type: "input_button/update",
    input_button_id: id,
    ...updates,
  });

export const deleteInputButton = (menuai: menuai, id: string) =>
  menuai.callWS({
    type: "input_button/delete",
    input_button_id: id,
  });
