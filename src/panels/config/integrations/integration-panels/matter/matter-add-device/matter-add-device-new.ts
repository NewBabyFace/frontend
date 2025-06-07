import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators";
import "../../../../../../components/ha-spinner";
import {
  canCommissionMatterExternal,
  startExternalCommissioning,
} from "../../../../../../data/matter";
import type { menuai } from "../../../../../../types";
import { sharedStyles } from "./matter-add-device-shared-styles";

@customElement("matter-add-device-new")
class MatterAddDeviceNew extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  protected firstUpdated(): void {
    if (!canCommissionMatterExternal(this.menuai)) {
      return;
    }
    startExternalCommissioning(this.menuai);
  }

  render() {
    if (canCommissionMatterExternal(this.menuai)) {
      return html`
        <div class="content">
          <ha-spinner size="medium"></ha-spinner>
        </div>
      `;
    }

    return html`
      <div class="content">
        <p>${this.menuai.localize("ui.dialogs.matter-add-device.new.note")}</p>
        <p>
          ${this.menuai.localize("ui.dialogs.matter-add-device.new.download_app")}
        </p>
        <div class="app-qr">
          <a
            target="_blank"
            rel="noreferrer noopener"
            href="https://apps.apple.com/app/home-assistant/id1099568401?mt=8"
          >
            <img
              loading="lazy"
              src="/static/images/appstore.svg"
              alt=${this.menuai.localize(
                "ui.dialogs.matter-add-device.new.appstore"
              )}
              class="icon"
            />
            <img
              loading="lazy"
              src="/static/images/qr-appstore.svg"
              alt=${this.menuai.localize(
                "ui.dialogs.matter-add-device.new.appstore"
              )}
            />
          </a>
          <a
            target="_blank"
            rel="noreferrer noopener"
            href="https://play.google.com/store/apps/details?id=io.menuai.companion.android"
          >
            <img
              loading="lazy"
              src="/static/images/playstore.svg"
              alt=${this.menuai.localize(
                "ui.dialogs.matter-add-device.new.playstore"
              )}
              class="icon"
            />
            <img
              loading="lazy"
              src="/static/images/qr-playstore.svg"
              alt=${this.menuai.localize(
                "ui.dialogs.matter-add-device.new.playstore"
              )}
            />
          </a>
        </div>
      </div>
    `;
  }

  static styles = [
    sharedStyles,
    css`
      .app-qr {
        margin: 24px auto 0 auto;
        display: flex;
        justify-content: space-between;
        padding: 0 24px;
        box-sizing: border-box;
        gap: 16px;
        width: 100%;
        max-width: 400px;
      }
      .app-qr a,
      .app-qr img {
        flex: 1;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "matter-add-device-new": MatterAddDeviceNew;
  }
}
