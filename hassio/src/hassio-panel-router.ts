import { customElement, property } from "lit/decorators";
import type { Supervisor } from "../../src/data/supervisor/supervisor";
import type { RouterOptions } from "../../src/layouts/menuai-router-page";
import { menuaiRouterPage } from "../../src/layouts/menuai-router-page";
import type { menuai, Route } from "../../src/types";
// Don't codesplit it, that way the dashboard always loads fast.
import "./dashboard/menuaiio-dashboard";

@customElement("menuaiio-panel-router")
class menuaiioPanelRouter extends menuaiRouterPage {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: false }) public supervisor!: Supervisor;

  @property({ attribute: false }) public route!: Route;

  @property({ type: Boolean }) public narrow = false;

  protected routerOptions: RouterOptions = {
    beforeRender: (page: string) =>
      page === "snapshots" ? "backups" : undefined,
    routes: {
      dashboard: {
        tag: "menuaiio-dashboard",
      },
      store: {
        tag: "menuaiio-addon-store",
        load: () => import("./addon-store/menuaiio-addon-store"),
      },
      backups: {
        tag: "menuaiio-backups",
        load: () => import("./backups/menuaiio-backups"),
      },
      system: {
        tag: "menuaiio-system",
        load: () => import("./system/menuaiio-system"),
      },
    },
  };

  protected updatePageEl(el) {
    el.menuai = this.menuai;
    el.supervisor = this.supervisor;
    el.route = this.route;
    el.narrow = this.narrow;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "menuaiio-panel-router": menuaiioPanelRouter;
  }
}
