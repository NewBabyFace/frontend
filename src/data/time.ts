import type { menuai } from "../types";

export const setTimeValue = (
  menuai: menuai,
  entityId: string,
  time: string | undefined = undefined
) => {
  const param = { entity_id: entityId, time: time };
  menuai.callService("time", "set_value", param);
};
