import "@material/mwc-button";
import type { menuaiEntity } from "home-assistant-js-websocket";
import type { CSSResultGroup } from "lit";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators";
import "../components/entity/state-info";
import { activateScene } from "../data/scene";
import type { menuai } from "../types";
import { haStyle } from "../resources/styles";

@customElement("state-card-scene")
class StateCardScene extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: false }) public stateObj!: menuaiEntity;

  @property({ attribute: "in-dialog", type: Boolean }) public inDialog = false;

  protected render() {
    return html`
      <div class="horizontal justified layout">
        <state-info
          .menuai=${this.menuai}
          .stateObj=${this.stateObj}
          .inDialog=${this.inDialog}
        ></state-info>
        <mwc-button @click=${this._activateScene}
          >${this.menuai.localize("ui.card.scene.activate")}</mwc-button
        >
      </div>
    `;
  }

  private _activateScene(ev) {
    ev.stopPropagation();
    activateScene(this.menuai, this.stateObj.entity_id);
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      css`
        mwc-button {
          top: 3px;
          height: 37px;
          margin-right: -0.57em;
          margin-inline-end: -0.57em;
          margin-inline-start: initial;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "state-card-scene": StateCardScene;
  }
}
