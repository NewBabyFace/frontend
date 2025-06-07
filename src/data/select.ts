import type {
  menuaiEntityAttributeBase,
  menuaiEntityBase,
} from "home-assistant-js-websocket";
import type { menuai } from "../types";

interface SelectEntityAttributes extends menuaiEntityAttributeBase {
  options: string[];
}

export interface SelectEntity extends menuaiEntityBase {
  attributes: SelectEntityAttributes;
}

export const setSelectOption = (
  menuai: menuai,
  entity: string,
  option: string
) =>
  menuai.callService(
    "select",
    "select_option",
    { option },
    { entity_id: entity }
  );
