import type { menuaiEntity } from "home-assistant-js-websocket";
import type { PropertyValues } from "lit";
import { LitElement, html, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators";
import { computeAttributeNameDisplay } from "../../common/entity/compute_attribute_display";
import type { menuai, ValueChangedEvent } from "../../types";
import "../ha-combo-box";
import type { HaComboBox } from "../ha-combo-box";

export type HaEntityPickerEntityFilterFunc = (entityId: menuaiEntity) => boolean;

@customElement("ha-entity-attribute-picker")
class HaEntityAttributePicker extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: false }) public entityId?: string;

  /**
   * List of attributes to be hidden.
   * @type {Array}
   * @attr hide-attributes
   */
  @property({ type: Array, attribute: "hide-attributes" })
  public hideAttributes?: string[];

  // eslint-disable-next-line lit/no-native-attributes
  @property({ type: Boolean }) public autofocus = false;

  @property({ type: Boolean }) public disabled = false;

  @property({ type: Boolean }) public required = false;

  @property({ type: Boolean, attribute: "allow-custom-value" })
  public allowCustomValue;

  @property() public label?: string;

  @property() public value?: string;

  @property() public helper?: string;

  @state() private _opened = false;

  @query("ha-combo-box", true) private _comboBox!: HaComboBox;

  protected shouldUpdate(changedProps: PropertyValues) {
    return !(!changedProps.has("_opened") && this._opened);
  }

  protected updated(changedProps: PropertyValues) {
    if (changedProps.has("_opened") && this._opened) {
      const entityState = this.entityId
        ? this.menuai.states[this.entityId]
        : undefined;
      (this._comboBox as any).items = entityState
        ? Object.keys(entityState.attributes)
            .filter((key) => !this.hideAttributes?.includes(key))
            .map((key) => ({
              value: key,
              label: computeAttributeNameDisplay(
                this.menuai.localize,
                entityState,
                this.menuai.entities,
                key
              ),
            }))
        : [];
    }
  }

  protected render() {
    if (!this.menuai) {
      return nothing;
    }

    const stateObj = this.menuai.states[this.entityId!] as menuaiEntity | undefined;

    return html`
      <ha-combo-box
        .menuai=${this.menuai}
        .value=${this.value
          ? stateObj
            ? computeAttributeNameDisplay(
                this.menuai.localize,
                stateObj,
                this.menuai.entities,
                this.value
              )
            : this.value
          : ""}
        .autofocus=${this.autofocus}
        .label=${this.label ??
        this.menuai.localize(
          "ui.components.entity.entity-attribute-picker.attribute"
        )}
        .disabled=${this.disabled || !this.entityId}
        .required=${this.required}
        .helper=${this.helper}
        .allowCustomValue=${this.allowCustomValue}
        item-value-path="value"
        item-label-path="label"
        @opened-changed=${this._openedChanged}
        @value-changed=${this._valueChanged}
      >
      </ha-combo-box>
    `;
  }

  private _openedChanged(ev: ValueChangedEvent<boolean>) {
    this._opened = ev.detail.value;
  }

  private _valueChanged(ev: ValueChangedEvent<string>) {
    this.value = ev.detail.value;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-entity-attribute-picker": HaEntityAttributePicker;
  }
}
