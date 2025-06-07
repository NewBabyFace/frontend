import type { TemplateResult } from "lit";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators";
import { isComponentLoaded } from "../../common/config/is_component_loaded";
import { pushSupported } from "../../components/ha-push-notifications-toggle";
import "../../components/ha-settings-row";
import { documentationUrl } from "../../util/documentation-url";
import type { menuai } from "../../types";

@customElement("ha-push-notifications-row")
class HaPushNotificationsRow extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ type: Boolean }) public narrow = false;

  protected render(): TemplateResult {
    const platformLoaded = isComponentLoaded(this.menuai, "html5.notify");
    let descriptionKey:
      | "error_use_https"
      | "error_load_platform"
      | "description";
    if (!pushSupported) {
      descriptionKey = "error_use_https";
    } else if (!platformLoaded) {
      descriptionKey = "error_load_platform";
    } else {
      descriptionKey = "description";
    }

    const isDisabled = !platformLoaded || !pushSupported;

    return html`
      <ha-settings-row .narrow=${this.narrow}>
        <span slot="heading"
          >${this.menuai.localize(
            "ui.panel.profile.push_notifications.header"
          )}</span
        >
        <span slot="description">
          ${this.menuai.localize(
            `ui.panel.profile.push_notifications.${descriptionKey}`
          )}
          <a
            href=${documentationUrl(this.menuai, "/integrations/html5")}
            target="_blank"
            rel="noreferrer"
            >${this.menuai.localize(
              "ui.panel.profile.push_notifications.link_promo"
            )}</a
          >
        </span>
        <ha-push-notifications-toggle
          .menuai=${this.menuai}
          .disabled=${isDisabled}
        ></ha-push-notifications-toggle>
      </ha-settings-row>
    `;
  }

  static styles = css`
    a {
      color: var(--primary-color);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-push-notifications-row": HaPushNotificationsRow;
  }
}
