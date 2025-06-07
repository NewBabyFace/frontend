import "@material/mwc-button";
import type { menuaiEntity } from "home-assistant-js-websocket";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators";
import { isUnavailableState } from "../../../data/entity";
import type { menuai } from "../../../types";

@customElement("more-info-counter")
class MoreInfoCounter extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: false }) public stateObj?: menuaiEntity;

  protected render() {
    if (!this.menuai || !this.stateObj) {
      return nothing;
    }

    const disabled = isUnavailableState(this.stateObj.state);

    return html`
      <div class="actions">
        <mwc-button
          .action=${"increment"}
          @click=${this._handleActionClick}
          .disabled=${disabled ||
          Number(this.stateObj.state) === this.stateObj.attributes.maximum}
        >
          ${this.menuai!.localize("ui.card.counter.actions.increment")}
        </mwc-button>
        <mwc-button
          .action=${"decrement"}
          @click=${this._handleActionClick}
          .disabled=${disabled ||
          Number(this.stateObj.state) === this.stateObj.attributes.minimum}
        >
          ${this.menuai!.localize("ui.card.counter.actions.decrement")}
        </mwc-button>
        <mwc-button
          .action=${"reset"}
          @click=${this._handleActionClick}
          .disabled=${disabled}
        >
          ${this.menuai!.localize("ui.card.counter.actions.reset")}
        </mwc-button>
      </div>
    `;
  }

  private _handleActionClick(e: MouseEvent): void {
    const action = (e.currentTarget as any).action;
    this.menuai.callService("counter", action, {
      entity_id: this.stateObj!.entity_id,
    });
  }

  static styles = css`
    .actions {
      margin: 8px 0;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "more-info-counter": MoreInfoCounter;
  }
}
