import "@material/mwc-button/mwc-button";
import type { CSSResultGroup, PropertyValues } from "lit";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators";
import { isComponentLoaded } from "../../../common/config/is_component_loaded";
import "../../../components/ha-alert";
import "../../../components/ha-card";
import "../../../components/ha-checkbox";
import "../../../components/ha-network";
import "../../../components/ha-settings-row";
import { fetchNetworkInfo } from "../../../data/menuaiio/network";
import type { NetworkConfig } from "../../../data/network";
import { getNetworkConfig, setNetworkConfig } from "../../../data/network";
import { haStyle } from "../../../resources/styles";
import type { menuai } from "../../../types";

@customElement("ha-config-network")
class ConfigNetwork extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @state() private _networkConfig?: NetworkConfig;

  @state() private _error?: { code: string; message: string };

  protected render() {
    if (
      !this.menuai.userData?.showAdvanced ||
      !isComponentLoaded(this.menuai, "network")
    ) {
      return nothing;
    }

    return html`
      <ha-card
        outlined
        header=${this.menuai.localize("ui.panel.config.network.network_adapter")}
      >
        <div class="card-content">
          ${this._error
            ? html`
                <ha-alert alert-type="error"
                  >${this._error.message || this._error.code}</ha-alert
                >
              `
            : ""}
          <p>
            ${this.menuai.localize(
              "ui.panel.config.network.network_adapter_info"
            )}
          </p>
          <ha-network
            @network-config-changed=${this._configChanged}
            .menuai=${this.menuai}
            .networkConfig=${this._networkConfig}
          ></ha-network>
        </div>
        <div class="card-actions">
          <mwc-button @click=${this._save}>
            ${this.menuai.localize(
              "ui.panel.config.core.section.core.core_config.save_button"
            )}
          </mwc-button>
        </div>
      </ha-card>
    `;
  }

  protected firstUpdated(changedProps: PropertyValues) {
    super.firstUpdated(changedProps);
    if (isComponentLoaded(this.menuai, "network")) {
      this._load();
    }
  }

  private async _load() {
    this._error = undefined;
    try {
      const coreNetwork = await getNetworkConfig(this.menuai);
      if (isComponentLoaded(this.menuai, "menuaiio")) {
        const supervisorNetwork = await fetchNetworkInfo(this.menuai);
        const interfaces = new Set(
          supervisorNetwork.interfaces.map((int) => int.interface)
        );
        if (interfaces.size) {
          coreNetwork.adapters = coreNetwork.adapters.filter((adapter) =>
            interfaces.has(adapter.name)
          );
        }
      }
      this._networkConfig = coreNetwork;
    } catch (err: any) {
      this._error = err.message || err;
    }
  }

  private async _save() {
    this._error = undefined;
    try {
      await setNetworkConfig(
        this.menuai,
        this._networkConfig?.configured_adapters || []
      );
    } catch (err: any) {
      this._error = err.message || err;
    }
  }

  private _configChanged(event: CustomEvent): void {
    this._networkConfig = {
      ...this._networkConfig!,
      configured_adapters: event.detail.configured_adapters,
    };
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      css`
        .error {
          color: var(--error-color);
        }

        ha-settings-row {
          padding: 0;
        }

        .card-actions {
          display: flex;
          flex-direction: row-reverse;
          justify-content: space-between;
          align-items: center;
        }
      `, // row-reverse so we tab first to "save"
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-config-network": ConfigNetwork;
  }
}
