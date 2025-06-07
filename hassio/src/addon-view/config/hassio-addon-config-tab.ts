import type { CSSResultGroup, TemplateResult } from "lit";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators";
import "../../../../src/components/ha-spinner";
import type { menuaiioAddonDetails } from "../../../../src/data/menuaiio/addon";
import type { Supervisor } from "../../../../src/data/supervisor/supervisor";
import { haStyle } from "../../../../src/resources/styles";
import type { menuai } from "../../../../src/types";
import { menuaiioStyle } from "../../resources/menuaiio-style";
import "../info/menuaiio-addon-system-managed";
import "./menuaiio-addon-audio";
import "./menuaiio-addon-config";
import "./menuaiio-addon-network";

@customElement("menuaiio-addon-config-tab")
class menuaiioAddonConfigDashboard extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: false }) public supervisor!: Supervisor;

  @property({ attribute: false }) public addon?: menuaiioAddonDetails;

  @property({ type: Boolean }) public narrow = false;

  @property({ type: Boolean, attribute: "control-enabled" })
  public controlEnabled = false;

  protected render(): TemplateResult {
    if (!this.addon) {
      return html`<ha-spinner></ha-spinner>`;
    }
    const hasConfiguration =
      (this.addon.options && Object.keys(this.addon.options).length) ||
      (this.addon.schema && Object.keys(this.addon.schema).length);

    return html`
      <div class="content">
        ${this.addon.system_managed &&
        (hasConfiguration || this.addon.network || this.addon.audio)
          ? html`
              <menuaiio-addon-system-managed
                .supervisor=${this.supervisor}
                .narrow=${this.narrow}
                .hideButton=${this.controlEnabled}
              ></menuaiio-addon-system-managed>
            `
          : nothing}
        ${hasConfiguration || this.addon.network || this.addon.audio
          ? html`
              ${hasConfiguration
                ? html`
                    <menuaiio-addon-config
                      .menuai=${this.menuai}
                      .addon=${this.addon}
                      .supervisor=${this.supervisor}
                      .disabled=${this.addon.system_managed &&
                      !this.controlEnabled}
                    ></menuaiio-addon-config>
                  `
                : nothing}
              ${this.addon.network
                ? html`
                    <menuaiio-addon-network
                      .menuai=${this.menuai}
                      .addon=${this.addon}
                      .supervisor=${this.supervisor}
                      .disabled=${this.addon.system_managed &&
                      !this.controlEnabled}
                    ></menuaiio-addon-network>
                  `
                : nothing}
              ${this.addon.audio
                ? html`
                    <menuaiio-addon-audio
                      .menuai=${this.menuai}
                      .addon=${this.addon}
                      .supervisor=${this.supervisor}
                      .disabled=${this.addon.system_managed &&
                      !this.controlEnabled}
                    ></menuaiio-addon-audio>
                  `
                : nothing}
            `
          : this.supervisor.localize("addon.configuration.no_configuration")}
      </div>
    `;
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      menuaiioStyle,
      css`
        .content {
          margin: auto;
          padding: 8px;
          max-width: 1024px;
        }
        menuaiio-addon-network,
        menuaiio-addon-audio,
        menuaiio-addon-config {
          margin-bottom: 24px;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "menuaiio-addon-config-tab": menuaiioAddonConfigDashboard;
  }
}
