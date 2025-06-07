import type { CSSResultGroup, TemplateResult } from "lit";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators";
import "../../../../src/components/ha-spinner";
import type { menuaiioAddonDetails } from "../../../../src/data/menuaiio/addon";
import type { Supervisor } from "../../../../src/data/supervisor/supervisor";
import { haStyle } from "../../../../src/resources/styles";
import type { menuai, Route } from "../../../../src/types";
import { menuaiioStyle } from "../../resources/menuaiio-style";
import "./menuaiio-addon-info";

@customElement("menuaiio-addon-info-tab")
class menuaiioAddonInfoDashboard extends LitElement {
  @property({ type: Boolean }) public narrow = false;

  @property({ attribute: false }) public route!: Route;

  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: false }) public supervisor!: Supervisor;

  @property({ attribute: false }) public addon?: menuaiioAddonDetails;

  @property({ type: Boolean, attribute: "control-enabled" })
  public controlEnabled = false;

  protected render(): TemplateResult {
    if (!this.addon) {
      return html`<ha-spinner></ha-spinner>`;
    }

    return html`
      <div class="content">
        <menuaiio-addon-info
          .narrow=${this.narrow}
          .route=${this.route}
          .menuai=${this.menuai}
          .supervisor=${this.supervisor}
          .addon=${this.addon}
          .controlEnabled=${this.controlEnabled}
        ></menuaiio-addon-info>
      </div>
    `;
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      menuaiioStyle,
      css`
        .content {
          margin: auto;
          padding: 8px;
          max-width: 1024px;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "menuaiio-addon-info-tab": menuaiioAddonInfoDashboard;
  }
}
