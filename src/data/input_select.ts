import type {
  menuaiEntityAttributeBase,
  menuaiEntityBase,
} from "home-assistant-js-websocket";
import type { menuai } from "../types";

interface InputSelectEntityAttributes extends menuaiEntityAttributeBase {
  options: string[];
}

export interface InputSelectEntity extends menuaiEntityBase {
  attributes: InputSelectEntityAttributes;
}

export interface InputSelect {
  id: string;
  name: string;
  options: string[];
  icon?: string;
  initial?: string;
}

export interface InputSelectMutableParams {
  name: string;
  icon: string;
  initial: string;
  options: string[];
}

export const setInputSelectOption = (
  menuai: menuai,
  entity: string,
  option: string
) =>
  menuai.callService("input_select", "select_option", {
    option,
    entity_id: entity,
  });

export const fetchInputSelect = (menuai: menuai) =>
  menuai.callWS<InputSelect[]>({ type: "input_select/list" });

export const createInputSelect = (
  menuai: menuai,
  values: InputSelectMutableParams
) =>
  menuai.callWS<InputSelect>({
    type: "input_select/create",
    ...values,
  });

export const updateInputSelect = (
  menuai: menuai,
  id: string,
  updates: Partial<InputSelectMutableParams>
) =>
  menuai.callWS<InputSelect>({
    type: "input_select/update",
    input_select_id: id,
    ...updates,
  });

export const deleteInputSelect = (menuai: menuai, id: string) =>
  menuai.callWS({
    type: "input_select/delete",
    input_select_id: id,
  });
