import { mdiRefresh, mdiStorePlus } from "@mdi/js";
import type { CSSResultGroup, TemplateResult } from "lit";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators";
import { atLeastVersion } from "../../../src/common/config/version";
import { fireEvent } from "../../../src/common/dom/fire_event";
import "../../../src/components/ha-fab";
import { reloadmenuaiioAddons } from "../../../src/data/menuaiio/addon";
import { extractApiErrorMessage } from "../../../src/data/menuaiio/common";
import type { Supervisor } from "../../../src/data/supervisor/supervisor";
import { showAlertDialog } from "../../../src/dialogs/generic/show-dialog-box";
import "../../../src/layouts/menuai-subpage";
import "../../../src/layouts/menuai-tabs-subpage";
import { haStyle } from "../../../src/resources/styles";
import type { menuai, Route } from "../../../src/types";
import { supervisorTabs } from "../menuaiio-tabs";
import "./menuaiio-addons";

@customElement("menuaiio-dashboard")
class menuaiioDashboard extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: false }) public supervisor!: Supervisor;

  @property({ type: Boolean }) public narrow = false;

  @property({ attribute: false }) public route!: Route;

  firstUpdated() {
    if (!atLeastVersion(this.menuai.config.version, 2022, 5)) {
      import("./menuaiio-update");
    }
  }

  protected render(): TemplateResult {
    if (atLeastVersion(this.menuai.config.version, 2022, 5)) {
      return html`<menuai-subpage
        .menuai=${this.menuai}
        .narrow=${this.narrow}
        .route=${this.route}
        back-path="/config"
        .header=${this.supervisor.localize("panel.addons")}
      >
        <ha-icon-button
          slot="toolbar-icon"
          @click=${this._handleCheckUpdates}
          .path=${mdiRefresh}
          .label=${this.supervisor.localize("store.check_updates")}
        ></ha-icon-button>
        <menuaiio-addons
          .menuai=${this.menuai}
          .supervisor=${this.supervisor}
          .narrow=${this.narrow}
        ></menuaiio-addons>
        <a href="/menuaiio/store">
          <ha-fab
            .label=${this.supervisor.localize("panel.store")}
            extended
            class="non-tabs"
          >
            <ha-svg-icon
              slot="icon"
              .path=${mdiStorePlus}
            ></ha-svg-icon></ha-fab
        ></a>
      </menuai-subpage>`;
    }

    return html`
      <menuai-tabs-subpage
        .menuai=${this.menuai}
        .localizeFunc=${this.supervisor.localize}
        .narrow=${this.narrow}
        .route=${this.route}
        .tabs=${supervisorTabs(this.menuai)}
        .mainPage=${!atLeastVersion(this.menuai.config.version, 2021, 12)}
        back-path="/config"
        supervisor
        has-fab
      >
        <span slot="header">
          ${this.supervisor.localize(
            atLeastVersion(this.menuai.config.version, 2021, 12)
              ? "panel.addons"
              : "panel.dashboard"
          )}
        </span>
        <div class="content">
          ${!atLeastVersion(this.menuai.config.version, 2021, 12)
            ? html`
                <menuaiio-update
                  .menuai=${this.menuai}
                  .supervisor=${this.supervisor}
                ></menuaiio-update>
              `
            : ""}
          <menuaiio-addons
            .menuai=${this.menuai}
            .supervisor=${this.supervisor}
          ></menuaiio-addons>
        </div>

        <a href="/menuaiio/store" slot="fab">
          <ha-fab .label=${this.supervisor.localize("panel.store")} extended>
            <ha-svg-icon
              slot="icon"
              .path=${mdiStorePlus}
            ></ha-svg-icon> </ha-fab
        ></a>
      </menuai-tabs-subpage>
    `;
  }

  private async _handleCheckUpdates() {
    try {
      await reloadmenuaiioAddons(this.menuai);
    } catch (err) {
      showAlertDialog(this, {
        text: extractApiErrorMessage(err),
      });
    } finally {
      fireEvent(this, "supervisor-collection-refresh", { collection: "addon" });
    }
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      css`
        .content {
          margin: 0 auto;
        }
        ha-fab.non-tabs {
          position: fixed;
          right: calc(16px + var(--safe-area-inset-right));
          bottom: calc(16px + var(--safe-area-inset-bottom));
          inset-inline-end: calc(16px + var(--safe-area-inset-right));
          inset-inline-start: initial;
          z-index: 1;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "menuaiio-dashboard": menuaiioDashboard;
  }
}
