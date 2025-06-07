import type { TemplateResult } from "lit";
import { LitElement, css, html } from "lit";
import { customElement, state } from "lit/decorators";
import { mockAreaRegistry } from "../../../../demo/src/stubs/area_registry";
import { mockAuth } from "../../../../demo/src/stubs/auth";
import { mockConfig } from "../../../../demo/src/stubs/config";
import { mockDeviceRegistry } from "../../../../demo/src/stubs/device_registry";
import { mockEntityRegistry } from "../../../../demo/src/stubs/entity_registry";
import { mockmenuaiioSupervisor } from "../../../../demo/src/stubs/menuaiio_supervisor";
import { mockTags } from "../../../../demo/src/stubs/tags";
import "../../../../src/components/ha-formfield";
import type { Trigger } from "../../../../src/data/automation";
import { providemenuai } from "../../../../src/fake_data/provide_menuai";
import "../../../../src/panels/config/automation/trigger/ha-automation-trigger";
import { HaConversationTrigger } from "../../../../src/panels/config/automation/trigger/types/ha-automation-trigger-conversation";
import { HaDeviceTrigger } from "../../../../src/panels/config/automation/trigger/types/ha-automation-trigger-device";
import { HaEventTrigger } from "../../../../src/panels/config/automation/trigger/types/ha-automation-trigger-event";
import { HaGeolocationTrigger } from "../../../../src/panels/config/automation/trigger/types/ha-automation-trigger-geo_location";
import { HamenuaiTrigger } from "../../../../src/panels/config/automation/trigger/types/ha-automation-trigger-menuai";
import { HaTriggerList } from "../../../../src/panels/config/automation/trigger/types/ha-automation-trigger-list";
import { HaMQTTTrigger } from "../../../../src/panels/config/automation/trigger/types/ha-automation-trigger-mqtt";
import { HaNumericStateTrigger } from "../../../../src/panels/config/automation/trigger/types/ha-automation-trigger-numeric_state";
import { HaPersistentNotificationTrigger } from "../../../../src/panels/config/automation/trigger/types/ha-automation-trigger-persistent_notification";
import { HaStateTrigger } from "../../../../src/panels/config/automation/trigger/types/ha-automation-trigger-state";
import { HaSunTrigger } from "../../../../src/panels/config/automation/trigger/types/ha-automation-trigger-sun";
import { HaTagTrigger } from "../../../../src/panels/config/automation/trigger/types/ha-automation-trigger-tag";
import { HaTemplateTrigger } from "../../../../src/panels/config/automation/trigger/types/ha-automation-trigger-template";
import { HaTimeTrigger } from "../../../../src/panels/config/automation/trigger/types/ha-automation-trigger-time";
import { HaTimePatternTrigger } from "../../../../src/panels/config/automation/trigger/types/ha-automation-trigger-time_pattern";
import { HaWebhookTrigger } from "../../../../src/panels/config/automation/trigger/types/ha-automation-trigger-webhook";
import { HaZoneTrigger } from "../../../../src/panels/config/automation/trigger/types/ha-automation-trigger-zone";
import type { menuai } from "../../../../src/types";
import "../../components/demo-black-white-row";

const SCHEMAS: { name: string; triggers: Trigger[] }[] = [
  {
    name: "State",
    triggers: [{ ...HaStateTrigger.defaultConfig }],
  },

  {
    name: "MQTT",
    triggers: [{ ...HaMQTTTrigger.defaultConfig }],
  },

  {
    name: "GeoLocation",
    triggers: [{ ...HaGeolocationTrigger.defaultConfig }],
  },

  {
    name: "MenuAI",
    triggers: [{ ...HamenuaiTrigger.defaultConfig }],
  },

  {
    name: "Numeric State",
    triggers: [{ ...HaNumericStateTrigger.defaultConfig }],
  },

  {
    name: "Sun",
    triggers: [{ ...HaSunTrigger.defaultConfig }],
  },

  {
    name: "Time Pattern",
    triggers: [{ ...HaTimePatternTrigger.defaultConfig }],
  },

  {
    name: "Webhook",
    triggers: [{ ...HaWebhookTrigger.defaultConfig }],
  },

  {
    name: "Persistent Notification",
    triggers: [
      {
        ...HaPersistentNotificationTrigger.defaultConfig,
      },
    ],
  },

  {
    name: "Zone",
    triggers: [{ ...HaZoneTrigger.defaultConfig }],
  },

  {
    name: "Tag",
    triggers: [{ ...HaTagTrigger.defaultConfig }],
  },

  {
    name: "Time",
    triggers: [{ ...HaTimeTrigger.defaultConfig }],
  },

  {
    name: "Template",
    triggers: [{ ...HaTemplateTrigger.defaultConfig }],
  },

  {
    name: "Event",
    triggers: [{ ...HaEventTrigger.defaultConfig }],
  },

  {
    name: "Device Trigger",
    triggers: [{ ...HaDeviceTrigger.defaultConfig }],
  },
  {
    name: "Sentence",
    triggers: [
      { ...HaConversationTrigger.defaultConfig },
      {
        trigger: "conversation",
        command: ["Turn on the lights", "Turn the lights on"],
      },
    ],
  },
  {
    name: "Trigger list",
    triggers: [{ ...HaTriggerList.defaultConfig }],
  },
];

@customElement("demo-automation-editor-trigger")
export class DemoAutomationEditorTrigger extends LitElement {
  @state() private menuai!: menuai;

  @state() private _disabled = false;

  private data: any = SCHEMAS.map((info) => info.triggers);

  constructor() {
    super();
    const menuai = providemenuai(this);
    menuai.updateTranslations(null, "en");
    menuai.updateTranslations("config", "en");
    mockEntityRegistry(menuai);
    mockDeviceRegistry(menuai);
    mockAreaRegistry(menuai);
    mockmenuaiioSupervisor(menuai);
    mockConfig(menuai);
    mockTags(menuai);
    mockAuth(menuai);
  }

  protected render(): TemplateResult {
    return html`
      <div class="options">
        <ha-formfield label="Disabled">
          <ha-switch
            .name=${"disabled"}
            .checked=${this._disabled}
            @change=${this._handleOptionChange}
          ></ha-switch>
        </ha-formfield>
      </div>
      ${SCHEMAS.map(
        (info, sampleIdx) => html`
          <demo-black-white-row
            .title=${info.name}
            .value=${this.data[sampleIdx]}
          >
            ${["light", "dark"].map(
              (slot) => html`
                <ha-automation-trigger
                  slot=${slot}
                  .menuai=${this.menuai}
                  .triggers=${this.data[sampleIdx]}
                  .sampleIdx=${sampleIdx}
                  .disabled=${this._disabled}
                  @value-changed=${this._handleValueChange}
                ></ha-automation-trigger>
              `
            )}
          </demo-black-white-row>
        `
      )}
    `;
  }

  private _handleValueChange(ev) {
    const sampleIdx = ev.target.sampleIdx;
    this.data[sampleIdx] = ev.detail.value;
    this.requestUpdate();
  }

  private _handleOptionChange(ev) {
    this[`_${ev.target.name}`] = ev.target.checked;
  }

  static styles = css`
    .options {
      max-width: 800px;
      margin: 16px auto;
    }
    .options ha-formfield {
      margin-right: 16px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "demo-automation-editor-trigger": DemoAutomationEditorTrigger;
  }
}
