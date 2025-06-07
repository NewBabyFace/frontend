import type { PropertyValues } from "lit";
import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators";
import "../../../../components/ha-card";
import type { menuai } from "../../../../types";
import { hasConfigChanged } from "../../common/has-changed";
import "../../components/hui-energy-period-selector";
import type { LovelaceCard, LovelaceGridOptions } from "../../types";
import type { EnergyCardBaseConfig } from "../types";

@customElement("hui-energy-date-selection-card")
export class HuiEnergyDateSelectionCard
  extends LitElement
  implements LovelaceCard
{
  @property({ attribute: false }) public menuai!: menuai;

  @state() private _config?: EnergyCardBaseConfig;

  public getCardSize(): Promise<number> | number {
    return 1;
  }

  public getGridOptions(): LovelaceGridOptions {
    return {
      rows: 1,
      columns: 12,
    };
  }

  public setConfig(config: EnergyCardBaseConfig): void {
    this._config = config;
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    return (
      hasConfigChanged(this, changedProps) ||
      changedProps.size > 1 ||
      !changedProps.has("menuai")
    );
  }

  protected render() {
    if (!this.menuai || !this._config) {
      return nothing;
    }

    return html`
      <ha-card>
        <div class="card-content">
          <hui-energy-period-selector
            .menuai=${this.menuai}
            .collectionKey=${this._config.collection_key}
          ></hui-energy-period-selector>
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    ha-card {
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-energy-date-selection-card": HuiEnergyDateSelectionCard;
  }
}
