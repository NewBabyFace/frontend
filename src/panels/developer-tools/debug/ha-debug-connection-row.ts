import type { TemplateResult } from "lit";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators";
import "../../../components/ha-settings-row";
import "../../../components/ha-switch";
import type { HaSwitch } from "../../../components/ha-switch";
import type { menuai } from "../../../types";
import { storeState } from "../../../util/ha-pref-storage";

@customElement("ha-debug-connection-row")
class HaDebugConnectionRow extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ type: Boolean }) public narrow = false;

  protected render(): TemplateResult {
    return html`
      <ha-settings-row .narrow=${this.narrow}>
        <span slot="heading">
          ${this.menuai.localize(
            "ui.panel.developer-tools.tabs.debug.debug_connection.title"
          )}
        </span>
        <span slot="description">
          ${this.menuai.localize(
            "ui.panel.developer-tools.tabs.debug.debug_connection.description"
          )}
        </span>
        <ha-switch
          .checked=${this.menuai.debugConnection}
          @change=${this._checkedChanged}
        ></ha-switch>
      </ha-settings-row>
    `;
  }

  private async _checkedChanged(ev: Event) {
    const debugConnection = (ev.target as HaSwitch).checked;
    if (debugConnection === this.menuai.debugConnection) {
      return;
    }
    this.menuai.debugConnection = debugConnection;
    storeState(this.menuai);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-debug-connection-row": HaDebugConnectionRow;
  }
}
