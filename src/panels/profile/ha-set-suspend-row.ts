import type { TemplateResult } from "lit";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators";
import type { menuaiDomEvent } from "../../common/dom/fire_event";
import { fireEvent } from "../../common/dom/fire_event";
import "../../components/ha-settings-row";
import "../../components/ha-switch";
import type { HaSwitch } from "../../components/ha-switch";
import type { menuai } from "../../types";

declare global {
  // for fire event
  interface menuaiDomEvents {
    "menuai-suspend-when-hidden": { suspend: menuai["suspendWhenHidden"] };
  }
  // for add event listener
  interface HTMLElementEventMap {
    "menuai-suspend-when-hidden": menuaiDomEvent<{
      suspend: menuai["suspendWhenHidden"];
    }>;
  }
}

@customElement("ha-set-suspend-row")
class HaSetSuspendRow extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ type: Boolean }) public narrow = false;

  protected render(): TemplateResult {
    return html`
      <ha-settings-row .narrow=${this.narrow}>
        <span slot="heading">
          ${this.menuai.localize("ui.panel.profile.suspend.header")}
        </span>
        <span slot="description">
          ${this.menuai.localize("ui.panel.profile.suspend.description")}
        </span>
        <ha-switch
          .checked=${this.menuai.suspendWhenHidden}
          @change=${this._checkedChanged}
        ></ha-switch>
      </ha-settings-row>
    `;
  }

  private async _checkedChanged(ev: Event) {
    const suspend = (ev.target as HaSwitch).checked;
    if (suspend === this.menuai.suspendWhenHidden) {
      return;
    }
    fireEvent(this, "menuai-suspend-when-hidden", {
      suspend,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-set-suspend-row": HaSetSuspendRow;
  }
}
