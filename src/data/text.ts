import type {
  menuaiEntityAttributeBase,
  menuaiEntityBase,
} from "home-assistant-js-websocket";
import type { menuai } from "../types";

interface TextEntityAttributes extends menuaiEntityAttributeBase {
  min?: number;
  max?: number;
  pattern?: string;
  mode?: "text" | "password";
}

export interface TextEntity extends menuaiEntityBase {
  attributes: TextEntityAttributes;
}

export const setValue = (menuai: menuai, entity: string, value: string) =>
  menuai.callService("text", "set_value", { value }, { entity_id: entity });
