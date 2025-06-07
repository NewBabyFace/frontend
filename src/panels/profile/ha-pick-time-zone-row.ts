import type { TemplateResult } from "lit";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators";
import { formatDateTimeNumeric } from "../../common/datetime/format_date_time";
import { resolveTimeZone } from "../../common/datetime/resolve-time-zone";
import { fireEvent } from "../../common/dom/fire_event";
import "../../components/ha-card";
import "../../components/ha-list-item";
import "../../components/ha-select";
import "../../components/ha-settings-row";
import { TimeZone } from "../../data/translation";
import type { menuai } from "../../types";

@customElement("ha-pick-time-zone-row")
class TimeZoneRow extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ type: Boolean }) public narrow = false;

  protected render(): TemplateResult {
    const date = new Date();
    return html`
      <ha-settings-row .narrow=${this.narrow}>
        <span slot="heading">
          ${this.menuai.localize("ui.panel.profile.time_zone.header")}
        </span>
        <span slot="description">
          ${this.menuai.localize("ui.panel.profile.time_zone.description")}
        </span>
        <ha-select
          .label=${this.menuai.localize(
            "ui.panel.profile.time_zone.dropdown_label"
          )}
          .disabled=${this.menuai.locale === undefined}
          .value=${this.menuai.locale.time_zone}
          @selected=${this._handleFormatSelection}
          naturalMenuWidth
        >
          ${Object.values(TimeZone).map((format) => {
            const formattedTime = formatDateTimeNumeric(
              date,
              {
                ...this.menuai.locale,
                time_zone: format,
              },
              this.menuai.config
            );
            return html`<ha-list-item .value=${format} twoline>
              <span
                >${this.menuai.localize(
                  `ui.panel.profile.time_zone.options.${format}`,
                  {
                    timezone: resolveTimeZone(
                      format,
                      this.menuai.config.time_zone
                    ).replace("_", " "),
                  }
                )}</span
              >
              <span slot="secondary">${formattedTime}</span>
            </ha-list-item>`;
          })}
        </ha-select>
      </ha-settings-row>
    `;
  }

  private async _handleFormatSelection(ev) {
    fireEvent(this, "menuai-time-zone-select", ev.target.value);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-pick-time-zone-row": TimeZoneRow;
  }
}
