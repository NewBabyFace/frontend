import type { PropertyValues } from "lit";
import { html } from "lit";
import { customElement, property } from "lit/decorators";
import { atLeastVersion } from "../../src/common/config/version";
import { applyThemesOnElement } from "../../src/common/dom/apply_themes_on_element";
import { fireEvent } from "../../src/common/dom/fire_event";
import { mainWindow } from "../../src/common/dom/get_main_window";
import { isNavigationClick } from "../../src/common/dom/is-navigation-click";
import { navigate } from "../../src/common/navigate";
import type { menuaiioPanelInfo } from "../../src/data/menuaiio/supervisor";
import type { Supervisor } from "../../src/data/supervisor/supervisor";
import { makeDialogManager } from "../../src/dialogs/make-dialog-manager";
import type { menuai } from "../../src/types";
import "./menuaiio-router";
import { SupervisorBaseElement } from "./supervisor-base-element";

@customElement("menuaiio-main")
export class menuaiioMain extends SupervisorBaseElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: false }) public supervisor!: Supervisor;

  @property({ attribute: false }) public panel!: menuaiioPanelInfo;

  @property({ type: Boolean }) public narrow = false;

  protected firstUpdated(changedProps: PropertyValues) {
    super.firstUpdated(changedProps);

    this._applyTheme();

    // Paulus - March 17, 2019
    // We went to a single menuai-toggle-menu event in HA 0.90. However, the
    // supervisor UI can also run under older versions of MenuAI.
    // So here we are going to translate toggle events into the appropriate
    // open and close events. These events are a no-op in newer versions of
    // MenuAI.
    this.addEventListener("menuai-toggle-menu", () => {
      fireEvent(
        (window.parent as any).customPanel,
        // @ts-ignore
        this.menuai.dockedSidebar ? "menuai-close-menu" : "menuai-open-menu"
      );
    });
    // Paulus - March 19, 2019
    // We changed the navigate event to fire directly on the window, as that's
    // where we are listening for it. However, the older panel_custom will
    // listen on this element for navigation events, so we need to forward them.

    // Joakim - April 26, 2021
    // Due to changes in behavior in Google Chrome, we changed navigate to listen on the top element
    mainWindow.addEventListener("location-changed", (ev) =>
      // @ts-ignore
      fireEvent(this, ev.type, ev.detail, {
        bubbles: false,
      })
    );

    // Paulus - May 17, 2021
    // Convert the <a> tags to native nav in MenuAI < 2021.6
    document.body.addEventListener("click", (ev) => {
      const href = isNavigationClick(ev);
      if (href) {
        navigate(href);
      }
    });

    // Forward haptic events to parent window.
    window.addEventListener("haptic", (ev) => {
      // @ts-ignore
      fireEvent(window.parent, ev.type, ev.detail, {
        bubbles: false,
      });
    });

    // Forward keydown events to the main window for quickbar access
    document.body.addEventListener("keydown", (ev: KeyboardEvent) => {
      if (ev.altKey || ev.ctrlKey || ev.shiftKey || ev.metaKey) {
        // Ignore if modifier keys are pressed
        return;
      }
      // @ts-ignore
      fireEvent(mainWindow, "menuai-quick-bar-trigger", ev, {
        bubbles: false,
      });
    });

    makeDialogManager(this, this.shadowRoot!);
  }

  protected updated(changedProps: PropertyValues) {
    super.updated(changedProps);
    const oldmenuai = changedProps.get("menuai") as menuai | undefined;
    if (!oldmenuai) {
      return;
    }
    if (oldmenuai.themes !== this.menuai.themes) {
      this._applyTheme();
    }
  }

  protected render() {
    return html`
      <menuaiio-router
        .menuai=${this.menuai}
        .supervisor=${this.supervisor}
        .route=${this.route}
        .panel=${this.panel}
        .narrow=${this.narrow}
      ></menuaiio-router>
    `;
  }

  private _applyTheme() {
    let themeName: string;
    let themeSettings: Partial<menuai["selectedTheme"]> | undefined;

    if (atLeastVersion(this.menuai.config.version, 0, 114)) {
      themeName =
        this.menuai.selectedTheme?.theme ||
        (this.menuai.themes.darkMode && this.menuai.themes.default_dark_theme
          ? this.menuai.themes.default_dark_theme!
          : this.menuai.themes.default_theme);

      themeSettings = this.menuai.selectedTheme;
    } else {
      themeName =
        (this.menuai.selectedTheme as unknown as string) ||
        this.menuai.themes.default_theme;
    }

    applyThemesOnElement(
      this.parentElement,
      this.menuai.themes,
      themeName,
      themeSettings,
      true
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "menuaiio-main": menuaiioMain;
  }
}
