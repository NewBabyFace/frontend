import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators";
import "../../../../../components/ha-textarea";
import type { TemplateCondition } from "../../../../../data/automation";
import type { menuai } from "../../../../../types";
import { handleChangeEvent } from "../ha-automation-condition-row";

@customElement("ha-automation-condition-template")
export class HaTemplateCondition extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: false }) public condition!: TemplateCondition;

  @property({ type: Boolean }) public disabled = false;

  public static get defaultConfig(): TemplateCondition {
    return { condition: "template", value_template: "" };
  }

  protected render() {
    const { value_template } = this.condition;
    return html`
      <p>
        ${this.menuai.localize(
          "ui.panel.config.automation.editor.conditions.type.template.value_template"
        )}
        *
      </p>
      <ha-code-editor
        .name=${"value_template"}
        mode="jinja2"
        .menuai=${this.menuai}
        .value=${value_template}
        .readOnly=${this.disabled}
        autocomplete-entities
        @value-changed=${this._valueChanged}
        dir="ltr"
      ></ha-code-editor>
    `;
  }

  private _valueChanged(ev: CustomEvent): void {
    handleChangeEvent(this, ev);
  }

  static styles = css`
    p {
      margin-top: 0;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-automation-condition-template": HaTemplateCondition;
  }
}
