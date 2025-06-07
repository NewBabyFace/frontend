import type { RequestSelectedDetail } from "@material/mwc-list/mwc-list-item";
import { mdiDotsVertical, mdiRefresh } from "@mdi/js";
import type { menuaiEntities } from "home-assistant-js-websocket";
import type { TemplateResult } from "lit";
import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators";
import memoizeOne from "memoize-one";
import { isComponentLoaded } from "../../../common/config/is_component_loaded";
import { shouldHandleRequestSelectedEvent } from "../../../common/mwc/handle-request-selected-event";
import "../../../components/ha-alert";
import "../../../components/ha-bar";
import "../../../components/ha-button-menu";
import "../../../components/ha-card";
import "../../../components/ha-check-list-item";
import "../../../components/ha-list-item";
import "../../../components/ha-metric";
import { extractApiErrorMessage } from "../../../data/menuaiio/common";
import type {
  menuaiioSupervisorInfo,
  SupervisorOptions,
} from "../../../data/menuaiio/supervisor";
import {
  fetchmenuaiioSupervisorInfo,
  reloadSupervisor,
  setSupervisorOption,
} from "../../../data/menuaiio/supervisor";
import {
  checkForEntityUpdates,
  filterUpdateEntitiesWithInstall,
} from "../../../data/update";
import { showAlertDialog } from "../../../dialogs/generic/show-dialog-box";
import "../../../layouts/menuai-subpage";
import type { menuai } from "../../../types";
import "../dashboard/ha-config-updates";
import { showJoinBetaDialog } from "./updates/show-dialog-join-beta";

@customElement("ha-config-section-updates")
class HaConfigSectionUpdates extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ type: Boolean }) public narrow = false;

  @state() private _showSkipped = false;

  @state() private _supervisorInfo?: menuaiioSupervisorInfo;

  protected firstUpdated(changedProps) {
    super.firstUpdated(changedProps);

    if (isComponentLoaded(this.menuai, "menuaiio")) {
      this._refreshSupervisorInfo();
    }
  }

  protected render(): TemplateResult {
    const canInstallUpdates = this._filterUpdateEntitiesWithInstall(
      this.menuai.states,
      this._showSkipped
    );

    return html`
      <menuai-subpage
        back-path="/config/system"
        .menuai=${this.menuai}
        .narrow=${this.narrow}
        .header=${this.menuai.localize("ui.panel.config.updates.caption")}
      >
        <div slot="toolbar-icon">
          <ha-icon-button
            .label=${this.menuai.localize(
              "ui.panel.config.updates.check_updates"
            )}
            .path=${mdiRefresh}
            @click=${this._checkUpdates}
          ></ha-icon-button>
          <ha-button-menu multi>
            <ha-icon-button
              slot="trigger"
              .label=${this.menuai.localize("ui.common.menu")}
              .path=${mdiDotsVertical}
            ></ha-icon-button>
            <ha-check-list-item
              left
              @request-selected=${this._toggleSkipped}
              .selected=${this._showSkipped}
            >
              ${this.menuai.localize("ui.panel.config.updates.show_skipped")}
            </ha-check-list-item>
            ${this._supervisorInfo
              ? html`
                  <li divider role="separator"></li>
                  <ha-list-item
                    @request-selected=${this._toggleBeta}
                    .disabled=${this._supervisorInfo.channel === "dev"}
                  >
                    ${this._supervisorInfo.channel === "stable"
                      ? this.menuai.localize("ui.panel.config.updates.join_beta")
                      : this.menuai.localize(
                          "ui.panel.config.updates.leave_beta"
                        )}
                  </ha-list-item>
                `
              : ""}
          </ha-button-menu>
        </div>
        <div class="content">
          <ha-card outlined>
            <div class="card-content">
              ${canInstallUpdates.length
                ? html`
                    <ha-config-updates
                      .menuai=${this.menuai}
                      .narrow=${this.narrow}
                      .updateEntities=${canInstallUpdates}
                      showAll
                    ></ha-config-updates>
                  `
                : html`
                    <div class="no-updates">
                      ${this.menuai.localize(
                        "ui.panel.config.updates.no_updates"
                      )}
                    </div>
                  `}
            </div>
          </ha-card>
        </div>
      </menuai-subpage>
    `;
  }

  private async _refreshSupervisorInfo() {
    this._supervisorInfo = await fetchmenuaiioSupervisorInfo(this.menuai);
  }

  private _toggleSkipped(ev: CustomEvent<RequestSelectedDetail>): void {
    if (ev.detail.source !== "property") {
      return;
    }

    this._showSkipped = !this._showSkipped;
  }

  private async _toggleBeta(
    ev: CustomEvent<RequestSelectedDetail>
  ): Promise<void> {
    if (!shouldHandleRequestSelectedEvent(ev)) {
      return;
    }

    if (this._supervisorInfo!.channel === "stable") {
      showJoinBetaDialog(this, {
        join: async () => this._setChannel("beta"),
      });
    } else {
      this._setChannel("stable");
    }
  }

  private async _setChannel(
    channel: SupervisorOptions["channel"]
  ): Promise<void> {
    try {
      await setSupervisorOption(this.menuai, {
        channel,
      });
      await reloadSupervisor(this.menuai);
      await this._refreshSupervisorInfo();
    } catch (err: any) {
      showAlertDialog(this, {
        text: extractApiErrorMessage(err),
      });
    }
  }

  private async _checkUpdates(): Promise<void> {
    checkForEntityUpdates(this, this.menuai);
  }

  private _filterUpdateEntitiesWithInstall = memoizeOne(
    (entities: menuaiEntities, showSkipped: boolean) =>
      filterUpdateEntitiesWithInstall(entities, showSkipped)
  );

  static styles = css`
    .content {
      padding: 28px 20px 0;
      max-width: 1040px;
      margin: 0 auto;
    }
    ha-card {
      max-width: 600px;
      margin: 0 auto;
      height: 100%;
      justify-content: space-between;
      flex-direction: column;
      display: flex;
      margin-bottom: max(24px, var(--safe-area-inset-bottom));
    }
    ha-config-updates {
      margin-bottom: 8px;
    }

    .card-content {
      display: flex;
      justify-content: space-between;
      flex-direction: column;
      padding: 0;
    }

    .no-updates {
      padding: 16px;
    }
    li[divider] {
      border-bottom-color: var(--divider-color);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-config-section-updates": HaConfigSectionUpdates;
  }
}
