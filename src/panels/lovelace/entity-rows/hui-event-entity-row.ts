import type { PropertyValues } from "lit";
import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators";
import { isUnavailableState } from "../../../data/entity";
import type { ActionHandlerEvent } from "../../../data/lovelace/action_handler";
import type { menuai } from "../../../types";
import type { EntitiesCardEntityConfig } from "../cards/types";
import { actionHandler } from "../common/directives/action-handler-directive";
import { handleAction } from "../common/handle-action";
import { hasAction } from "../common/has-action";
import { hasConfigOrEntityChanged } from "../common/has-changed";
import "../components/hui-generic-entity-row";
import "../components/hui-timestamp-display";
import { createEntityNotFoundWarning } from "../components/hui-warning";
import type { TimestampRenderingFormat } from "../components/types";
import type { LovelaceRow } from "./types";

interface EventEntityConfig extends EntitiesCardEntityConfig {
  format?: TimestampRenderingFormat;
}

@customElement("hui-event-entity-row")
class HuiEventEntityRow extends LitElement implements LovelaceRow {
  @property({ attribute: false }) public menuai?: menuai;

  @state() private _config?: EventEntityConfig;

  public setConfig(config: EventEntityConfig): void {
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
        <div
          @action=${this._handleAction}
          .actionHandler=${actionHandler({
            hasHold: hasAction(this._config.hold_action),
            hasDoubleClick: hasAction(this._config.double_tap_action),
          })}
        >
          <div class="when">
            ${isUnavailableState(stateObj.state)
              ? this.menuai.formatEntityState(stateObj)
              : html`<hui-timestamp-display
                  .menuai=${this.menuai}
                  .ts=${new Date(stateObj.state)}
                  .format=${this._config.format}
                  capitalize
                ></hui-timestamp-display>`}
          </div>
          <div class="what">
            ${isUnavailableState(stateObj.state)
              ? nothing
              : this.menuai.formatEntityAttributeValue(stateObj, "event_type")}
          </div>
        </div>
      </hui-generic-entity-row>
    `;
  }

  private _handleAction(ev: ActionHandlerEvent) {
    handleAction(this, this.menuai!, this._config!, ev.detail.action);
  }

  static styles = css`
    div {
      text-align: right;
    }
    .when {
      color: var(--primary-text-color);
    }
    .what {
      color: var(--secondary-text-color);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-event-entity-row": HuiEventEntityRow;
  }
}
