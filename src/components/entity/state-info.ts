import type { menuaiEntity } from "home-assistant-js-websocket";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators";
import { computeStateName } from "../../common/entity/compute_state_name";
import type { menuai } from "../../types";
import "../ha-relative-time";
import "./state-badge";
import "../ha-tooltip";

@customElement("state-info")
class StateInfo extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: false }) public stateObj?: menuaiEntity;

  @property({ attribute: "in-dialog", type: Boolean }) public inDialog = false;

  @property() public color?: string;

  protected render() {
    if (!this.menuai || !this.stateObj) {
      return nothing;
    }

    const name = computeStateName(this.stateObj);

    return html`<state-badge
        .menuai=${this.menuai}
        .stateObj=${this.stateObj}
        .stateColor=${true}
        .color=${this.color}
      ></state-badge>
      <div class="info">
        <div class="name ${this.inDialog ? "in-dialog" : ""}" .title=${name}>
          ${name}
        </div>
        ${this.inDialog
          ? html`<div class="time-ago">
              <ha-tooltip>
                <ha-relative-time
                  .menuai=${this.menuai}
                  .datetime=${this.stateObj.last_changed}
                  capitalize
                ></ha-relative-time>
                <div slot="content">
                  <div class="row">
                    <span class="column-name">
                      ${this.menuai.localize(
                        "ui.dialogs.more_info_control.last_changed"
                      )}:
                    </span>
                    <ha-relative-time
                      .menuai=${this.menuai}
                      .datetime=${this.stateObj.last_changed}
                      capitalize
                    ></ha-relative-time>
                  </div>
                  <div class="row">
                    <span>
                      ${this.menuai.localize(
                        "ui.dialogs.more_info_control.last_updated"
                      )}:
                    </span>
                    <ha-relative-time
                      .menuai=${this.menuai}
                      .datetime=${this.stateObj.last_updated}
                      capitalize
                    ></ha-relative-time>
                  </div>
                </div>
              </ha-tooltip>
            </div>`
          : html`<div class="extra-info"><slot></slot></div>`}
      </div>`;
  }

  static styles = css`
    :host {
      min-width: 120px;
      white-space: nowrap;
      display: flex;
      align-items: center;
    }

    state-badge {
      flex: none;
    }

    .info {
      margin-left: 8px;
      margin-inline-start: 8px;
      margin-inline-end: initial;
      display: flex;
      flex-direction: column;
      justify-content: center;
      height: 100%;
      min-width: 0;
      text-align: var(--float-start);
      position: relative;
    }

    .name {
      color: var(--primary-text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .name.in-dialog,
    :host([secondary-line]) .name {
      line-height: var(--ha-line-height-condensed);
    }

    .time-ago,
    .extra-info,
    .extra-info > * {
      color: var(--secondary-text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .row {
      display: flex;
      flex-direction: row;
      flex-wrap: no-wrap;
      width: 100%;
      justify-content: space-between;
      margin: 0 2px 4px 0;
    }

    .row:last-child {
      margin-bottom: 0px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "state-info": StateInfo;
  }
}
