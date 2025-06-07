import "@material/mwc-button";
import type { TemplateResult } from "lit";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators";
import "../../../components/ha-card";
import type { menuai } from "../../../types";
import "../../config/logs/error-log-card";
import type { LovelaceCard } from "../types";

@customElement("hui-recovery-mode-card")
export class HuiRecoveryModeCard extends LitElement implements LovelaceCard {
  @property({ attribute: false }) public menuai?: menuai;

  public getCardSize(): number {
    return 3;
  }

  public setConfig(_config: any): void {
    // No config necessary.
  }

  protected render(): TemplateResult {
    return html`
      <ha-card
        .header=${this.menuai!.localize(
          "ui.panel.lovelace.cards.recovery-mode.header"
        )}
      >
        <div class="card-content">
          ${this.menuai!.localize(
            "ui.panel.lovelace.cards.recovery-mode.description"
          )}
        </div>
        <error-log-card .menuai=${this.menuai} provider="core"></error-log-card>
      </ha-card>
    `;
  }

  static styles = css`
    ha-card {
      --ha-card-header-color: var(--primary-color);
    }
    error-log-card {
      display: block;
      padding-bottom: 16px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-recovery-mode-card": HuiRecoveryModeCard;
  }
}
