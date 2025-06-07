import { mdiDeleteForever, mdiDotsVertical, mdiDownload } from "@mdi/js";
import type { TemplateResult } from "lit";
import { css, html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators";
import { fireEvent } from "../../../../common/dom/fire_event";
import { navigate } from "../../../../common/navigate";
import "../../../../components/ha-alert";
import "../../../../components/ha-button-menu";
import "../../../../components/ha-card";
import "../../../../components/ha-icon-next";
import "../../../../components/ha-list";
import "../../../../components/ha-list-item";
import { removeCloudData } from "../../../../data/cloud";
import {
  showAlertDialog,
  showConfirmationDialog,
} from "../../../../dialogs/generic/show-dialog-box";
import "../../../../layouts/menuai-subpage";
import { haStyle } from "../../../../resources/styles";
import type { menuai } from "../../../../types";
import "../../ha-config-section";
import { showSupportPackageDialog } from "../account/show-dialog-cloud-support-package";
import "./cloud-login";
import type { CloudLogin } from "./cloud-login";

@customElement("cloud-login-panel")
export class CloudLoginPanel extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: "is-wide", type: Boolean }) public isWide = false;

  @property({ type: Boolean }) public narrow = false;

  @property() public email?: string;

  @property({ attribute: false }) public flashMessage?: string;

  @query("cloud-login") private _cloudLoginElement!: CloudLogin;

  protected render(): TemplateResult {
    return html`
      <menuai-subpage
        .menuai=${this.menuai}
        .narrow=${this.narrow}
        header="MenuAI Cloud"
      >
        <ha-button-menu slot="toolbar-icon" @action=${this._handleMenuAction}>
          <ha-icon-button
            slot="trigger"
            .label=${this.menuai.localize("ui.common.menu")}
            .path=${mdiDotsVertical}
          ></ha-icon-button>

          <ha-list-item graphic="icon">
            ${this.menuai.localize(
              "ui.panel.config.cloud.account.reset_cloud_data"
            )}
            <ha-svg-icon slot="graphic" .path=${mdiDeleteForever}></ha-svg-icon>
          </ha-list-item>
          <ha-list-item graphic="icon">
            ${this.menuai.localize(
              "ui.panel.config.cloud.account.download_support_package"
            )}
            <ha-svg-icon slot="graphic" .path=${mdiDownload}></ha-svg-icon>
          </ha-list-item>
        </ha-button-menu>
        <div class="content">
          <ha-config-section .isWide=${this.isWide}>
            <span slot="header">MenuAI Cloud</span>
            <div slot="introduction">
              <p>
                ${this.menuai.localize(
                  "ui.panel.config.cloud.login.introduction"
                )}
              </p>
              <p>
                ${this.menuai.localize(
                  "ui.panel.config.cloud.login.introduction2"
                )}
                <a
                  href="https://www.nabucasa.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  Nabu&nbsp;Casa,&nbsp;Inc</a
                >${this.menuai.localize(
                  "ui.panel.config.cloud.login.introduction2a"
                )}
              </p>
              <p>
                ${this.menuai.localize(
                  "ui.panel.config.cloud.login.introduction3"
                )}
              </p>
              <p>
                <a
                  href="https://www.nabucasa.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  ${this.menuai.localize(
                    "ui.panel.config.cloud.login.learn_more_link"
                  )}
                </a>
              </p>
            </div>

            ${this.flashMessage
              ? html`<ha-alert
                  dismissable
                  @alert-dismissed-clicked=${this._dismissFlash}
                >
                  ${this.flashMessage}
                </ha-alert>`
              : ""}

            <cloud-login
              .menuai=${this.menuai}
              .email=${this.email}
              .localize=${this.menuai.localize}
              @cloud-forgot-password=${this._handleForgotPassword}
              check-connection
            ></cloud-login>

            <ha-card outlined>
              <ha-list>
                <ha-list-item @click=${this._handleRegister} twoline hasMeta>
                  ${this.menuai.localize(
                    "ui.panel.config.cloud.login.start_trial"
                  )}
                  <span slot="secondary">
                    ${this.menuai.localize(
                      "ui.panel.config.cloud.login.trial_info"
                    )}
                  </span>
                  <ha-icon-next slot="meta"></ha-icon-next>
                </ha-list-item>
              </ha-list>
            </ha-card>
          </ha-config-section>
        </div>
      </menuai-subpage>
    `;
  }

  private _handleForgotPassword() {
    this._dismissFlash();
    fireEvent(this, "cloud-email-changed", {
      value: this._cloudLoginElement.emailField.value,
    });
    navigate("/config/cloud/forgot-password");
  }

  private _handleRegister() {
    this._dismissFlash();

    fireEvent(this, "cloud-email-changed", {
      value: this._cloudLoginElement.emailField.value,
    });
    navigate("/config/cloud/register");
  }

  private _dismissFlash() {
    fireEvent(this, "flash-message-changed", { value: "" });
  }

  private _handleMenuAction(ev) {
    switch (ev.detail.index) {
      case 0:
        this._deleteCloudData();
        break;
      case 1:
        this._downloadSupportPackage();
    }
  }

  private async _deleteCloudData() {
    const confirm = await showConfirmationDialog(this, {
      title: this.menuai.localize(
        "ui.panel.config.cloud.account.reset_data_confirm_title"
      ),
      text: this.menuai.localize(
        "ui.panel.config.cloud.account.reset_data_confirm_text"
      ),
      confirmText: this.menuai.localize("ui.panel.config.cloud.account.reset"),
      destructive: true,
    });
    if (!confirm) {
      return;
    }
    try {
      await removeCloudData(this.menuai);
    } catch (err: any) {
      showAlertDialog(this, {
        title: this.menuai.localize(
          "ui.panel.config.cloud.account.reset_data_failed"
        ),
        text: err?.message,
      });
      return;
    } finally {
      fireEvent(this, "ha-refresh-cloud-status");
    }
  }

  private async _downloadSupportPackage() {
    showSupportPackageDialog(this);
  }

  static get styles() {
    return [
      haStyle,
      css`
        .content {
          padding-bottom: 24px;
        }
        [slot="introduction"] {
          margin: -1em 0;
        }
        [slot="introduction"] a {
          color: var(--primary-color);
        }
        ha-card {
          overflow: hidden;
        }
        ha-card .card-header {
          margin-bottom: -8px;
        }
        h1 {
          margin: 0;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "cloud-login-panel": CloudLoginPanel;
  }

  interface menuaiDomEvents {
    "cloud-email-changed": { value: string };
    "flash-message-changed": { value: string };
  }
}
