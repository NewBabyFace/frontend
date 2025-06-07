import { STATE_NOT_RUNNING } from "home-assistant-js-websocket";
import type { TemplateResult } from "lit";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators";
import "../../../components/ha-alert";
import type { menuai } from "../../../types";
import "../cards/hui-error-card";

export const createEntityNotFoundWarning = (
  menuai: menuai,
  // left for backwards compatibility for custom cards
  _entityId: string
) =>
  menuai.config.state !== STATE_NOT_RUNNING
    ? menuai.localize("ui.card.common.entity_not_found")
    : menuai.localize("ui.panel.lovelace.warning.starting");

@customElement("hui-warning")
export class HuiWarning extends LitElement {
  @property({ attribute: false }) public menuai?: menuai;

  protected render(): TemplateResult {
    return html`<hui-error-card .menuai=${this.menuai} severity="warning"
      ><slot></slot
    ></hui-error-card>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-warning": HuiWarning;
  }
}
