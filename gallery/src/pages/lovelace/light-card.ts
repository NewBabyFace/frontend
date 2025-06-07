import type { PropertyValues, TemplateResult } from "lit";
import { html, LitElement } from "lit";
import { customElement, query } from "lit/decorators";
import { getEntity } from "../../../../src/fake_data/entity";
import { providemenuai } from "../../../../src/fake_data/provide_menuai";
import "../../components/demo-cards";
import { mockIcons } from "../../../../demo/src/stubs/icons";

const ENTITIES = [
  getEntity("light", "bed_light", "on", {
    friendly_name: "Bed Light",
    brightness: 255,
  }),
  getEntity("light", "dim_on", "on", {
    friendly_name: "Dining Room",
    supported_features: 1,
    brightness: 100,
  }),
  getEntity("light", "dim_off", "off", {
    friendly_name: "Dining Room",
    supported_features: 1,
  }),
  getEntity("light", "unavailable", "unavailable", {
    friendly_name: "Lost Light",
    supported_features: 1,
  }),
];

const CONFIGS = [
  {
    heading: "Switchable Light",
    config: `
- type: light
  entity: light.bed_light
    `,
  },
  {
    heading: "Dimmable Light On",
    config: `
- type: light
  entity: light.dim_on
    `,
  },
  {
    heading: "Dimmable Light Off",
    config: `
- type: light
  entity: light.dim_off
    `,
  },
  {
    heading: "Unavailable",
    config: `
- type: light
  entity: light.unavailable
    `,
  },
  {
    heading: "Non existing",
    config: `
- type: light
  entity: light.nonexisting
    `,
  },
];

@customElement("demo-lovelace-light-card")
class DemoLightEntity extends LitElement {
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
    "demo-lovelace-light-card": DemoLightEntity;
  }
}
