import type { TemplateResult } from "lit";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators";
import type { Supervisor } from "../../src/data/supervisor/supervisor";
import { supervisorCollection } from "../../src/data/supervisor/supervisor";
import "../../src/layouts/menuai-loading-screen";
import type { menuai, Route } from "../../src/types";
import "./menuaiio-panel-router";

@customElement("menuaiio-panel")
class menuaiioPanel extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: false }) public supervisor!: Supervisor;

  @property({ type: Boolean }) public narrow = false;

  @property({ attribute: false }) public route!: Route;

  protected render(): TemplateResult {
    if (!this.menuai) {
      return html`<menuai-loading-screen></menuai-loading-screen>`;
    }

    if (
      Object.keys(supervisorCollection).some(
        (collection) => !this.supervisor[collection]
      )
    ) {
      return html`<menuai-loading-screen></menuai-loading-screen>`;
    }
    return html`
      <menuaiio-panel-router
        .menuai=${this.menuai}
        .supervisor=${this.supervisor}
        .route=${this.route}
        .narrow=${this.narrow}
      ></menuaiio-panel-router>
    `;
  }

  static styles = css`
    :host {
      --app-header-background-color: var(--sidebar-background-color);
      --app-header-text-color: var(--sidebar-text-color);
      --app-header-border-bottom: 1px solid var(--divider-color);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "menuaiio-panel": menuaiioPanel;
  }
}
