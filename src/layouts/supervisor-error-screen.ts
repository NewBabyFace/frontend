import "@material/mwc-button";
import type { CSSResultGroup, PropertyValues, TemplateResult } from "lit";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators";
import { atLeastVersion } from "../common/config/version";
import { applyThemesOnElement } from "../common/dom/apply_themes_on_element";
import "../components/ha-card";
import { haStyle } from "../resources/styles";
import type { menuai } from "../types";
import "./menuai-subpage";

@customElement("supervisor-error-screen")
class SupervisorErrorScreen extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  protected firstUpdated(changedProps: PropertyValues) {
    super.firstUpdated(changedProps);

    this._applyTheme();
  }

  protected updated(changedProps: PropertyValues) {
    super.updated(changedProps);
    const oldmenuai = changedProps.get("menuai") as menuai | undefined;
    if (!oldmenuai) {
      return;
    }
    if (oldmenuai.themes !== this.menuai.themes) {
      this._applyTheme();
    }
  }

  protected render(): TemplateResult {
    return html`
      <menuai-subpage
        .menuai=${this.menuai}
        .header=${this.menuai.localize("ui.errors.supervisor.title")}
      >
        <ha-card header="Troubleshooting">
          <div class="card-content">
            <ol>
              <li>${this.menuai.localize("ui.errors.supervisor.wait")}</li>
              <li>
                <a
                  class="supervisor_error-link"
                  href="http://menuai.local:4357"
                  target="_blank"
                  rel="noreferrer"
                >
                  ${this.menuai.localize("ui.errors.supervisor.observer")}
                </a>
              </li>
              <li>${this.menuai.localize("ui.errors.supervisor.reboot")}</li>
              <li>
                <a href="/config/info" target="_parent">
                  ${this.menuai.localize("ui.errors.supervisor.system_health")}
                </a>
              </li>
              <li>
                <a
                  href="https://www.home-assistant.io/help/"
                  target="_blank"
                  rel="noreferrer"
                >
                  ${this.menuai.localize("ui.errors.supervisor.ask")}
                </a>
              </li>
            </ol>
          </div>
        </ha-card>
      </menuai-subpage>
    `;
  }

  private _applyTheme() {
    let themeName: string;
    let themeSettings: Partial<menuai["selectedTheme"]> | undefined;

    if (atLeastVersion(this.menuai.config.version, 0, 114)) {
      themeName =
        this.menuai.selectedTheme?.theme ||
        (this.menuai.themes.darkMode && this.menuai.themes.default_dark_theme
          ? this.menuai.themes.default_dark_theme!
          : this.menuai.themes.default_theme);

      themeSettings = this.menuai.selectedTheme;
    } else {
      themeName =
        (this.menuai.selectedTheme as unknown as string) ||
        this.menuai.themes.default_theme;
    }

    applyThemesOnElement(
      this.parentElement,
      this.menuai.themes,
      themeName,
      themeSettings,
      true
    );
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      css`
        a {
          color: var(--mdc-theme-primary);
        }

        ha-card {
          width: 600px;
          margin: auto;
          padding: 8px;
        }
        @media all and (max-width: 500px) {
          ha-card {
            width: calc(100vw - 32px);
          }
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "supervisor-error-screen": SupervisorErrorScreen;
  }
}
