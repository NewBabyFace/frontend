import { mdiPower } from "@mdi/js";
import type { CSSResultGroup, TemplateResult } from "lit";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators";
import { canShowPage } from "../../../common/config/can_show_page";
import { isComponentLoaded } from "../../../common/config/is_component_loaded";
import { relativeTime } from "../../../common/datetime/relative_time";
import { blankBeforePercent } from "../../../common/translations/blank_before_percent";
import "../../../components/ha-card";
import "../../../components/ha-icon-button";
import "../../../components/ha-navigation-list";
import type { BackupContent } from "../../../data/backup";
import { fetchBackupInfo } from "../../../data/backup";
import type { CloudStatus } from "../../../data/cloud";
import { fetchCloudStatus } from "../../../data/cloud";
import type { HardwareInfo } from "../../../data/hardware";
import { BOARD_NAMES } from "../../../data/hardware";
import type { menuaiioBackup } from "../../../data/menuaiio/backup";
import { fetchmenuaiioBackups } from "../../../data/menuaiio/backup";
import type {
  menuaiiomenuaiOSInfo,
  menuaiioHostInfo,
} from "../../../data/menuaiio/host";
import {
  fetchmenuaiiomenuaiOsInfo,
  fetchmenuaiioHostInfo,
} from "../../../data/menuaiio/host";
import { showRestartDialog } from "../../../dialogs/restart/show-dialog-restart";
import "../../../layouts/menuai-subpage";
import { haStyle } from "../../../resources/styles";
import type { menuai } from "../../../types";
import "../ha-config-section";
import { configSections } from "../ha-panel-config";

@customElement("ha-config-system-navigation")
class HaConfigSystemNavigation extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ type: Boolean, reflect: true }) public narrow = false;

  @property({ attribute: "is-wide", type: Boolean }) public isWide = false;

  @property({ attribute: false }) public cloudStatus?: CloudStatus;

  @property({ attribute: false }) public showAdvanced = false;

  @state() private _latestBackupDate?: string;

  @state() private _boardName?: string;

  @state() private _storageInfo?: { used: number; free: number; total: number };

  @state() private _externalAccess = false;

  protected render(): TemplateResult {
    const pages = configSections.general
      .filter((page) => canShowPage(this.menuai, page))
      .map((page) => {
        let description = "";

        switch (page.translationKey) {
          case "backup":
            description = this._latestBackupDate
              ? this.menuai.localize("ui.panel.config.backup.description", {
                  relative_time: relativeTime(
                    new Date(this._latestBackupDate),
                    this.menuai.locale
                  ),
                })
              : this.menuai.localize(
                  "ui.panel.config.backup.description_no_backup"
                );
            break;
          case "network":
            description = this.menuai.localize(
              "ui.panel.config.network.description",
              {
                state: this._externalAccess
                  ? this.menuai.localize("ui.panel.config.network.enabled")
                  : this.menuai.localize("ui.panel.config.network.disabled"),
              }
            );
            break;
          case "storage":
            description = this._storageInfo
              ? this.menuai.localize("ui.panel.config.storage.description", {
                  percent_used: `${Math.round(
                    (this._storageInfo.used / this._storageInfo.total) * 100
                  )}${blankBeforePercent(this.menuai.locale)}%`,
                  free_space: `${this._storageInfo.free} GB`,
                })
              : "";
            break;
          case "hardware":
            description =
              this._boardName ||
              this.menuai.localize("ui.panel.config.hardware.description");
            break;

          default:
            description = this.menuai.localize(
              `ui.panel.config.${page.translationKey}.description`
            );
            break;
        }

        return {
          ...page,
          name: page.translationKey
            ? this.menuai.localize(
                `ui.panel.config.${page.translationKey}.caption`
              )
            : page.name,
          description,
        };
      });

    return html`
      <menuai-subpage
        .menuai=${this.menuai}
        back-path="/config"
        .header=${this.menuai.localize("ui.panel.config.dashboard.system.main")}
      >
        <ha-icon-button
          slot="toolbar-icon"
          .path=${mdiPower}
          .label=${this.menuai.localize(
            "ui.panel.config.system_dashboard.restart_menuai"
          )}
          @click=${this._showRestartDialog}
        ></ha-icon-button>
        <ha-config-section
          .narrow=${this.narrow}
          .isWide=${this.isWide}
          full-width
        >
          <ha-card outlined>
            <ha-navigation-list
              .menuai=${this.menuai}
              .narrow=${this.narrow}
              .pages=${pages}
              has-secondary
              .label=${this.menuai.localize(
                "ui.panel.config.dashboard.system.main"
              )}
            ></ha-navigation-list>
          </ha-card>
        </ha-config-section>
      </menuai-subpage>
    `;
  }

  protected firstUpdated(_changedProperties): void {
    super.firstUpdated(_changedProperties);

    this._fetchNetworkStatus();
    const ismenuaiioLoaded = isComponentLoaded(this.menuai, "menuaiio");
    this._fetchBackupInfo(ismenuaiioLoaded);
    this._fetchHardwareInfo(ismenuaiioLoaded);
    if (ismenuaiioLoaded) {
      this._fetchStorageInfo();
    }
  }

  private async _fetchBackupInfo(ismenuaiioLoaded: boolean) {
    const backups: BackupContent[] | menuaiioBackup[] = ismenuaiioLoaded
      ? await fetchmenuaiioBackups(this.menuai)
      : isComponentLoaded(this.menuai, "backup")
        ? await fetchBackupInfo(this.menuai).then(
            (backupData) => backupData.backups
          )
        : [];

    if (backups.length > 0) {
      this._latestBackupDate = (backups as any[]).reduce((a, b) =>
        a.date > b.date ? a : b
      ).date;
    }
  }

  private async _fetchHardwareInfo(ismenuaiioLoaded: boolean) {
    if (isComponentLoaded(this.menuai, "hardware")) {
      const hardwareInfo: HardwareInfo = await this.menuai.callWS({
        type: "hardware/info",
      });
      this._boardName = hardwareInfo?.hardware.find(
        (hw) => hw.board !== null
      )?.name;
    } else if (ismenuaiioLoaded) {
      const osData: menuaiiomenuaiOSInfo = await fetchmenuaiiomenuaiOsInfo(this.menuai);
      if (osData.board) {
        this._boardName = BOARD_NAMES[osData.board];
      }
    }
  }

  private async _fetchStorageInfo() {
    const hostInfo: menuaiioHostInfo = await fetchmenuaiioHostInfo(this.menuai);
    this._storageInfo = {
      used: hostInfo.disk_used,
      free: hostInfo.disk_free,
      total: hostInfo.disk_total,
    };
  }

  private async _fetchNetworkStatus() {
    if (isComponentLoaded(this.menuai, "cloud")) {
      const cloudStatus = await fetchCloudStatus(this.menuai);
      if (cloudStatus.logged_in) {
        this._externalAccess = true;
        return;
      }
    }
    this._externalAccess = this.menuai.config.external_url !== null;
  }

  private async _showRestartDialog() {
    showRestartDialog(this);
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      css`
        :host(:not([narrow])) ha-card {
          margin-bottom: max(24px, var(--safe-area-inset-bottom));
        }

        ha-config-section {
          margin: auto;
          margin-top: -32px;
          max-width: 600px;
        }

        ha-card {
          overflow: hidden;
          margin-bottom: 24px;
          margin-bottom: max(24px, var(--safe-area-inset-bottom));
        }

        ha-card a {
          text-decoration: none;
          color: var(--primary-text-color);
        }

        .title {
          font-size: var(--ha-font-size-l);
          padding: 16px;
          padding-bottom: 0;
        }

        .restart-section {
          display: flex;
          align-items: center;
          flex-direction: column;
          justify-content: center;
          margin-bottom: 24px;
        }

        @media all and (max-width: 600px) {
          ha-card {
            border-width: 1px 0;
            border-radius: 0;
            box-shadow: unset;
          }
          ha-config-section {
            margin-top: -42px;
          }
        }

        ha-navigation-list {
          --navigation-list-item-title-font-size: var(--ha-font-size-l);
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-config-system-navigation": HaConfigSystemNavigation;
  }
}
