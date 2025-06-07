import type { TemplateResult } from "lit";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators";
import type { Supervisor } from "../../../src/data/supervisor/supervisor";
import "../../../src/layouts/menuai-subpage";
import type { menuai, Route } from "../../../src/types";
import "./update-available-card";

@customElement("update-available-dashboard")
class UpdateAvailableDashboard extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: false }) public supervisor!: Supervisor;

  @property({ type: Boolean }) public narrow = false;

  @property({ attribute: false }) public route!: Route;

  protected render(): TemplateResult {
    return html`
      <menuai-subpage
        .menuai=${this.menuai}
        .narrow=${this.narrow}
        .route=${this.route}
      >
        <update-available-card
          .menuai=${this.menuai}
          .supervisor=${this.supervisor}
          .route=${this.route}
          .narrow=${this.narrow}
          @update-complete=${this._updateComplete}
        ></update-available-card>
      </menuai-subpage>
    `;
  }

  private _updateComplete() {
    history.back();
  }

  static styles = css`
    menuai-subpage {
      --app-header-background-color: var(--primary-background-color);
      --app-header-text-color: var(--sidebar-text-color);
    }
    update-available-card {
      margin: auto;
      margin-top: 16px;
      margin-bottom: 24px;
      max-width: 600px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "update-available-dashboard": UpdateAvailableDashboard;
  }
}
