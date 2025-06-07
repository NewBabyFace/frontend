import type { PropertyValues } from "lit";
import { html, LitElement, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators";
import memoizeOne from "memoize-one";
import { stopPropagation } from "../../../common/dom/stop_propagation";
import { computeDomain } from "../../../common/entity/compute_domain";
import "../../../components/ha-control-select-menu";
import type { HaControlSelectMenu } from "../../../components/ha-control-select-menu";
import "../../../components/ha-list-item";
import { UNAVAILABLE } from "../../../data/entity";
import type { InputSelectEntity } from "../../../data/input_select";
import type { SelectEntity } from "../../../data/select";
import type { menuai } from "../../../types";
import type { LovelaceCardFeature, LovelaceCardFeatureEditor } from "../types";
import { cardFeatureStyles } from "./common/card-feature-styles";
import { filterModes } from "./common/filter-modes";
import type {
  LovelaceCardFeatureContext,
  SelectOptionsCardFeatureConfig,
} from "./types";

export const supportsSelectOptionsCardFeature = (
  menuai: menuai,
  context: LovelaceCardFeatureContext
) => {
  const stateObj = context.entity_id
    ? menuai.states[context.entity_id]
    : undefined;
  if (!stateObj) return false;
  const domain = computeDomain(stateObj.entity_id);
  return domain === "select" || domain === "input_select";
};

@customElement("hui-select-options-card-feature")
class HuiSelectOptionsCardFeature
  extends LitElement
  implements LovelaceCardFeature
{
  @property({ attribute: false }) public menuai?: menuai;

  @property({ attribute: false }) public context?: LovelaceCardFeatureContext;

  @state() private _config?: SelectOptionsCardFeatureConfig;

  @state() _currentOption?: string;

  @query("ha-control-select-menu", true)
  private _haSelect!: HaControlSelectMenu;

  private get _stateObj() {
    if (!this.menuai || !this.context || !this.context.entity_id) {
      return undefined;
    }
    return this.menuai.states[this.context.entity_id!] as
      | SelectEntity
      | InputSelectEntity
      | undefined;
  }

  static getStubConfig(): SelectOptionsCardFeatureConfig {
    return {
      type: "select-options",
    };
  }

  public static async getConfigElement(): Promise<LovelaceCardFeatureEditor> {
    await import(
      "../editor/config-elements/hui-select-options-card-feature-editor"
    );
    return document.createElement("hui-select-options-card-feature-editor");
  }

  public setConfig(config: SelectOptionsCardFeatureConfig): void {
    if (!config) {
      throw new Error("Invalid configuration");
    }
    this._config = config;
  }

  protected willUpdate(changedProp: PropertyValues): void {
    super.willUpdate(changedProp);
    if (
      (changedProp.has("menuai") || changedProp.has("context")) &&
      this._stateObj
    ) {
      const oldmenuai = changedProp.get("menuai") as menuai | undefined;
      const oldStateObj = oldmenuai?.states[this.context!.entity_id!];
      if (oldStateObj !== this._stateObj) {
        this._currentOption = this._stateObj.state;
      }
    }
  }

  protected updated(changedProps: PropertyValues) {
    super.updated(changedProps);
    if (changedProps.has("menuai")) {
      const oldmenuai = changedProps.get("menuai") as menuai | undefined;
      if (
        this.menuai &&
        this.menuai.formatEntityAttributeValue !==
          oldmenuai?.formatEntityAttributeValue
      ) {
        this._haSelect.layoutOptions();
      }
    }
  }

  private async _valueChanged(ev: CustomEvent) {
    const option = (ev.target as any).value as string;

    const oldOption = this._stateObj!.state;

    if (
      option === oldOption ||
      !this._stateObj!.attributes.options.includes(option)
    )
      return;

    this._currentOption = option;

    try {
      await this._setOption(option);
    } catch (_err) {
      this._currentOption = oldOption;
    }
  }

  private async _setOption(option: string) {
    const domain = computeDomain(this._stateObj!.entity_id);
    await this.menuai!.callService(domain, "select_option", {
      entity_id: this._stateObj!.entity_id,
      option: option,
    });
  }

  protected render() {
    if (
      !this._config ||
      !this.menuai ||
      !this.context ||
      !this._stateObj ||
      !supportsSelectOptionsCardFeature(this.menuai, this.context)
    ) {
      return nothing;
    }

    const stateObj = this._stateObj;

    const options = this._getOptions(
      this._stateObj.attributes.options,
      this._config.options
    );

    return html`
      <ha-control-select-menu
        show-arrow
        hide-label
        .label=${this.menuai.localize("ui.card.select.option")}
        .value=${stateObj.state}
        .options=${options}
        .disabled=${this._stateObj.state === UNAVAILABLE}
        fixedMenuPosition
        naturalMenuWidth
        @selected=${this._valueChanged}
        @closed=${stopPropagation}
      >
        ${options.map(
          (option) => html`
            <ha-list-item .value=${option}>
              ${this.menuai!.formatEntityState(stateObj, option)}
            </ha-list-item>
          `
        )}
      </ha-control-select-menu>
    `;
  }

  private _getOptions = memoizeOne(
    (attributeOptions: string[], configOptions: string[] | undefined) =>
      filterModes(attributeOptions, configOptions)
  );

  static get styles() {
    return cardFeatureStyles;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-select-options-card-feature": HuiSelectOptionsCardFeature;
  }
}
