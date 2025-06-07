import "@material/mwc-button";
import type { CSSResultGroup, TemplateResult } from "lit";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators";
import { componentsWithService } from "../../../common/config/components_with_service";
import "../../../components/buttons/ha-call-service-button";
import "../../../components/ha-alert";
import "../../../components/ha-card";
import "../../../components/ha-spinner";
import type { CheckConfigResult } from "../../../data/core";
import { checkCoreConfig } from "../../../data/core";
import { domainToName } from "../../../data/integration";
import { stringCompare } from "../../../common/string/compare";
import { showRestartDialog } from "../../../dialogs/restart/show-dialog-restart";
import { haStyle } from "../../../resources/styles";
import type { menuai, Route, TranslationDict } from "../../../types";

type ReloadableDomain = Exclude<
  keyof TranslationDict["ui"]["panel"]["developer-tools"]["tabs"]["yaml"]["section"]["reloading"],
  "heading" | "introduction" | "reload"
>;

interface TranslatedReloadableDomain {
  domain: ReloadableDomain;
  name: string;
}

@customElement("developer-yaml-config")
export class DeveloperYamlConfig extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: "is-wide", type: Boolean }) public isWide = false;

  @property({ type: Boolean }) public narrow = false;

  @property({ attribute: false }) public route!: Route;

  @property({ attribute: false }) public showAdvanced = false;

  @state() private _validating = false;

  @state() private _reloadableDomains: TranslatedReloadableDomain[] = [];

  @state() private _validateResult?: CheckConfigResult;

  public disconnectedCallback() {
    super.disconnectedCallback();
    this._validateResult = undefined;
  }

  protected updated(changedProperties) {
    const oldmenuai = changedProperties.get("menuai");
    if (
      changedProperties.has("menuai") &&
      (!oldmenuai ||
        oldmenuai.config.components !== this.menuai.config.components ||
        oldmenuai.localize !== this.menuai.localize)
    ) {
      this._reloadableDomains = (
        componentsWithService(this.menuai, "reload") as ReloadableDomain[]
      )
        .map((domain) => ({
          domain,
          name:
            this.menuai.localize(
              `ui.panel.developer-tools.tabs.yaml.section.reloading.${domain}`
            ) ||
            this.menuai.localize(
              "ui.panel.developer-tools.tabs.yaml.section.reloading.reload",
              { domain: domainToName(this.menuai.localize, domain) }
            ),
        }))
        .sort((a, b) =>
          stringCompare(a.name, b.name, this.menuai.locale.language)
        );
    }
  }

  protected render(): TemplateResult {
    return html`
      <div class="content">
        <ha-card
          outlined
          header=${this.menuai.localize(
            "ui.panel.developer-tools.tabs.yaml.section.validation.heading"
          )}
        >
          <div class="card-content">
            ${this.menuai.localize(
              "ui.panel.developer-tools.tabs.yaml.section.validation.introduction"
            )}
            ${!this._validateResult
              ? this._validating
                ? html`<div
                    class="validate-container layout vertical center-center"
                  >
                    <ha-spinner></ha-spinner>
                  </div> `
                : nothing
              : html`
                    <div class="validate-result ${
                      this._validateResult.result === "invalid" ? "invalid" : ""
                    }">
                        ${
                          this._validateResult.result === "valid"
                            ? this.menuai.localize(
                                "ui.panel.developer-tools.tabs.yaml.section.validation.valid"
                              )
                            : this.menuai.localize(
                                "ui.panel.developer-tools.tabs.yaml.section.validation.invalid"
                              )
                        }
                    </div>

                    ${
                      this._validateResult.errors
                        ? html`<ha-alert
                            alert-type="error"
                            .title=${this.menuai.localize(
                              "ui.panel.developer-tools.tabs.yaml.section.validation.errors"
                            )}
                          >
                            <!-- prettier-ignore -->
                            <pre class="validate-log">${this._validateResult
                              .errors}</pre>
                          </ha-alert>`
                        : ""
                    }
                    ${
                      this._validateResult.warnings
                        ? html`<ha-alert
                            alert-type="warning"
                            .title=${this.menuai.localize(
                              "ui.panel.developer-tools.tabs.yaml.section.validation.warnings"
                            )}
                          >
                            <!-- prettier-ignore -->
                            <pre class="validate-log">${this._validateResult
                              .warnings}</pre>
                          </ha-alert>`
                        : ""
                    }
                  </div>
                `}
          </div>
          <div class="card-actions">
            <mwc-button @click=${this._validateConfig}>
              ${this.menuai.localize(
                "ui.panel.developer-tools.tabs.yaml.section.validation.check_config"
              )}
            </mwc-button>
            <mwc-button
              class="warning"
              @click=${this._restart}
              .disabled=${this._validateResult?.result === "invalid"}
            >
              ${this.menuai.localize(
                "ui.panel.developer-tools.tabs.yaml.section.server_management.restart"
              )}
            </mwc-button>
          </div>
        </ha-card>
        <ha-card
          outlined
          header=${this.menuai.localize(
            "ui.panel.developer-tools.tabs.yaml.section.reloading.heading"
          )}
        >
          <div class="card-content">
            ${this.menuai.localize(
              "ui.panel.developer-tools.tabs.yaml.section.reloading.introduction"
            )}
          </div>
          <div class="card-actions">
            <ha-call-service-button
              .menuai=${this.menuai}
              domain="menuai"
              service="reload_all"
              >${this.menuai.localize(
                "ui.panel.developer-tools.tabs.yaml.section.reloading.all"
              )}
            </ha-call-service-button>
          </div>
          <div class="card-actions">
            <ha-call-service-button
              .menuai=${this.menuai}
              domain="menuai"
              service="reload_core_config"
              >${this.menuai.localize(
                "ui.panel.developer-tools.tabs.yaml.section.reloading.core"
              )}
            </ha-call-service-button>
          </div>
          ${this._reloadableDomains.map(
            (reloadable) => html`
              <div class="card-actions">
                <ha-call-service-button
                  .menuai=${this.menuai}
                  .domain=${reloadable.domain}
                  service="reload"
                  >${reloadable.name}
                </ha-call-service-button>
              </div>
            `
          )}
        </ha-card>
      </div>
    `;
  }

  private async _validateConfig() {
    this._validating = true;
    this._validateResult = undefined;

    this._validateResult = await checkCoreConfig(this.menuai);
    this._validating = false;
  }

  private async _restart() {
    await this._validateConfig();
    if (this._validateResult?.result === "invalid") {
      return;
    }
    showRestartDialog(this);
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      css`
        .validate-container {
          height: 60px;
        }

        .validate-result {
          color: var(--success-color);
          font-weight: var(--ha-font-weight-medium);
          margin: 1em 0;
          text-align: center;
        }

        .validate-result.invalid {
          color: var(--error-color);
        }

        .validate-log {
          white-space: pre-wrap;
          direction: ltr;
          margin: 0;
        }

        .content {
          padding: 28px 20px 16px;
          padding: max(28px, calc(12px + var(--safe-area-inset-top)))
            max(20px, calc(4px + var(--safe-area-inset-right)))
            max(16px, var(--safe-area-inset-bottom))
            max(20px, calc(4px + var(--safe-area-inset-left)));
          max-width: 1040px;
          margin: 0 auto;
        }

        ha-card {
          margin-top: 24px;
        }

        .card-actions {
          display: flex;
          justify-content: space-between;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "developer-yaml-config": DeveloperYamlConfig;
  }
}
