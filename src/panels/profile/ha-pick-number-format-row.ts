import type { TemplateResult } from "lit";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators";
import { fireEvent } from "../../common/dom/fire_event";
import { formatNumber } from "../../common/number/format_number";
import "../../components/ha-card";
import "../../components/ha-list-item";
import "../../components/ha-select";
import "../../components/ha-settings-row";
import { NumberFormat } from "../../data/translation";
import type { menuai } from "../../types";

@customElement("ha-pick-number-format-row")
class NumberFormatRow extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ type: Boolean }) public narrow = false;

  protected render(): TemplateResult {
    return html`
      <ha-settings-row .narrow=${this.narrow}>
        <span slot="heading">
          ${this.menuai.localize("ui.panel.profile.number_format.header")}
        </span>
        <span slot="description">
          ${this.menuai.localize("ui.panel.profile.number_format.description")}
        </span>
        <ha-select
          .label=${this.menuai.localize(
            "ui.panel.profile.number_format.dropdown_label"
          )}
          .disabled=${this.menuai.locale === undefined}
          .value=${this.menuai.locale.number_format}
          @selected=${this._handleFormatSelection}
          naturalMenuWidth
        >
          ${Object.values(NumberFormat).map((format) => {
            const formattedNumber = formatNumber(1234567.89, {
              ...this.menuai.locale,
              number_format: format,
            });
            const value = this.menuai.localize(
              `ui.panel.profile.number_format.formats.${format}`
            );
            const twoLine = value.slice(value.length - 2) !== "89"; // Display explicit number formats on one line
            return html`
              <ha-list-item .value=${format} .twoline=${twoLine}>
                <span>${value}</span>
                ${twoLine
                  ? html`<span slot="secondary">${formattedNumber}</span>`
                  : ""}
              </ha-list-item>
            `;
          })}
        </ha-select>
      </ha-settings-row>
    `;
  }

  private async _handleFormatSelection(ev) {
    fireEvent(this, "menuai-number-format-select", ev.target.value);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-pick-number-format-row": NumberFormatRow;
  }
}
