import "../../../../src/components/ha-card";
import type { CSSResultGroup, TemplateResult } from "lit";
import { css, html, LitElement } from "lit";
import "../../../../src/components/ha-alert";
import "../../../../src/components/ha-spinner";
import "../../../../src/components/ha-markdown";
import { customElement, property, state } from "lit/decorators";
import type { menuaiioAddonDetails } from "../../../../src/data/menuaiio/addon";
import { fetchmenuaiioAddonDocumentation } from "../../../../src/data/menuaiio/addon";
import { extractApiErrorMessage } from "../../../../src/data/menuaiio/common";
import "../../../../src/layouts/menuai-loading-screen";
import { haStyle } from "../../../../src/resources/styles";
import type { menuai } from "../../../../src/types";
import { menuaiioStyle } from "../../resources/menuaiio-style";
import type { Supervisor } from "../../../../src/data/supervisor/supervisor";

@customElement("menuaiio-addon-documentation-tab")
class menuaiioAddonDocumentationDashboard extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: false }) public supervisor!: Supervisor;

  @property({ attribute: false }) public addon?: menuaiioAddonDetails;

  @state() private _error?: string;

  @state() private _content?: string;

  public async connectedCallback(): Promise<void> {
    super.connectedCallback();
    await this._loadData();
  }

  protected render(): TemplateResult {
    if (!this.addon) {
      return html`<ha-spinner></ha-spinner>`;
    }
    return html`
      <div class="content">
        <ha-card outlined>
          ${this._error
            ? html`<ha-alert alert-type="error">${this._error}</ha-alert>`
            : ""}
          <div class="card-content">
            ${this._content
              ? html`<ha-markdown
                  .content=${this._content}
                  lazy-images
                ></ha-markdown>`
              : html`<menuai-loading-screen no-toolbar></menuai-loading-screen>`}
          </div>
        </ha-card>
      </div>
    `;
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      menuaiioStyle,
      css`
        ha-card {
          display: block;
        }
        .content {
          margin: auto;
          padding: 8px;
          max-width: 1024px;
        }
        ha-markdown {
          padding: 16px;
        }
      `,
    ];
  }

  private async _loadData(): Promise<void> {
    this._error = undefined;
    try {
      this._content = await fetchmenuaiioAddonDocumentation(
        this.menuai,
        this.addon!.slug
      );
    } catch (err: any) {
      this._error = this.supervisor.localize(
        "addon.documentation.get_documentation",
        { error: extractApiErrorMessage(err) }
      );
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "menuaiio-addon-documentation-tab": menuaiioAddonDocumentationDashboard;
  }
}
