import type { menuaiEntity } from "home-assistant-js-websocket";
import type { PropertyValues } from "lit";
import { html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators";
import type { PersistentNotification } from "../../data/persistent_notification";
import type { menuai } from "../../types";
import "./configurator-notification-item";
import "./persistent-notification-item";

@customElement("notification-item")
export class HuiNotificationItem extends LitElement {
  @property({ attribute: false }) public menuai?: menuai;

  @property({ attribute: false })
  public notification?: menuaiEntity | PersistentNotification;

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    if (!this.menuai || !this.notification || changedProps.has("notification")) {
      return true;
    }

    return false;
  }

  protected render() {
    if (!this.menuai || !this.notification) {
      return nothing;
    }

    return "entity_id" in this.notification
      ? html`
          <configurator-notification-item
            .menuai=${this.menuai}
            .notification=${this.notification}
          ></configurator-notification-item>
        `
      : html`
          <persistent-notification-item
            .menuai=${this.menuai}
            .notification=${this.notification}
          ></persistent-notification-item>
        `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "notification-item": HuiNotificationItem;
  }
}
