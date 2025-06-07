import type { menuaiEntityBase } from "home-assistant-js-websocket";
import type { menuai } from "../types";

export const stateToIsoDateString = (entityState: menuaiEntityBase) =>
  `${entityState}T00:00:00`;

export const setDateValue = (
  menuai: menuai,
  entityId: string,
  date: string | undefined = undefined
) => {
  const param = { entity_id: entityId, date };
  menuai.callService("date", "set_value", param);
};
