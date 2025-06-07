import type { TemplateResult } from "lit";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators";
import "../../../layouts/menuai-subpage";
import type { menuai, Route } from "../../../types";
import "./ha-config-analytics";

@customElement("ha-config-section-analytics")
class HaConfigSectionAnalytics extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: false }) public route!: Route;

  @property({ type: Boolean }) public narrow = false;

  protected render(): TemplateResult {
    return html`
      <menuai-subpage
        back-path="/config/system"
        .menuai=${this.menuai}
        .narrow=${this.narrow}
        .header=${this.menuai.localize("ui.panel.config.analytics.caption")}
      >
        <div class="content">
          <ha-config-analytics .menuai=${this.menuai}></ha-config-analytics>
        </div>
      </menuai-subpage>
    `;
  }

  static styles = css`
    .content {
      padding: 28px 20px 0;
      max-width: 1040px;
      margin: 0 auto;
    }
    ha-config-analytics {
      display: block;
      max-width: 600px;
      margin: 0 auto;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-config-section-analytics": HaConfigSectionAnalytics;
  }
}
