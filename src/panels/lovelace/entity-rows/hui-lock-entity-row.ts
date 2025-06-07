import "@material/mwc-button/mwc-button";
import type { PropertyValues } from "lit";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators";
import { isUnavailableState } from "../../../data/entity";
import type { menuai } from "../../../types";
import { hasConfigOrEntityChanged } from "../common/has-changed";
import "../components/hui-generic-entity-row";
import { createEntityNotFoundWarning } from "../components/hui-warning";
import type { ConfirmableRowConfig, LovelaceRow } from "./types";
import { callProtectedLockService } from "../../../data/lock";
import { confirmAction } from "../common/confirm-action";

@customElement("hui-lock-entity-row")
class HuiLockEntityRow extends LitElement implements LovelaceRow {
  @property({ attribute: false }) public menuai?: menuai;

  @state() private _config?: ConfirmableRowConfig;

  public setConfig(config: ConfirmableRowConfig): void {
    if (!config) {
      throw new Error("Invalid configuration");
    }
    this._config = config;
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    return hasConfigOrEntityChanged(this, changedProps);
  }

  protected render() {
    if (!this._config || !this.menuai) {
      return nothing;
    }

    const stateObj = this.menuai.states[this._config.entity];

    if (!stateObj) {
      return html`
        <hui-warning .menuai=${this.menuai}>
          ${createEntityNotFoundWarning(this.menuai, this._config.entity)}
        </hui-warning>
      `;
    }

    return html`
      <hui-generic-entity-row .menuai=${this.menuai} .config=${this._config}>
        <mwc-button
          @click=${this._callService}
          .disabled=${isUnavailableState(stateObj.state)}
          class="text-content"
        >
          ${stateObj.state === "locked"
            ? this.menuai!.localize("ui.card.lock.unlock")
            : this.menuai!.localize("ui.card.lock.lock")}
        </mwc-button>
      </hui-generic-entity-row>
    `;
  }

  static styles = css`
    mwc-button {
      margin-right: -0.57em;
      margin-inline-end: -0.57em;
      margin-inline-start: initial;
    }
  `;

  private async _callService(ev): Promise<void> {
    ev.stopPropagation();
    const stateObj = this.menuai!.states[this._config!.entity];
    const action = stateObj.state === "locked" ? "unlock" : "lock";
    if (
      !this._config?.confirmation ||
      (await confirmAction(
        this,
        this.menuai!,
        this._config.confirmation,
        this.menuai!.localize(`ui.card.lock.${action}`)
      ))
    ) {
      callProtectedLockService(this, this.menuai!, stateObj, action);
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-lock-entity-row": HuiLockEntityRow;
  }
}
