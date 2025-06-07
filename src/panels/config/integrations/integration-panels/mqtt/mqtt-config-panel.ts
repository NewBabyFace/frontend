import "@material/mwc-button";
import type { CSSResultGroup, TemplateResult } from "lit";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators";
import { storage } from "../../../../../common/decorators/storage";
import "../../../../../components/ha-card";
import "../../../../../components/ha-code-editor";
import "../../../../../components/ha-formfield";
import "../../../../../components/ha-list-item";
import "../../../../../components/ha-switch";
import { getConfigEntries } from "../../../../../data/config_entries";
import { showOptionsFlowDialog } from "../../../../../dialogs/config-flow/show-dialog-options-flow";
import "../../../../../layouts/menuai-subpage";
import { haStyle } from "../../../../../resources/styles";
import type { menuai } from "../../../../../types";
import "./mqtt-subscribe-card";

const qosLevel = ["0", "1", "2"];

@customElement("mqtt-config-panel")
export class MQTTConfigPanel extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ type: Boolean }) public narrow = false;

  @state()
  @storage({
    key: "panel-dev-mqtt-topic-ls",
    state: true,
    subscribe: false,
  })
  private _topic = "";

  @state()
  @storage({
    key: "panel-dev-mqtt-payload-ls",
    state: true,
    subscribe: false,
  })
  private _payload = "";

  @state()
  @storage({
    key: "panel-dev-mqtt-qos-ls",
    state: true,
    subscribe: false,
  })
  private _qos = "0";

  @state()
  @storage({
    key: "panel-dev-mqtt-retain-ls",
    state: true,
    subscribe: false,
  })
  private _retain = false;

  @state()
  @storage({
    key: "panel-dev-mqtt-allow-template-ls",
    state: true,
    subscribe: false,
  })
  private _allowTemplate = false;

  protected render(): TemplateResult {
    return html`
      <menuai-subpage .narrow=${this.narrow} .menuai=${this.menuai}>
        <div class="content">
          <ha-card
            .header=${this.menuai.localize("ui.panel.config.mqtt.settings_title")}
          >
            <div class="card-actions">
              <mwc-button @click=${this._openOptionFlow}
                >${this.menuai.localize(
                  "ui.panel.config.mqtt.option_flow"
                )}</mwc-button
              >
            </div>
          </ha-card>
          <ha-card
            .header=${this.menuai.localize(
              "ui.panel.config.mqtt.description_publish"
            )}
          >
            <div class="card-content">
              <div class="panel-dev-mqtt-fields">
                <ha-textfield
                  .label=${this.menuai.localize("ui.panel.config.mqtt.topic")}
                  .value=${this._topic}
                  @change=${this._handleTopic}
                ></ha-textfield>
                <ha-select
                  .label=${this.menuai.localize("ui.panel.config.mqtt.qos")}
                  .value=${this._qos}
                  @selected=${this._handleQos}
                  >${qosLevel.map(
                    (qos) =>
                      html`<ha-list-item .value=${qos}>${qos}</ha-list-item>`
                  )}
                </ha-select>
                <ha-formfield
                  label=${this.menuai!.localize("ui.panel.config.mqtt.retain")}
                >
                  <ha-switch
                    @change=${this._handleRetain}
                    .checked=${this._retain}
                  ></ha-switch>
                </ha-formfield>
              </div>
              <p>
                <ha-formfield
                  .label=${this.menuai!.localize(
                    "ui.panel.config.mqtt.allow_template"
                  )}
                >
                  <ha-switch
                    @change=${this._handleAllowTemplate}
                    .checked=${this._allowTemplate}
                  ></ha-switch>
                </ha-formfield>
              </p>
              <p>
                ${this._allowTemplate
                  ? this.menuai.localize("ui.panel.config.mqtt.payload")
                  : this.menuai.localize(
                      "ui.panel.config.mqtt.payload_no_template"
                    )}
              </p>
              <ha-code-editor
                mode="jinja2"
                autocomplete-entities
                autocomplete-icons
                .menuai=${this.menuai}
                .value=${this._payload}
                @value-changed=${this._handlePayload}
                dir="ltr"
              ></ha-code-editor>
            </div>
            <div class="card-actions">
              <mwc-button @click=${this._publish}
                >${this.menuai.localize(
                  "ui.panel.config.mqtt.publish"
                )}</mwc-button
              >
            </div>
          </ha-card>

          <mqtt-subscribe-card .menuai=${this.menuai}></mqtt-subscribe-card>
        </div>
      </menuai-subpage>
    `;
  }

  private _handleTopic(ev: CustomEvent) {
    this._topic = (ev.target! as any).value;
  }

  private _handlePayload(ev: CustomEvent) {
    this._payload = ev.detail.value;
  }

  private _handleQos(ev: CustomEvent) {
    const newValue = (ev.target! as any).value;
    if (newValue >= 0 && newValue !== this._qos) {
      this._qos = newValue;
    }
  }

  private _handleRetain(ev: CustomEvent) {
    this._retain = (ev.target! as any).checked;
  }

  private _handleAllowTemplate(ev: CustomEvent) {
    this._allowTemplate = (ev.target! as any).checked;
  }

  private _publish(): void {
    if (!this.menuai) {
      return;
    }
    this.menuai.callService("mqtt", "publish", {
      topic: this._topic,
      payload: !this._allowTemplate ? this._payload : undefined,
      payload_template: this._allowTemplate ? this._payload : undefined,
      qos: parseInt(this._qos),
      retain: this._retain,
    });
  }

  private async _openOptionFlow() {
    const searchParams = new URLSearchParams(window.location.search);
    if (!searchParams.has("config_entry")) {
      return;
    }
    const configEntryId = searchParams.get("config_entry") as string;
    const configEntries = await getConfigEntries(this.menuai, {
      domain: "mqtt",
    });
    const configEntry = configEntries.find(
      (entry) => entry.entry_id === configEntryId
    );
    showOptionsFlowDialog(this, configEntry!);
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      css`
        :host {
          -ms-user-select: initial;
          -webkit-user-select: initial;
          -moz-user-select: initial;
        }

        .content {
          padding: 24px 0 32px;
          max-width: 600px;
          margin: 0 auto;
          direction: ltr;
        }
        .panel-dev-mqtt-fields {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
        }
        ha-select {
          width: 96px;
          margin: 0 8px;
        }
        ha-textfield {
          flex: 1;
        }
        @media screen and (max-width: 600px) {
          ha-select {
            margin-left: 0px;
            margin-inline-start: 0px;
            margin-inline-end: initial;
            margin-top: 8px;
          }
          ha-textfield {
            flex: auto;
            width: 100%;
          }
        }
        ha-card:first-child {
          margin-bottom: 16px;
        }
        mqtt-subscribe-card {
          display: block;
          margin: 16px auto;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "mqtt-config-panel": MQTTConfigPanel;
  }
}
