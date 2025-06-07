import type { menuaiEntity } from "home-assistant-js-websocket";
import { computeDomain } from "./compute_domain";

export const computeStateDomain = (stateObj: menuaiEntity) =>
  computeDomain(stateObj.entity_id);
