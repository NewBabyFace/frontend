import { LitElement, html, nothing } from "lit";
import { customElement, property } from "lit/decorators";
import { fireEvent } from "../common/dom/fire_event";
import type { menuai } from "../types";
import "./ha-multi-textfield";

@customElement("ha-aliases-editor")
class AliasesEditor extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ type: Array }) public aliases!: string[];

  @property({ type: Boolean }) public disabled = false;

  protected render() {
    if (!this.aliases) {
      return nothing;
    }

    return html`
      <ha-multi-textfield
        .menuai=${this.menuai}
        .value=${this.aliases}
        .disabled=${this.disabled}
        .label=${this.menuai!.localize("ui.dialogs.aliases.label")}
        .removeLabel=${this.menuai!.localize("ui.dialogs.aliases.remove")}
        .addLabel=${this.menuai!.localize("ui.dialogs.aliases.add")}
        item-index
        @value-changed=${this._aliasesChanged}
      >
      </ha-multi-textfield>
    `;
  }

  private _aliasesChanged(value) {
    fireEvent(this, "value-changed", { value });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-aliases-editor": AliasesEditor;
  }
}
