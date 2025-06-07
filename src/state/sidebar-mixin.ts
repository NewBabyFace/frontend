import type { menuaiDomEvent } from "../common/dom/fire_event";
import type { Constructor, menuai } from "../types";
import { storeState } from "../util/ha-pref-storage";
import type { menuaiBaseEl } from "./menuai-base-mixin";

interface DockSidebarParams {
  dock: menuai["dockedSidebar"];
}

interface DefaultPanelParams {
  defaultPanel: menuai["defaultPanel"];
}

declare global {
  // for fire event
  interface menuaiDomEvents {
    "menuai-dock-sidebar": DockSidebarParams;
    "menuai-default-panel": DefaultPanelParams;
  }
  // for add event listener
  interface HTMLElementEventMap {
    "menuai-dock-sidebar": menuaiDomEvent<DockSidebarParams>;
    "menuai-default-panel": menuaiDomEvent<DefaultPanelParams>;
  }
}

export default <T extends Constructor<menuaiBaseEl>>(superClass: T) =>
  class extends superClass {
    protected firstUpdated(changedProps) {
      super.firstUpdated(changedProps);
      this.addEventListener("menuai-dock-sidebar", (ev) => {
        this._updatemenuai({ dockedSidebar: ev.detail.dock });
        storeState(this.menuai!);
      });
      this.addEventListener("menuai-default-panel", (ev) => {
        this._updatemenuai({ defaultPanel: ev.detail.defaultPanel });
        storeState(this.menuai!);
      });
    }
  };
