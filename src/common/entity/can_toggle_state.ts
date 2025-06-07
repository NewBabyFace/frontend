import type { menuaiEntity } from "home-assistant-js-websocket";
import type { menuai } from "../../types";
import { canToggleDomain } from "./can_toggle_domain";
import { computeStateDomain } from "./compute_state_domain";
import { supportsFeature } from "./supports-feature";

export const canToggleState = (menuai: menuai, stateObj: menuaiEntity) => {
  const domain = computeStateDomain(stateObj);

  if (domain === "group") {
    if (
      stateObj.attributes?.entity_id?.some((entity) => {
        const entityStateObj = menuai.states[entity];
        if (!entityStateObj) {
          return false;
        }

        const entityDomain = computeStateDomain(entityStateObj);
        return canToggleDomain(menuai, entityDomain);
      })
    ) {
      return stateObj.state === "on" || stateObj.state === "off";
    }

    return false;
  }

  if (domain === "climate") {
    return supportsFeature(stateObj, 4096);
  }

  return canToggleDomain(menuai, domain);
};
