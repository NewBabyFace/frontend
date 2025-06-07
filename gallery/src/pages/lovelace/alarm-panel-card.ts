import type { PropertyValues, TemplateResult } from "lit";
import { html, LitElement } from "lit";
import { customElement, query } from "lit/decorators";
import { getEntity } from "../../../../src/fake_data/entity";
import { providemenuai } from "../../../../src/fake_data/provide_menuai";
import "../../components/demo-cards";
import { mockIcons } from "../../../../demo/src/stubs/icons";

const ENTITIES = [
  getEntity("alarm_control_panel", "alarm", "disarmed", {
    friendly_name: "Alarm",
  }),
  getEntity("alarm_control_panel", "alarm_armed", "armed_home", {
    friendly_name: "Alarm",
  }),
  getEntity("alarm_control_panel", "unavailable", "unavailable", {
    friendly_name: "Alarm",
  }),
  getEntity("alarm_control_panel", "alarm_code", "disarmed", {
    friendly_name: "Alarm",
    code_format: "number",
  }),
];

const CONFIGS = [
  {
    heading: "Basic Example",
    config: `
- type: alarm-panel
  entity: alarm_control_panel.alarm
    `,
  },
  {
    heading: "With Title",
    config: `
- type: alarm-panel
  entity: alarm_control_panel.alarm_armed
  name: My Alarm
    `,
  },
  {
    heading: "Code Example",
    config: `
- type: alarm-panel
  entity: alarm_control_panel.alarm_code
    `,
  },
  {
    heading: "Using only Arm_Home State",
    config: `
- type: alarm-panel
  entity: alarm_control_panel.alarm
  states:
    - arm_home
    `,
  },
  {
    heading: "Unavailable",
    config: `
- type: alarm-panel
  entity: alarm_control_panel.unavailable
  states:
    - arm_home
    `,
  },
  {
    heading: "Invalid Entity",
    config: `
- type: alarm-panel
  entity: alarm_control_panel.alarm1
    `,
  },
];

@customElement("demo-lovelace-alarm-panel-card")
class DemoAlarmPanelEntity extends LitElement {
  @query("#demos") private _demoRoot!: HTMLElement;

  protected render(): TemplateResult {
    return html`<demo-cards id="demos" .configs=${CONFIGS}></demo-cards>`;
  }

  protected firstUpdated(changedProperties: PropertyValues) {
    super.firstUpdated(changedProperties);
    const menuai = providemenuai(this._demoRoot);
    menuai.updateTranslations(null, "en");
    menuai.updateTranslations("lovelace", "en");
    menuai.addEntities(ENTITIES);
    mockIcons(menuai);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "demo-lovelace-alarm-panel-card": DemoAlarmPanelEntity;
  }
}
