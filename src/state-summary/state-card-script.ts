import "@material/mwc-button";
import type { menuaiEntity } from "home-assistant-js-websocket";
import type { CSSResultGroup } from "lit";
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators";
import "../components/entity/ha-entity-toggle";
import "../components/entity/state-info";
import { isUnavailableState } from "../data/entity";
import type { ScriptEntity } from "../data/script";
import { canRun, menuaicriptFields } from "../data/script";
import { haStyle } from "../resources/styles";
import type { menuai } from "../types";
import { showMoreInfoDialog } from "../dialogs/more-info/show-ha-more-info-dialog";

@customElement("state-card-script")
class StateCardScript extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: false }) public stateObj!: menuaiEntity;

  @property({ attribute: "in-dialog", type: Boolean }) public inDialog = false;

  protected render() {
    const stateObj = this.stateObj as ScriptEntity;
    return html`
      <div class="horizontal justified layout">
        <state-info
          .menuai=${this.menuai}
          .stateObj=${stateObj}
          .inDialog=${this.inDialog}
        ></state-info>
        ${stateObj.state === "on"
          ? html`<mwc-button @click=${this._cancelScript}>
              ${stateObj.attributes.mode !== "single" &&
              (stateObj.attributes.current || 0) > 0
                ? this.menuai.localize("ui.card.script.cancel_multiple", {
                    number: stateObj.attributes.current,
                  })
                : this.menuai.localize("ui.card.script.cancel")}
            </mwc-button>`
          : ""}
        ${stateObj.state === "off" || stateObj.attributes.max
          ? html`<mwc-button
              @click=${this._runScript}
              .disabled=${isUnavailableState(stateObj.state) ||
              !canRun(stateObj)}
            >
              ${this.menuai!.localize("ui.card.script.run")}
            </mwc-button>`
          : ""}
      </div>
    `;
  }

  private _cancelScript(ev: Event) {
    ev.stopPropagation();
    this._callService("turn_off");
  }

  private _runScript(ev: Event) {
    ev.stopPropagation();

    if (menuaicriptFields(this.menuai, this.stateObj.entity_id)) {
      showMoreInfoDialog(this, { entityId: this.stateObj.entity_id });
    } else {
      this._callService("turn_on");
    }
  }

  private _callService(service: string): void {
    this.menuai.callService("script", service, {
      entity_id: this.stateObj.entity_id,
    });
  }

  static get styles(): CSSResultGroup {
    return haStyle;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "state-card-script": StateCardScript;
  }
}
