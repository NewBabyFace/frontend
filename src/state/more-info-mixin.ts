import type { PropertyValues } from "lit";
import type { menuaiDomEvent } from "../common/dom/fire_event";
import { showDialog } from "../dialogs/make-dialog-manager";
import type { MoreInfoDialogParams } from "../dialogs/more-info/ha-more-info-dialog";
import type { Constructor } from "../types";
import type { menuaiBaseEl } from "./menuai-base-mixin";

declare global {
  // for fire event
  interface menuaiDomEvents {
    "menuai-more-info": MoreInfoDialogParams;
  }
}

export default <T extends Constructor<menuaiBaseEl>>(superClass: T) =>
  class extends superClass {
    protected firstUpdated(changedProps: PropertyValues) {
      super.firstUpdated(changedProps);
      this.addEventListener("menuai-more-info", (ev) => this._handleMoreInfo(ev));

      // Load it once we are having the initial rendering done.
      import("../dialogs/more-info/ha-more-info-dialog");
    }

    private async _handleMoreInfo(ev: menuaiDomEvent<MoreInfoDialogParams>) {
      showDialog(
        this,
        this.shadowRoot!,
        "ha-more-info-dialog",
        {
          entityId: ev.detail.entityId,
          view: ev.detail.view || ev.detail.tab,
        },
        () => import("../dialogs/more-info/ha-more-info-dialog")
      );
    }
  };
