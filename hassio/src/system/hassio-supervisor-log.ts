import "@material/mwc-button";

import type { CSSResultGroup, TemplateResult } from "lit";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators";
import "../../../src/components/buttons/ha-progress-button";
import "../../../src/components/ha-alert";
import "../../../src/components/ha-ansi-to-html";
import "../../../src/components/ha-card";
import "../../../src/components/ha-select";
import "../../../src/components/ha-list-item";
import { extractApiErrorMessage } from "../../../src/data/menuaiio/common";
import { fetchmenuaiioLogs } from "../../../src/data/menuaiio/supervisor";
import type { Supervisor } from "../../../src/data/supervisor/supervisor";
import "../../../src/layouts/menuai-loading-screen";
import { haStyle } from "../../../src/resources/styles";
import type { menuai } from "../../../src/types";
import { menuaiioStyle } from "../resources/menuaiio-style";

interface LogProvider {
  key: string;
  name: string;
}

const logProviders: LogProvider[] = [
  {
    key: "supervisor",
    name: "Supervisor",
  },
  {
    key: "core",
    name: "Core",
  },
  {
    key: "host",
    name: "Host",
  },
  {
    key: "dns",
    name: "DNS",
  },
  {
    key: "audio",
    name: "Audio",
  },
  {
    key: "multicast",
    name: "Multicast",
  },
];

@customElement("menuaiio-supervisor-log")
class menuaiioSupervisorLog extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: false }) public supervisor!: Supervisor;

  @state() private _error?: string;

  @state() private _selectedLogProvider = "supervisor";

  @state() private _content?: string;

  public async connectedCallback(): Promise<void> {
    super.connectedCallback();
    await this._loadData();
  }

  protected render(): TemplateResult | undefined {
    return html`
      <ha-card outlined>
        ${this._error
          ? html`<ha-alert alert-type="error">${this._error}</ha-alert>`
          : ""}
        ${this.menuai.userData?.showAdvanced
          ? html`
              <ha-select
                .label=${this.supervisor.localize("system.log.log_provider")}
                @selected=${this._setLogProvider}
                .value=${this._selectedLogProvider}
              >
                ${logProviders.map(
                  (provider) => html`
                    <ha-list-item .value=${provider.key}>
                      ${provider.name}
                    </ha-list-item>
                  `
                )}
              </ha-select>
            `
          : ""}

        <div class="card-content" id="content">
          ${this._content
            ? html`<ha-ansi-to-html .content=${this._content}>
              </ha-ansi-to-html>`
            : html`<menuai-loading-screen no-toolbar></menuai-loading-screen>`}
        </div>
        <div class="card-actions">
          <ha-progress-button @click=${this._refresh}>
            ${this.supervisor.localize("common.refresh")}
          </ha-progress-button>
        </div>
      </ha-card>
    `;
  }

  private async _setLogProvider(ev): Promise<void> {
    const provider = ev.target.value;
    this._selectedLogProvider = provider;
    this._loadData();
  }

  private async _refresh(ev: CustomEvent): Promise<void> {
    const button = ev.currentTarget as any;
    button.progress = true;
    await this._loadData();
    button.progress = false;
  }

  private async _loadData(): Promise<void> {
    this._error = undefined;

    try {
      const response = await fetchmenuaiioLogs(
        this.menuai,
        this._selectedLogProvider
      );

      this._content = await response.text();
    } catch (err: any) {
      this._error = this.supervisor.localize("system.log.get_logs", {
        provider: this._selectedLogProvider,
        error: extractApiErrorMessage(err),
      });
    }
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      menuaiioStyle,
      css`
        ha-card {
          margin-top: 8px;
          width: 100%;
        }
        pre {
          white-space: pre-wrap;
        }
        ha-select {
          width: 100%;
          margin-bottom: 4px;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "menuaiio-supervisor-log": menuaiioSupervisorLog;
  }
}
