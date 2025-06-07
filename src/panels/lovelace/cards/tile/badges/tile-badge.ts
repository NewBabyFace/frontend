import { mdiExclamationThick } from "@mdi/js";
import type { menuaiEntity } from "home-assistant-js-websocket";
import type { TemplateResult } from "lit";
import { html, nothing } from "lit";
import { styleMap } from "lit/directives/style-map";
import { computeDomain } from "../../../../../common/entity/compute_domain";
import { UNAVAILABLE, UNKNOWN } from "../../../../../data/entity";
import type { menuai } from "../../../../../types";
import { renderClimateBadge } from "./tile-badge-climate";
import { renderHumidifierBadge } from "./tile-badge-humidifier";
import { renderPersonBadge } from "./tile-badge-person";
import "../../../../../components/tile/ha-tile-badge";
import "../../../../../components/ha-svg-icon";

export type RenderBadgeFunction = (
  stateObj: menuaiEntity,
  menuai: menuai
) => TemplateResult | typeof nothing;

export const renderTileBadge: RenderBadgeFunction = (stateObj, menuai) => {
  if (stateObj.state === UNKNOWN) {
    return nothing;
  }
  if (stateObj.state === UNAVAILABLE) {
    return html`
      <ha-tile-badge
        style=${styleMap({
          "--tile-badge-background-color": "var(--orange-color)",
        })}
      >
        <ha-svg-icon .path=${mdiExclamationThick}></ha-svg-icon>
      </ha-tile-badge>
    `;
  }
  const domain = computeDomain(stateObj.entity_id);
  switch (domain) {
    case "person":
    case "device_tracker":
      return renderPersonBadge(stateObj, menuai);
    case "climate":
      return renderClimateBadge(stateObj, menuai);
    case "humidifier":
      return renderHumidifierBadge(stateObj, menuai);
    default:
      return nothing;
  }
};
