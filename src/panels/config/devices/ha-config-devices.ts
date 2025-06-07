import { customElement, property, state } from "lit/decorators";
import type { ConfigEntry } from "../../../data/config_entries";
import { getConfigEntries } from "../../../data/config_entries";
import type { IntegrationManifest } from "../../../data/integration";
import { fetchIntegrationManifests } from "../../../data/integration";
import type { RouterOptions } from "../../../layouts/menuai-router-page";
import { menuaiRouterPage } from "../../../layouts/menuai-router-page";
import type { menuai } from "../../../types";
import "./ha-config-device-page";
import "./ha-config-devices-dashboard";

@customElement("ha-config-devices")
class HaConfigDevices extends menuaiRouterPage {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ type: Boolean }) public narrow = false;

  @property({ attribute: "is-wide", type: Boolean }) public isWide = false;

  @property({ attribute: false }) public showAdvanced = false;

  protected routerOptions: RouterOptions = {
    defaultPage: "dashboard",
    routes: {
      dashboard: {
        tag: "ha-config-devices-dashboard",
        cache: true,
      },
      device: {
        tag: "ha-config-device-page",
      },
    },
  };

  @state() private _configEntries: ConfigEntry[] = [];

  @state() private _manifests: IntegrationManifest[] = [];

  protected firstUpdated(changedProps) {
    super.firstUpdated(changedProps);
    this._loadData();
  }

  protected updatePageEl(pageEl) {
    pageEl.menuai = this.menuai;

    if (this._currentPage === "device") {
      pageEl.deviceId = this.routeTail.path.substr(1);
    }

    pageEl.entries = this._configEntries;
    pageEl.manifests = this._manifests;
    pageEl.narrow = this.narrow;
    pageEl.isWide = this.isWide;
    pageEl.showAdvanced = this.showAdvanced;
    pageEl.route = this.routeTail;
  }

  private async _loadData() {
    this._configEntries = await getConfigEntries(this.menuai);
    this._manifests = await fetchIntegrationManifests(this.menuai);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-config-devices": HaConfigDevices;
  }
}
