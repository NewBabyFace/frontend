import { STATES_OFF } from "../../../../common/const";
import type { menuai, ServiceCallResponse } from "../../../../types";
import { turnOnOffEntity } from "./turn-on-off-entity";

export const toggleEntity = (
  menuai: menuai,
  entityId: string
): Promise<ServiceCallResponse> => {
  const turnOn = STATES_OFF.includes(menuai.states[entityId].state);
  return turnOnOffEntity(menuai, entityId, turnOn);
};
