/** Return an icon representing a cover state. */
import {
  mdiArrowCollapseHorizontal,
  mdiArrowDown,
  mdiArrowExpandHorizontal,
  mdiArrowUp,
} from "@mdi/js";
import type { menuaiEntity } from "home-assistant-js-websocket";

export const computeOpenIcon = (stateObj: menuaiEntity): string => {
  switch (stateObj.attributes.device_class) {
    case "awning":
    case "door":
    case "gate":
    case "curtain":
      return mdiArrowExpandHorizontal;
    default:
      return mdiArrowUp;
  }
};

export const computeCloseIcon = (stateObj: menuaiEntity): string => {
  switch (stateObj.attributes.device_class) {
    case "awning":
    case "door":
    case "gate":
    case "curtain":
      return mdiArrowCollapseHorizontal;
    default:
      return mdiArrowDown;
  }
};
