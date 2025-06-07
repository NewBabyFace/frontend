import type { PropertyValues } from "lit";
import type { menuaiDomEvent } from "../common/dom/fire_event";
import type { ActionConfigParams } from "../panels/lovelace/common/handle-action";
import { handleAction } from "../panels/lovelace/common/handle-action";
import type { Constructor } from "../types";
import type { menuaiBaseEl } from "./menuai-base-mixin";

declare global {
  // for fire event
  interface menuaiDomEvents {
    "menuai-action": { config: ActionConfigParams; action: string };
  }
}

export default <T extends Constructor<menuaiBaseEl>>(superClass: T) =>
  class extends superClass {
    protected firstUpdated(changedProps: PropertyValues) {
      super.firstUpdated(changedProps);
      this.addEventListener("menuai-action", (ev) => this._handleAction(ev));
    }

    private async _handleAction(
      ev: menuaiDomEvent<{ config: ActionConfigParams; action: string }>
    ) {
      if (!this.menuai) return;
      handleAction(this, this.menuai, ev.detail.config, ev.detail.action);
    }
  };
