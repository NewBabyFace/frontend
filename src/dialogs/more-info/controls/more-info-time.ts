import type { menuaiEntity } from "home-assistant-js-websocket";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators";
import "../../../components/ha-date-input";
import "../../../components/ha-time-input";
import { isUnavailableState, UNAVAILABLE } from "../../../data/entity";
import { setTimeValue } from "../../../data/time";
import type { menuai } from "../../../types";

@customElement("more-info-time")
class MoreInfoTime extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: false }) public stateObj?: menuaiEntity;

  protected render() {
    if (!this.stateObj || this.stateObj.state === UNAVAILABLE) {
      return nothing;
    }

    return html`
      <ha-time-input
        .value=${isUnavailableState(this.stateObj.state)
          ? undefined
          : this.stateObj.state}
        .locale=${this.menuai.locale}
        .disabled=${this.stateObj.state === UNAVAILABLE}
        @value-changed=${this._timeChanged}
        @click=${this._stopEventPropagation}
      ></ha-time-input>
    `;
  }

  private _stopEventPropagation(ev: Event): void {
    ev.stopPropagation();
  }

  private _timeChanged(ev: CustomEvent<{ value: string }>): void {
    if (ev.detail.value) {
      setTimeValue(this.menuai!, this.stateObj!.entity_id, ev.detail.value);
    }
  }

  static styles = css`
    :host {
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "more-info-time": MoreInfoTime;
  }
}
