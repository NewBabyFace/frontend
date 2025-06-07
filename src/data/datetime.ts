import type { menuai } from "../types";

export const setDateTimeValue = (
  menuai: menuai,
  entityId: string,
  datetime: Date
) => {
  menuai.callService("datetime", "set_value", {
    entity_id: entityId,
    datetime: datetime.toISOString(),
  });
};
