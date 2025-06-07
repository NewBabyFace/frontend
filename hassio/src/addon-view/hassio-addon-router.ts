import { customElement, property } from "lit/decorators";
import type { menuaiioAddonDetails } from "../../../src/data/menuaiio/addon";
import type { StoreAddonDetails } from "../../../src/data/supervisor/store";
import type { Supervisor } from "../../../src/data/supervisor/supervisor";
import type { RouterOptions } from "../../../src/layouts/menuai-router-page";
import { menuaiRouterPage } from "../../../src/layouts/menuai-router-page";
import type { menuai } from "../../../src/types";
import "./config/menuaiio-addon-config-tab";
import "./documentation/menuaiio-addon-documentation-tab";
// Don't codesplit the others, because it breaks the UI when pushed to a Pi
import "./info/menuaiio-addon-info-tab";
import "./log/menuaiio-addon-log-tab";

@customElement("menuaiio-addon-router")
class menuaiioAddonRouter extends menuaiRouterPage {
  @property({ type: Boolean }) public narrow = false;

  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: false }) public supervisor!: Supervisor;

  @property({ attribute: false }) public addon!:
    | menuaiioAddonDetails
    | StoreAddonDetails;

  @property({ type: Boolean, attribute: "control-enabled" })
  public controlEnabled = false;

  protected routerOptions: RouterOptions = {
    defaultPage: "info",
    showLoading: true,
    routes: {
      info: {
        tag: "menuaiio-addon-info-tab",
      },
      documentation: {
        tag: "menuaiio-addon-documentation-tab",
      },
      config: {
        tag: "menuaiio-addon-config-tab",
      },
      logs: {
        tag: "menuaiio-addon-log-tab",
      },
    },
  };

  protected updatePageEl(el) {
    el.route = this.routeTail;
    el.menuai = this.menuai;
    el.supervisor = this.supervisor;
    el.addon = this.addon;
    el.narrow = this.narrow;
    el.controlEnabled = this.controlEnabled;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "menuaiio-addon-router": menuaiioAddonRouter;
  }
}
