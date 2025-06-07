import "../../../layouts/menuai-error-screen";
import type { CSSResultGroup, TemplateResult } from "lit";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators";
import type {
  EnergyPreferencesValidation,
  EnergyInfo,
  EnergyPreferences,
} from "../../../data/energy";
import {
  getEnergyPreferenceValidation,
  getEnergyInfo,
  getEnergyPreferences,
  getReferencedStatisticIds,
} from "../../../data/energy";
import type { StatisticsMetaData } from "../../../data/recorder";
import { getStatisticMetadata } from "../../../data/recorder";
import "../../../layouts/menuai-loading-screen";
import "../../../layouts/menuai-subpage";
import { haStyle } from "../../../resources/styles";
import type { menuai, Route } from "../../../types";
import "../../../components/ha-alert";
import "./components/ha-energy-device-settings";
import "./components/ha-energy-grid-settings";
import "./components/ha-energy-solar-settings";
import "./components/ha-energy-battery-settings";
import "./components/ha-energy-gas-settings";
import "./components/ha-energy-water-settings";

const INITIAL_CONFIG: EnergyPreferences = {
  energy_sources: [],
  device_consumption: [],
};

@customElement("ha-config-energy")
class HaConfigEnergy extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ type: Boolean }) public narrow = false;

  @property({ attribute: "is-wide", type: Boolean }) public isWide = false;

  @property({ attribute: false }) public showAdvanced = false;

  @property({ attribute: false }) public route!: Route;

  @state() private _searchParms = new URLSearchParams(window.location.search);

  @state() private _info?: EnergyInfo;

  @state() private _preferences?: EnergyPreferences;

  @state() private _validationResult?: EnergyPreferencesValidation;

  @state() private _error?: string;

  @state() private _statsMetadata?: Record<string, StatisticsMetaData>;

  protected firstUpdated() {
    this._fetchConfig();
  }

  protected render(): TemplateResult {
    if (!this._preferences && !this._error) {
      return html`<menuai-loading-screen
        .menuai=${this.menuai}
        .narrow=${this.narrow}
      ></menuai-loading-screen>`;
    }

    if (this._error) {
      return html`<menuai-error-screen
        .menuai=${this.menuai}
        .narrow=${this.narrow}
        .error=${this._error}
      ></menuai-error-screen>`;
    }

    return html`
      <menuai-subpage
        .menuai=${this.menuai}
        .narrow=${this.narrow}
        .backPath=${this._searchParms.has("historyBack")
          ? undefined
          : "/config/lovelace/dashboards"}
        .header=${this.menuai.localize("ui.panel.config.energy.caption")}
      >
        <ha-alert>
          ${this.menuai.localize("ui.panel.config.energy.new_device_info")}
        </ha-alert>
        <div class="container">
          <ha-energy-grid-settings
            .menuai=${this.menuai}
            .preferences=${this._preferences!}
            .statsMetadata=${this._statsMetadata}
            .validationResult=${this._validationResult}
            @value-changed=${this._prefsChanged}
          ></ha-energy-grid-settings>
          <ha-energy-solar-settings
            .menuai=${this.menuai}
            .preferences=${this._preferences!}
            .statsMetadata=${this._statsMetadata}
            .validationResult=${this._validationResult}
            .info=${this._info}
            @value-changed=${this._prefsChanged}
          ></ha-energy-solar-settings>
          <ha-energy-battery-settings
            .menuai=${this.menuai}
            .preferences=${this._preferences!}
            .statsMetadata=${this._statsMetadata}
            .validationResult=${this._validationResult}
            @value-changed=${this._prefsChanged}
          ></ha-energy-battery-settings>
          <ha-energy-gas-settings
            .menuai=${this.menuai}
            .preferences=${this._preferences!}
            .statsMetadata=${this._statsMetadata}
            .validationResult=${this._validationResult}
            @value-changed=${this._prefsChanged}
          ></ha-energy-gas-settings>
          <ha-energy-water-settings
            .menuai=${this.menuai}
            .preferences=${this._preferences!}
            .statsMetadata=${this._statsMetadata}
            .validationResult=${this._validationResult}
            @value-changed=${this._prefsChanged}
          ></ha-energy-water-settings>
          <ha-energy-device-settings
            .menuai=${this.menuai}
            .preferences=${this._preferences!}
            .statsMetadata=${this._statsMetadata}
            .validationResult=${this._validationResult}
            @value-changed=${this._prefsChanged}
          ></ha-energy-device-settings>
        </div>
      </menuai-subpage>
    `;
  }

  private async _fetchConfig() {
    this._error = undefined;

    const validationPromise = getEnergyPreferenceValidation(this.menuai);
    const energyInfoPromise = await getEnergyInfo(this.menuai);
    try {
      this._preferences = await getEnergyPreferences(this.menuai);
    } catch (err: any) {
      if (err.code === "not_found") {
        this._preferences = INITIAL_CONFIG;
      } else {
        this._error = err.message;
      }
    }
    try {
      this._validationResult = await validationPromise;
    } catch (err: any) {
      this._error = err.message;
    }
    this._info = await energyInfoPromise;
    await this._fetchMetaData();
  }

  private async _prefsChanged(ev: CustomEvent) {
    this._preferences = ev.detail.value;
    this._validationResult = undefined;
    try {
      this._validationResult = await getEnergyPreferenceValidation(this.menuai);
    } catch (err: any) {
      this._error = err.message;
    }
    this._info = await getEnergyInfo(this.menuai);
    await this._fetchMetaData();
  }

  private async _fetchMetaData() {
    if (!this._preferences || !this._info) {
      return;
    }
    const statIDs = getReferencedStatisticIds(this._preferences, this._info);
    const statsMetadataArray = await getStatisticMetadata(this.menuai, statIDs);
    const statsMetadata: Record<string, StatisticsMetaData> = {};
    statsMetadataArray.forEach((x) => {
      statsMetadata[x.statistic_id] = x;
    });
    this._statsMetadata = statsMetadata;
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      css`
        ha-alert {
          display: block;
          margin: 8px;
        }
        .container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          grid-gap: 8px 8px;
          margin: 8px;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-config-energy": HaConfigEnergy;
  }
}
