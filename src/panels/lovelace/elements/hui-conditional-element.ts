import type { menuai } from "../../../types";
import { createStyledHuiElement } from "../cards/picture-elements/create-styled-hui-element";
import {
  checkConditionsMet,
  validateConditionalConfig,
} from "../common/validate-condition";
import type { LovelacePictureElementEditor } from "../types";
import type {
  ConditionalElementConfig,
  LovelaceElement,
  LovelaceElementConfig,
} from "./types";

class HuiConditionalElement extends HTMLElement implements LovelaceElement {
  public static async getConfigElement(): Promise<LovelacePictureElementEditor> {
    await import(
      "../editor/config-elements/elements/hui-conditional-element-editor"
    );
    return document.createElement("hui-conditional-element-editor");
  }

  public _menuai?: menuai;

  private _config?: ConditionalElementConfig;

  private _elements: LovelaceElement[] = [];

  public setConfig(config: ConditionalElementConfig): void {
    if (
      !config.conditions ||
      !Array.isArray(config.conditions) ||
      !config.elements ||
      !Array.isArray(config.elements) ||
      !validateConditionalConfig(config.conditions)
    ) {
      throw new Error("Invalid configuration");
    }

    if (this._elements.length > 0) {
      this._elements.forEach((el: LovelaceElement) => {
        if (el.parentElement) {
          el.parentElement.removeChild(el);
        }
      });

      this._elements = [];
    }

    this._config = config;

    this._config.elements.forEach((elementConfig: LovelaceElementConfig) => {
      this._elements.push(createStyledHuiElement(elementConfig));
    });

    this._updateElements();
  }

  set menuai(menuai: menuai) {
    this._menuai = menuai;

    this._updateElements();
  }

  private _updateElements() {
    if (!this._menuai || !this._config) {
      return;
    }

    const visible = checkConditionsMet(this._config.conditions, this._menuai);

    this._elements.forEach((el: LovelaceElement) => {
      if (visible) {
        el.menuai = this._menuai;
        if (!el.parentElement) {
          this.appendChild(el);
        }
      } else if (el.parentElement) {
        el.parentElement.removeChild(el);
      }
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-conditional-element": HuiConditionalElement;
  }
}

customElements.define("hui-conditional-element", HuiConditionalElement);
