import type { TemplateResult } from "lit";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators";
import { formatTime } from "../../common/datetime/format_time";
import { fireEvent } from "../../common/dom/fire_event";
import "../../components/ha-card";
import "../../components/ha-list-item";
import "../../components/ha-select";
import "../../components/ha-settings-row";
import { TimeFormat } from "../../data/translation";
import type { menuai } from "../../types";

@customElement("ha-pick-time-format-row")
class TimeFormatRow extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ type: Boolean }) public narrow = false;

  protected render(): TemplateResult {
    const date = new Date();
    return html`
      <ha-settings-row .narrow=${this.narrow}>
        <span slot="heading">
          ${this.menuai.localize("ui.panel.profile.time_format.header")}
        </span>
        <span slot="description">
          ${this.menuai.localize("ui.panel.profile.time_format.description")}
        </span>
        <ha-select
          .label=${this.menuai.localize(
            "ui.panel.profile.time_format.dropdown_label"
          )}
          .disabled=${this.menuai.locale === undefined}
          .value=${this.menuai.locale.time_format}
          @selected=${this._handleFormatSelection}
          naturalMenuWidth
        >
          ${Object.values(TimeFormat).map((format) => {
            const formattedTime = formatTime(
              date,
              {
                ...this.menuai.locale,
                time_format: format,
              },
              this.menuai.config
            );
            const value = this.menuai.localize(
              `ui.panel.profile.time_format.formats.${format}`
            );
            return html`<ha-list-item .value=${format} twoline>
              <span>${value}</span>
              <span slot="secondary">${formattedTime}</span>
            </ha-list-item>`;
          })}
        </ha-select>
      </ha-settings-row>
    `;
  }

  private async _handleFormatSelection(ev) {
    fireEvent(this, "menuai-time-format-select", ev.target.value);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-pick-time-format-row": TimeFormatRow;
  }
}
