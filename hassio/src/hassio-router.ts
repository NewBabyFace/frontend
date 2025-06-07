import { customElement, property } from "lit/decorators";
import memoizeOne from "memoize-one";
import type { menuaiioPanelInfo } from "../../src/data/menuaiio/supervisor";
import type { Supervisor } from "../../src/data/supervisor/supervisor";
import type { RouterOptions } from "../../src/layouts/menuai-router-page";
import { menuaiRouterPage } from "../../src/layouts/menuai-router-page";
import type { menuai } from "../../src/types";
// Don't codesplit it, that way the dashboard always loads fast.
import "./menuaiio-panel";

@customElement("menuaiio-router")
class menuaiioRouter extends menuaiRouterPage {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: false }) public supervisor!: Supervisor;

  @property({ attribute: false }) public panel!: menuaiioPanelInfo;

  @property({ type: Boolean }) public narrow = false;

  protected routerOptions: RouterOptions = {
    // menuai.io has a page with tabs, so we route all non-matching routes to it.
    defaultPage: "dashboard",
    beforeRender: (page: string) => {
      if (page === "snapshots") {
        return "backups";
      }
      if (page === "dashboard" && this.panel.config?.ingress) {
        return "ingress";
      }
      return undefined;
    },
    showLoading: true,
    routes: {
      dashboard: {
        tag: "menuaiio-panel",
        cache: true,
      },
      backups: "dashboard",
      store: "dashboard",
      system: "dashboard",
      "update-available": {
        tag: "update-available-dashboard",
        load: () => import("./update-available/update-available-dashboard"),
      },
      addon: {
        tag: "menuaiio-addon-dashboard",
        load: () => import("./addon-view/menuaiio-addon-dashboard"),
      },
      ingress: {
        tag: "menuaiio-ingress-view",
        load: () => import("./ingress-view/menuaiio-ingress-view"),
      },
      _my_redirect: {
        tag: "menuaiio-my-redirect",
        load: () => import("./menuaiio-my-redirect"),
      },
    },
  };

  protected updatePageEl(el) {
    // the tabs page does its own routing so needs full route.
    const menuaiioPanel = el.localName === "menuaiio-panel";
    const ingressPanel = el.localName === "menuaiio-ingress-view";
    const route = menuaiioPanel
      ? this.route
      : ingressPanel && this.panel.config?.ingress
        ? this._ingressRoute(this.panel.config?.ingress)
        : this.routeTail;

    el.menuai = this.menuai;
    el.narrow = this.narrow;
    el.route = route;
    el.supervisor = this.supervisor;

    if (ingressPanel) {
      el.ingressPanel = Boolean(this.panel.config?.ingress);
    }
  }

  private _ingressRoute = memoizeOne((ingress: string) => ({
    prefix: "/menuaiio/ingress",
    path: `/${ingress}`,
  }));
}

declare global {
  interface HTMLElementTagNameMap {
    "menuaiio-router": menuaiioRouter;
  }
}
