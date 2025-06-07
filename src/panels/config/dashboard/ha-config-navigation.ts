import type { CSSResultGroup, TemplateResult } from "lit";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators";
import { canShowPage } from "../../../common/config/can_show_page";
import "../../../components/ha-card";
import "../../../components/ha-icon-next";
import "../../../components/ha-navigation-list";
import type { CloudStatus } from "../../../data/cloud";
import type { PageNavigation } from "../../../layouts/menuai-tabs-subpage";
import type { menuai } from "../../../types";

@customElement("ha-config-navigation")
class HaConfigNavigation extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ type: Boolean }) public narrow = false;

  @property({ attribute: false }) public pages!: PageNavigation[];

  protected render(): TemplateResult {
    const pages = this.pages
      .filter((page) =>
        page.path === "#external-app-configuration"
          ? this.menuai.auth.external?.config.menuaiettingsScreen
          : canShowPage(this.menuai, page)
      )
      .map((page) => ({
        ...page,
        name:
          page.name ||
          this.menuai.localize(
            `ui.panel.config.dashboard.${page.translationKey}.main`
          ),
        description:
          page.component === "cloud" && (page.info as CloudStatus)
            ? page.info.logged_in
              ? `
                  ${this.menuai.localize(
                    "ui.panel.config.cloud.description_login"
                  )}
                `
              : `
                  ${this.menuai.localize(
                    "ui.panel.config.cloud.description_features"
                  )}
                `
            : `
                ${
                  page.description ||
                  this.menuai.localize(
                    `ui.panel.config.dashboard.${page.translationKey}.secondary`
                  )
                }
              `,
      }));
    return html`
      <ha-navigation-list
        has-secondary
        .menuai=${this.menuai}
        .narrow=${this.narrow}
        .pages=${pages}
        .label=${this.menuai.localize("panel.config")}
      ></ha-navigation-list>
    `;
  }

  static styles: CSSResultGroup = css`
    ha-navigation-list {
      --navigation-list-item-title-font-size: var(--ha-font-size-l);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-config-navigation": HaConfigNavigation;
  }
}
