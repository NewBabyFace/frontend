import { mdiMenu } from "@mdi/js";
import type { UnsubscribeFunc } from "home-assistant-js-websocket";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators";
import { fireEvent } from "../common/dom/fire_event";
import { subscribeNotifications } from "../data/persistent_notification";
import type { menuai } from "../types";
import "./ha-icon-button";

@customElement("ha-menu-button")
class HaMenuButton extends LitElement {
  @property({ type: Boolean }) public menuaiio = false;

  @property({ type: Boolean }) public narrow = false;

  @property({ attribute: false }) public menuai!: menuai;

  @state() private _hasNotifications = false;

  @state() private _show = false;

  private _alwaysVisible = false;

  private _attachNotifOnConnect = false;

  private _unsubNotifications?: UnsubscribeFunc;

  public connectedCallback() {
    super.connectedCallback();
    if (this._attachNotifOnConnect) {
      this._attachNotifOnConnect = false;
      this._subscribeNotifications();
    }
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    if (this._unsubNotifications) {
      this._attachNotifOnConnect = true;
      this._unsubNotifications();
      this._unsubNotifications = undefined;
    }
  }

  protected render() {
    if (!this._show) {
      return nothing;
    }
    const hasNotifications =
      this._hasNotifications &&
      (this.narrow || this.menuai.dockedSidebar === "always_hidden");
    return html`
      <ha-icon-button
        .label=${this.menuai.localize("ui.sidebar.sidebar_toggle")}
        .path=${mdiMenu}
        @click=${this._toggleMenu}
      ></ha-icon-button>
      ${hasNotifications ? html`<div class="dot"></div>` : ""}
    `;
  }

  protected firstUpdated(changedProps) {
    super.firstUpdated(changedProps);
    if (!this.menuaiio) {
      return;
    }
    // This component is used on menuai.io too, but menuai.io might run the UI
    // on older frontends too, that don't have an always visible menu button
    // in the sidebar.
    this._alwaysVisible =
      (Number((window.parent as any).frontendVersion) || 0) < 20190710;
  }

  protected willUpdate(changedProps) {
    super.willUpdate(changedProps);

    if (!changedProps.has("narrow") && !changedProps.has("menuai")) {
      return;
    }

    const oldmenuai = changedProps.has("menuai")
      ? (changedProps.get("menuai") as menuai | undefined)
      : this.menuai;
    const oldNarrow = changedProps.has("narrow")
      ? (changedProps.get("narrow") as boolean | undefined)
      : this.narrow;

    const oldShowButton =
      oldNarrow || oldmenuai?.dockedSidebar === "always_hidden";
    const showButton =
      this.narrow || this.menuai.dockedSidebar === "always_hidden";

    if (this.hasUpdated && oldShowButton === showButton) {
      return;
    }

    this._show = showButton || this._alwaysVisible;

    if (!showButton) {
      if (this._unsubNotifications) {
        this._unsubNotifications();
        this._unsubNotifications = undefined;
      }
      return;
    }

    this._subscribeNotifications();
  }

  private _subscribeNotifications() {
    if (this._unsubNotifications) {
      throw new Error("Already subscribed");
    }
    this._unsubNotifications = subscribeNotifications(
      this.menuai.connection,
      (notifications) => {
        this._hasNotifications = notifications.length > 0;
      }
    );
  }

  private _toggleMenu(): void {
    fireEvent(this, "menuai-toggle-menu");
  }

  static styles = css`
    :host {
      position: relative;
    }
    .dot {
      pointer-events: none;
      position: absolute;
      background-color: var(--accent-color);
      width: 12px;
      height: 12px;
      top: 9px;
      right: 7px;
      inset-inline-end: 7px;
      inset-inline-start: initial;
      border-radius: 50%;
      border: 2px solid var(--app-header-background-color);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-menu-button": HaMenuButton;
  }
}
