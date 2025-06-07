import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators";
import { fireEvent } from "../../common/dom/fire_event";
import "../../components/ha-language-picker";
import "../../components/ha-settings-row";
import type { menuai } from "../../types";

@customElement("ha-pick-language-row")
export class HaPickLanguageRow extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ type: Boolean }) public narrow = false;

  protected render() {
    return html`
      <ha-settings-row .narrow=${this.narrow}>
        <span slot="heading"
          >${this.menuai.localize("ui.panel.profile.language.header")}</span
        >
        <span slot="description">
          <a
            href="https://developers.home-assistant.io/docs/translations/"
            target="_blank"
            rel="noreferrer"
            >${this.menuai.localize("ui.panel.profile.language.link_promo")}</a
          >
        </span>
        <ha-language-picker
          .menuai=${this.menuai}
          native-name
          .label=${this.menuai.localize(
            "ui.panel.profile.language.dropdown_label"
          )}
          .value=${this.menuai.locale.language}
          @value-changed=${this._languageSelectionChanged}
          naturalMenuWidth
        >
        </ha-language-picker>
      </ha-settings-row>
    `;
  }

  private _languageSelectionChanged(ev) {
    // Only fire event if language was changed. This prevents select updates when
    // responding to menuai changes.
    if (ev.detail.value !== this.menuai.language) {
      fireEvent(this, "menuai-language-select", ev.detail.value);
    }
  }

  static styles = css`
    a {
      color: var(--primary-color);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-pick-language-row": HaPickLanguageRow;
  }
}
