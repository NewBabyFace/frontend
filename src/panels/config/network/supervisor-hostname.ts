import "@material/mwc-button/mwc-button";

import type { CSSResultGroup } from "lit";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators";
import "../../../components/ha-alert";
import "../../../components/ha-card";
import "../../../components/ha-spinner";
import "../../../components/ha-expansion-panel";
import "../../../components/ha-icon-button";
import "../../../components/ha-radio";
import "../../../components/ha-settings-row";
import "../../../components/ha-textfield";
import { extractApiErrorMessage } from "../../../data/menuaiio/common";
import {
  changeHostOptions,
  fetchmenuaiioHostInfo,
} from "../../../data/menuaiio/host";
import { showAlertDialog } from "../../../dialogs/generic/show-dialog-box";
import type { menuai } from "../../../types";

@customElement("supervisor-hostname")
export class menuaiioHostname extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ type: Boolean }) public narrow = false;

  @state() private _processing = false;

  @state() private _hostname?: string;

  protected firstUpdated() {
    this._fetchHostInfo();
  }

  private async _fetchHostInfo() {
    const hostInfo = await fetchmenuaiioHostInfo(this.menuai);
    this._hostname = hostInfo.hostname;
  }

  protected render() {
    if (!this._hostname) {
      return nothing;
    }

    return html`
      <ha-card
        class="no-padding"
        outlined
        .header=${this.menuai.localize(
          "ui.panel.config.network.supervisor.hostname.title"
        )}
      >
        <div class="card-content">
          <p>
            ${this.menuai.localize(
              "ui.panel.config.network.supervisor.hostname.description"
            )}
          </p>
          <ha-textfield
            .disabled=${this._processing}
            .value=${this._hostname}
            @change=${this._handleChange}
            placeholder="menuai"
          >
          </ha-textfield>
        </div>
        <div class="card-actions">
          <mwc-button @click=${this._save} .disabled=${this._processing}>
            ${this._processing
              ? html`<ha-spinner size="small"></ha-spinner>`
              : this.menuai.localize("ui.common.save")}
          </mwc-button>
        </div>
      </ha-card>
    `;
  }

  private _handleChange(ev) {
    this._hostname = ev.target.value;
  }

  private async _save() {
    this._processing = true;
    try {
      await changeHostOptions(this.menuai, { hostname: this._hostname });
    } catch (err: any) {
      showAlertDialog(this, {
        title: this.menuai.localize(
          "ui.panel.config.network.supervisor.hostname.failed_to_set_hostname"
        ),
        text: extractApiErrorMessage(err),
      });
    } finally {
      this._processing = false;
    }
  }

  static styles: CSSResultGroup = css`
    ha-textfield {
      width: 100%;
    }
    .card-actions {
      display: flex;
      flex-direction: row-reverse;
      justify-content: space-between;
      align-items: center;
    }
    .card-content > p {
      padding-bottom: 1em;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "supervisor-hostname": menuaiioHostname;
  }
}
