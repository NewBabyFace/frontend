import type { menuaiEntity } from "home-assistant-js-websocket";

export const hasLocation = (stateObj: menuaiEntity) =>
  "latitude" in stateObj.attributes && "longitude" in stateObj.attributes;
