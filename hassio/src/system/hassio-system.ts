import type { CSSResultGroup, TemplateResult } from "lit";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators";
import { atLeastVersion } from "../../../src/common/config/version";
import type { Supervisor } from "../../../src/data/supervisor/supervisor";
import "../../../src/layouts/menuai-tabs-subpage";
import { haStyle } from "../../../src/resources/styles";
import type { menuai, Route } from "../../../src/types";
import { supervisorTabs } from "../menuaiio-tabs";
import { menuaiioStyle } from "../resources/menuaiio-style";
import "./menuaiio-core-info";
import "./menuaiio-host-info";
import "./menuaiio-supervisor-info";
import "./menuaiio-supervisor-log";

@customElement("menuaiio-system")
class menuaiioSystem extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: false }) public supervisor!: Supervisor;

  @property({ type: Boolean }) public narrow = false;

  @property({ attribute: false }) public route!: Route;

  protected render(): TemplateResult | undefined {
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
      >
        <span slot="header"> ${this.supervisor.localize("panel.system")} </span>
        <div class="content">
          <div class="card-group">
            <menuaiio-core-info
              .menuai=${this.menuai}
              .supervisor=${this.supervisor}
            ></menuaiio-core-info>
            <menuaiio-supervisor-info
              .menuai=${this.menuai}
              .supervisor=${this.supervisor}
            ></menuaiio-supervisor-info>
            <menuaiio-host-info
              .menuai=${this.menuai}
              .supervisor=${this.supervisor}
            ></menuaiio-host-info>
          </div>
          <menuaiio-supervisor-log
            .menuai=${this.menuai}
            .supervisor=${this.supervisor}
          ></menuaiio-supervisor-log>
        </div>
      </menuai-tabs-subpage>
    `;
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      menuaiioStyle,
      css`
        .content {
          margin: 8px;
          color: var(--primary-text-color);
        }
        .title {
          margin-top: 24px;
          color: var(--primary-text-color);
          font-size: 2em;
          padding-left: 8px;
          padding-inline-start: 8px;
          padding-inline-end: initial;
          margin-bottom: 8px;
        }
        menuaiio-supervisor-log {
          width: 100%;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "menuaiio-system": menuaiioSystem;
  }
}
