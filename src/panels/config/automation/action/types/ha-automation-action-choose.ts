import { type CSSResultGroup, LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators";
import { ensureArray } from "../../../../../common/array/ensure-array";
import { fireEvent } from "../../../../../common/dom/fire_event";
import "../../../../../components/ha-button";
import type { Action, ChooseAction, Option } from "../../../../../data/script";
import { haStyle } from "../../../../../resources/styles";
import type { menuai } from "../../../../../types";
import "../../option/ha-automation-option";
import type { ActionElement } from "../ha-automation-action-row";
import "../ha-automation-action";

@customElement("ha-automation-action-choose")
export class HaChooseAction extends LitElement implements ActionElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ type: Boolean }) public disabled = false;

  @property({ attribute: false }) public action!: ChooseAction;

  @property({ type: Boolean }) public narrow = false;

  @state() private _showDefault = false;

  public static get defaultConfig(): ChooseAction {
    return { choose: [{ conditions: [], sequence: [] }] };
  }

  protected render() {
    const action = this.action;

    const options = action.choose ? ensureArray(action.choose) : [];

    return html`
      <ha-automation-option
        .options=${options}
        .disabled=${this.disabled}
        @value-changed=${this._optionsChanged}
        .menuai=${this.menuai}
        .narrow=${this.narrow}
      ></ha-automation-option>

      ${this._showDefault || action.default
        ? html`
            <h2>
              ${this.menuai.localize(
                "ui.panel.config.automation.editor.actions.type.choose.default"
              )}:
            </h2>
            <ha-automation-action
              .actions=${ensureArray(action.default) || []}
              .disabled=${this.disabled}
              @value-changed=${this._defaultChanged}
              .menuai=${this.menuai}
              .narrow=${this.narrow}
            ></ha-automation-action>
          `
        : html`
            <div class="link-button-row">
              <button
                class="link"
                @click=${this._addDefault}
                .disabled=${this.disabled}
              >
                ${this.menuai.localize(
                  "ui.panel.config.automation.editor.actions.type.choose.add_default"
                )}
              </button>
            </div>
          `}
    `;
  }

  private _addDefault() {
    this._showDefault = true;
  }

  private _optionsChanged(ev: CustomEvent) {
    ev.stopPropagation();
    const value = ev.detail.value as Option[];
    fireEvent(this, "value-changed", {
      value: {
        ...this.action,
        choose: value,
      },
    });
  }

  private _defaultChanged(ev: CustomEvent) {
    ev.stopPropagation();
    this._showDefault = true;
    const defaultAction = ev.detail.value as Action[];
    const newValue: ChooseAction = {
      ...this.action,
      default: defaultAction,
    };
    if (defaultAction.length === 0) {
      delete newValue.default;
    }
    fireEvent(this, "value-changed", { value: newValue });
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      css`
        .link-button-row {
          padding: 14px 14px 0 14px;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-automation-action-choose": HaChooseAction;
  }
}
