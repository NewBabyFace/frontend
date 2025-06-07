import "@material/mwc-button";
import { mdiDeleteForever, mdiDotsVertical, mdiDownload } from "@mdi/js";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators";
import { formatDateTime } from "../../../../common/datetime/format_date_time";
import { fireEvent } from "../../../../common/dom/fire_event";
import { debounce } from "../../../../common/util/debounce";
import "../../../../components/ha-alert";
import "../../../../components/ha-button-menu";
import "../../../../components/ha-card";
import "../../../../components/ha-list-item";
import "../../../../components/ha-tip";
import type {
  CloudStatusLoggedIn,
  SubscriptionInfo,
} from "../../../../data/cloud";
import {
  cloudLogout,
  fetchCloudSubscriptionInfo,
  removeCloudData,
} from "../../../../data/cloud";
import {
  showAlertDialog,
  showConfirmationDialog,
} from "../../../../dialogs/generic/show-dialog-box";
import "../../../../layouts/menuai-subpage";
import { SubscribeMixin } from "../../../../mixins/subscribe-mixin";
import { haStyle } from "../../../../resources/styles";
import type { menuai } from "../../../../types";
import "../../ha-config-section";
import "./cloud-ice-servers-pref";
import "./cloud-remote-pref";
import "./cloud-tts-pref";
import "./cloud-webhooks";
import { showSupportPackageDialog } from "./show-dialog-cloud-support-package";

@customElement("cloud-account")
export class CloudAccount extends SubscribeMixin(LitElement) {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: "is-wide", type: Boolean }) public isWide = false;

  @property({ type: Boolean }) public narrow = false;

  @property({ attribute: false }) public cloudStatus!: CloudStatusLoggedIn;

  @state() private _subscription?: SubscriptionInfo;

  protected render() {
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
                  "ui.panel.config.cloud.account.thank_you_note"
                )}
              </p>
            </div>

            <ha-card
              outlined
              .header=${this.menuai.localize(
                "ui.panel.config.cloud.account.nabu_casa_account"
              )}
            >
              <div class="account-row">
                <ha-list-item noninteractive twoline>
                  ${this.cloudStatus.email.replace(
                    /(\w{3})[\w.-]+@([\w.]+\w)/,
                    "$1***@$2"
                  )}
                  <span slot="secondary" class="wrap">
                    ${this._subscription
                      ? this._subscription.human_description.replace(
                          "{periodEnd}",
                          this._subscription.plan_renewal_date
                            ? formatDateTime(
                                new Date(
                                  this._subscription.plan_renewal_date * 1000
                                ),
                                this.menuai.locale,
                                this.menuai.config
                              )
                            : ""
                        )
                      : this.menuai.localize(
                          "ui.panel.config.cloud.account.fetching_subscription"
                        )}
                  </span>
                </ha-list-item>
              </div>

              ${this.cloudStatus.cloud === "connecting" &&
              this.cloudStatus.cloud_last_disconnect_reason
                ? html`
                    <ha-alert
                      alert-type="warning"
                      .title=${this.cloudStatus.cloud_last_disconnect_reason
                        .reason}
                    ></ha-alert>
                  `
                : ""}

              <div class="account-row">
                <ha-list-item noninteractive>
                  ${this.menuai.localize(
                    "ui.panel.config.cloud.account.connection_status"
                  )}:
                  ${this.cloudStatus.cloud === "connected"
                    ? this.menuai.localize(
                        "ui.panel.config.cloud.account.connected"
                      )
                    : this.cloudStatus.cloud === "disconnected"
                      ? this.menuai.localize(
                          "ui.panel.config.cloud.account.not_connected"
                        )
                      : this.menuai.localize(
                          "ui.panel.config.cloud.account.connecting"
                        )}
                </ha-list-item>
              </div>

              <div class="card-actions">
                <a
                  href="https://account.nabucasa.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  <mwc-button>
                    ${this.menuai.localize(
                      "ui.panel.config.cloud.account.manage_account"
                    )}
                  </mwc-button>
                </a>
                <mwc-button @click=${this._signOut} class="warning">
                  ${this.menuai.localize(
                    "ui.panel.config.cloud.account.sign_out"
                  )}
                </mwc-button>
              </div>
            </ha-card>
          </ha-config-section>

          <ha-config-section .isWide=${this.isWide}>
            <span slot="header"
              >${this.menuai.localize(
                "ui.panel.config.cloud.account.integrations"
              )}</span
            >
            <div slot="introduction">
              <p>
                ${this.menuai.localize(
                  "ui.panel.config.cloud.account.integrations_introduction"
                )}
              </p>
              <p>
                ${this.menuai.localize(
                  "ui.panel.config.cloud.account.integrations_introduction2"
                )}
                <a
                  href="https://www.nabucasa.com"
                  target="_blank"
                  rel="noreferrer"
                >
                  ${this.menuai.localize(
                    "ui.panel.config.cloud.account.integrations_link_all_features"
                  )}</a
                >.
              </p>
            </div>

            <cloud-remote-pref
              .menuai=${this.menuai}
              .narrow=${this.narrow}
              .cloudStatus=${this.cloudStatus}
            ></cloud-remote-pref>

            <cloud-tts-pref
              .menuai=${this.menuai}
              .cloudStatus=${this.cloudStatus}
            ></cloud-tts-pref>

            <cloud-ice-servers-pref
              .menuai=${this.menuai}
              .cloudStatus=${this.cloudStatus}
            ></cloud-ice-servers-pref>

            <ha-tip .menuai=${this.menuai}>
              <a href="/config/voice-assistants">
                ${this.menuai.localize(
                  "ui.panel.config.cloud.account.tip_moved_voice_assistants"
                )}
              </a>
            </ha-tip>

            <cloud-webhooks
              .menuai=${this.menuai}
              .narrow=${this.narrow}
              .cloudStatus=${this.cloudStatus}
            ></cloud-webhooks>
          </ha-config-section>
        </div>
      </menuai-subpage>
    `;
  }

  firstUpdated() {
    this._fetchSubscriptionInfo();
  }

  protected override menuaiSubscribe() {
    const googleCheck = debounce(
      () => {
        if (this.cloudStatus && !this.cloudStatus.google_registered) {
          fireEvent(this, "ha-refresh-cloud-status");
        }
      },
      10000,
      true
    );
    return [
      this.menuai.connection.subscribeEvents(() => {
        if (!this.cloudStatus?.alexa_registered) {
          fireEvent(this, "ha-refresh-cloud-status");
        }
      }, "alexa_smart_home"),
      this.menuai.connection.subscribeEvents(
        googleCheck,
        "google_assistant_command"
      ),
      this.menuai.connection.subscribeEvents(
        googleCheck,
        "google_assistant_query"
      ),
      this.menuai.connection.subscribeEvents(
        googleCheck,
        "google_assistant_sync"
      ),
    ];
  }

  private async _fetchSubscriptionInfo() {
    this._subscription = await fetchCloudSubscriptionInfo(this.menuai);
    if (
      this._subscription.provider &&
      this.cloudStatus &&
      this.cloudStatus.cloud !== "connected"
    ) {
      fireEvent(this, "ha-refresh-cloud-status");
    }
  }

  private async _signOut() {
    showConfirmationDialog(this, {
      text: this.menuai.localize(
        "ui.panel.config.cloud.account.sign_out_confirm"
      ),
      confirmText: this.menuai!.localize("ui.common.yes"),
      dismissText: this.menuai!.localize("ui.common.no"),
      confirm: () => this._logoutFromCloud(),
    });
  }

  private async _logoutFromCloud() {
    await cloudLogout(this.menuai);
    fireEvent(this, "ha-refresh-cloud-status");
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
      await cloudLogout(this.menuai);
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
        [slot="introduction"] {
          margin: -1em 0;
        }
        [slot="introduction"] a {
          color: var(--primary-color);
        }
        .content {
          padding-bottom: 24px;
        }
        .account-row {
          display: flex;
          padding: 0 16px;
        }
        .card-actions {
          display: flex;
          flex-direction: row-reverse;
          justify-content: space-between;
        }
        mwc-button {
          align-self: center;
        }
        .wrap {
          white-space: normal;
        }
        .status {
          text-transform: capitalize;
          padding: 16px;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "cloud-account": CloudAccount;
  }
}
