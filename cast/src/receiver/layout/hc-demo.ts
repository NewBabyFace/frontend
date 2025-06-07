import { html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators";
import { mockHistory } from "../../../../demo/src/stubs/history";
import type { LovelaceConfig } from "../../../../src/data/lovelace/config/types";
import type { Mockmenuai } from "../../../../src/fake_data/provide_menuai";
import { providemenuai } from "../../../../src/fake_data/provide_menuai";
import { menuaiElement } from "../../../../src/state/menuai-element";
import type { menuai } from "../../../../src/types";
import { castDemoEntities } from "../demo/cast-demo-entities";
import { castDemoLovelace } from "../demo/cast-demo-lovelace";
import "./hc-lovelace";

@customElement("hc-demo")
class HcDemo extends menuaiElement {
  @property({ attribute: false }) public lovelacePath!: string;

  @state() private _lovelaceConfig?: LovelaceConfig;

  protected render() {
    if (!this._lovelaceConfig) {
      return nothing;
    }
    return html`
      <hc-lovelace
        .menuai=${this.menuai}
        .lovelaceConfig=${this._lovelaceConfig}
        .viewPath=${this.lovelacePath}
      ></hc-lovelace>
    `;
  }

  protected firstUpdated(changedProps) {
    super.firstUpdated(changedProps);
    this._initializemenuai();
  }

  private async _initializemenuai() {
    const initial: Partial<Mockmenuai> = {
      // Override updatemenuai so that the correct menuai lifecycle methods are called
      updatemenuai: (menuaiUpdate: Partial<menuai>) =>
        this._updatemenuai(menuaiUpdate),
    };

    const menuai = (this.menuai = providemenuai(this, initial));

    mockHistory(menuai);

    menuai.addEntities(castDemoEntities());
    this._lovelaceConfig = castDemoLovelace();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hc-demo": HcDemo;
  }
}
