import type { PropertyValues, TemplateResult } from "lit";
import { html, LitElement } from "lit";
import { customElement, query } from "lit/decorators";
import { getEntity } from "../../../../src/fake_data/entity";
import { providemenuai } from "../../../../src/fake_data/provide_menuai";
import "../../components/demo-cards";
import { mockIcons } from "../../../../demo/src/stubs/icons";

const ENTITIES = [
  getEntity("person", "paulus", "home", {
    friendly_name: "Paulus",
    entity_picture: "/images/paulus.jpg",
  }),
];

const CONFIGS = [
  {
    heading: "Image URL",
    config: `
- type: picture
  image: /images/living_room.png
    `,
  },
  {
    heading: "Person entity",
    config: `
- type: picture
  image_entity: person.paulus
    `,
  },
  {
    heading: "Error: Image required",
    config: `
- type: picture
  entity: person.paulus
    `,
  },
];

@customElement("demo-lovelace-picture-card")
class DemoPicture extends LitElement {
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
    "demo-lovelace-picture-card": DemoPicture;
  }
}
