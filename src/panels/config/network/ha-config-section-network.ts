import type { TemplateResult } from "lit";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators";
import { isComponentLoaded } from "../../../common/config/is_component_loaded";
import "../../../layouts/menuai-subpage";
import "../../../components/ha-card";
import "../../../components/ha-md-list";
import "../../../components/ha-md-list-item";
import "../../../components/ha-icon-next";
import type { menuai, Route } from "../../../types";
import "./ha-config-network";
import "./ha-config-url-form";
import "./supervisor-hostname";
import "./supervisor-network";

const NETWORK_BROWSERS = ["dhcp", "ssdp", "zeroconf"] as const;

@customElement("ha-config-section-network")
class HaConfigSectionNetwork extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: false }) public route!: Route;

  @property({ type: Boolean }) public narrow = false;

  protected render(): TemplateResult {
    return html`
      <menuai-subpage
        back-path="/config/system"
        .menuai=${this.menuai}
        .narrow=${this.narrow}
        .header=${this.menuai.localize("ui.panel.config.network.caption")}
      >
        <div class="content">
          ${isComponentLoaded(this.menuai, "menuaiio")
            ? html`<supervisor-hostname
                  .menuai=${this.menuai}
                  .narrow=${this.narrow}
                ></supervisor-hostname>
                <supervisor-network .menuai=${this.menuai}></supervisor-network>`
            : ""}
          <ha-config-url-form .menuai=${this.menuai}></ha-config-url-form>
          <ha-config-network .menuai=${this.menuai}></ha-config-network>
          ${NETWORK_BROWSERS.some((component) =>
            isComponentLoaded(this.menuai, component)
          )
            ? html`
                <ha-card
                  outlined
                  class="discovery-card"
                  header=${this.menuai.localize(
                    "ui.panel.config.network.discovery.title"
                  )}
                >
                  <ha-md-list>
                    ${NETWORK_BROWSERS.map(
                      (domain) => html`
                        <ha-md-list-item type="link" href="/config/${domain}">
                          <div slot="headline">
                            ${this.menuai.localize(
                              `ui.panel.config.network.discovery.${domain}`
                            )}
                          </div>
                          <div slot="supporting-text">
                            ${this.menuai.localize(
                              `ui.panel.config.network.discovery.${domain}_info`
                            )}
                          </div>
                          <ha-icon-next slot="end"></ha-icon-next>
                        </ha-md-list-item>
                      `
                    )}
                  </ha-md-list>
                </ha-card>
              `
            : ""}
        </div>
      </menuai-subpage>
    `;
  }

  static styles = css`
    .content {
      padding: 28px 20px 0;
      max-width: 1040px;
      margin: 0 auto;
    }
    supervisor-hostname,
    supervisor-network,
    ha-config-url-form,
    ha-config-network,
    .discovery-card {
      display: block;
      margin: 0 auto;
      margin-bottom: 24px;
      max-width: 600px;
    }
    .discovery-card ha-md-list {
      padding-top: 0;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-config-section-network": HaConfigSectionNetwork;
  }
}
