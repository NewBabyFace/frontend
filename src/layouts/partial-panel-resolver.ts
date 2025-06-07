import {
  STATE_NOT_RUNNING,
  STATE_RUNNING,
  STATE_STARTING,
} from "home-assistant-js-websocket";
import type { PropertyValues } from "lit";
import { customElement, property } from "lit/decorators";
import { deepActiveElement } from "../common/dom/deep-active-element";
import { deepEqual } from "../common/util/deep-equal";
import { getDefaultPanel } from "../data/panel";
import type { CustomPanelInfo } from "../data/panel_custom";
import type { menuai, Panels } from "../types";
import { removeLaunchScreen } from "../util/launch-screen";
import type { RouteOptions, RouterOptions } from "./menuai-router-page";
import { menuaiRouterPage } from "./menuai-router-page";

const CACHE_URL_PATHS = ["lovelace", "developer-tools"];
const COMPONENTS = {
  energy: () => import("../panels/energy/ha-panel-energy"),
  calendar: () => import("../panels/calendar/ha-panel-calendar"),
  config: () => import("../panels/config/ha-panel-config"),
  custom: () => import("../panels/custom/ha-panel-custom"),
  "developer-tools": () =>
    import("../panels/developer-tools/ha-panel-developer-tools"),
  lovelace: () => import("../panels/lovelace/ha-panel-lovelace"),
  history: () => import("../panels/history/ha-panel-history"),
  iframe: () => import("../panels/iframe/ha-panel-iframe"),
  logbook: () => import("../panels/logbook/ha-panel-logbook"),
  map: () => import("../panels/map/ha-panel-map"),
  my: () => import("../panels/my/ha-panel-my"),
  profile: () => import("../panels/profile/ha-panel-profile"),
  todo: () => import("../panels/todo/ha-panel-todo"),
  "media-browser": () =>
    import("../panels/media-browser/ha-panel-media-browser"),
};

@customElement("partial-panel-resolver")
class PartialPanelResolver extends menuaiRouterPage {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ type: Boolean }) public narrow = false;

  private _waitForStart = false;

  private _disconnectedPanel?: HTMLElement;

  private _disconnectedActiveElement?: HTMLElement;

  private _hiddenTimeout?: number;

  protected firstUpdated(changedProps: PropertyValues) {
    super.firstUpdated(changedProps);

    // Attach listeners for visibility
    document.addEventListener(
      "visibilitychange",
      () => this._checkVisibility(),
      false
    );
    document.addEventListener("resume", () => this._checkVisibility());
  }

  public willUpdate(changedProps: PropertyValues) {
    super.willUpdate(changedProps);

    if (!changedProps.has("menuai")) {
      return;
    }

    const oldmenuai = changedProps.get("menuai") as this["menuai"];

    if (
      this._waitForStart &&
      (this.menuai.config.state === STATE_STARTING ||
        this.menuai.config.state === STATE_RUNNING)
    ) {
      this._waitForStart = false;
      this.rebuild();
    }

    if (this.menuai.panels && (!oldmenuai || oldmenuai.panels !== this.menuai.panels)) {
      this._updateRoutes(oldmenuai?.panels);
    }
  }

  protected createLoadingScreen() {
    const el = super.createLoadingScreen();
    el.rootnav = true;
    el.menuai = this.menuai;
    el.narrow = this.narrow;
    return el;
  }

  protected updatePageEl(el) {
    const menuai = this.menuai;

    el.menuai = menuai;
    el.narrow = this.narrow;
    el.route = this.routeTail;
    el.panel = menuai.panels[this._currentPage];
  }

  private _checkVisibility() {
    if (this.menuai.suspendWhenHidden === false) {
      return;
    }

    if (document.hidden) {
      this._onHidden();
    } else {
      this._onVisible();
    }
  }

  private _getRoutes(panels: Panels): RouterOptions {
    const routes: RouterOptions["routes"] = {};
    Object.values(panels).forEach((panel) => {
      const data: RouteOptions = {
        tag: `ha-panel-${panel.component_name}`,
        cache: CACHE_URL_PATHS.includes(panel.url_path),
      };
      if (panel.component_name in COMPONENTS) {
        data.load = COMPONENTS[panel.component_name];
      }
      routes[panel.url_path] = data;
    });

    return {
      beforeRender: (page) => {
        if (!page || !routes[page]) {
          return getDefaultPanel(this.menuai).url_path;
        }
        return undefined;
      },
      showLoading: true,
      routes,
    };
  }

  private _onHidden() {
    this._hiddenTimeout = window.setTimeout(() => {
      this._hiddenTimeout = undefined;
      // setTimeout can be delayed in the background and only fire
      // when we switch to the tab or app again (Hey Android!)
      if (!document.hidden) {
        return;
      }
      const curPanel = this.menuai.panels[this._currentPage];
      if (
        this.lastChild &&
        // iFrames will lose their state when disconnected
        // Do not disconnect any iframe panel
        curPanel.component_name !== "iframe" &&
        // Do not disconnect any custom panel that embeds into iframe (ie menuaiio)
        (curPanel.component_name !== "custom" ||
          !(curPanel as CustomPanelInfo).config._panel_custom.embed_iframe)
      ) {
        this._disconnectedPanel = this.lastChild as HTMLElement;
        const activeEl = deepActiveElement(
          this._disconnectedPanel.shadowRoot || undefined
        );
        if (activeEl instanceof HTMLElement) {
          this._disconnectedActiveElement = activeEl;
        }
        this.removeChild(this.lastChild);
      }
    }, 300000);
    window.addEventListener("focus", () => this._onVisible(), { once: true });
  }

  private _onVisible() {
    if (this._hiddenTimeout) {
      clearTimeout(this._hiddenTimeout);
      this._hiddenTimeout = undefined;
    }
    if (this._disconnectedPanel) {
      this.appendChild(this._disconnectedPanel);
      this._disconnectedPanel = undefined;
    }
    if (this._disconnectedActiveElement) {
      this._disconnectedActiveElement.focus();
      this._disconnectedActiveElement = undefined;
    }
  }

  private async _updateRoutes(oldPanels?: menuai["panels"]) {
    this.routerOptions = this._getRoutes(this.menuai.panels);

    if (
      !this._waitForStart &&
      this._currentPage &&
      !this.menuai.panels[this._currentPage]
    ) {
      if (this.menuai.config.state === STATE_NOT_RUNNING) {
        this._waitForStart = true;
        if (this.lastChild) {
          this.removeChild(this.lastChild);
        }
        this.appendChild(this.createLoadingScreen());
        return;
      }
    }

    if (
      !oldPanels ||
      !deepEqual(
        oldPanels[this._currentPage],
        this.menuai.panels[this._currentPage]
      )
    ) {
      await this.rebuild();
      await this.pageRendered;
      removeLaunchScreen();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "partial-panel-resolver": PartialPanelResolver;
  }
}
