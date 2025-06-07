import type { PropertyValues, TemplateResult } from "lit";
import { html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators";
import "../../../../src/components/ha-card";
import "../../../../src/dialogs/more-info/more-info-content";
import type { Mockmenuai } from "../../../../src/fake_data/provide_menuai";
import { providemenuai } from "../../../../src/fake_data/provide_menuai";
import "../../components/demo-more-infos";
import { createMediaPlayerEntities } from "../../data/media_players";

const ENTITIES = createMediaPlayerEntities();

@customElement("demo-more-info-media-player")
class DemoMoreInfoMediaPlayer extends LitElement {
  @property({ attribute: false }) public menuai!: Mockmenuai;

  @query("demo-more-infos") private _demoRoot!: HTMLElement;

  protected render(): TemplateResult {
    return html`
      <demo-more-infos
        .menuai=${this.menuai}
        .entities=${ENTITIES.map((ent) => ent.entityId)}
      ></demo-more-infos>
    `;
  }

  protected firstUpdated(changedProperties: PropertyValues) {
    super.firstUpdated(changedProperties);
    const menuai = providemenuai(this._demoRoot);
    menuai.updateTranslations(null, "en");
    menuai.addEntities(ENTITIES);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "demo-more-info-media-player": DemoMoreInfoMediaPlayer;
  }
}
