import "@material/mwc-button/mwc-button";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators";
import "../../../components/ha-card";
import type { menuai } from "../../../types";
import type { LovelaceCard } from "../types";
import type { EmptyStateCardConfig } from "./types";

@customElement("hui-empty-state-card")
export class HuiEmptyStateCard extends LitElement implements LovelaceCard {
  @property({ attribute: false }) public menuai?: menuai;

  public getCardSize(): number {
    return 2;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public setConfig(_config: EmptyStateCardConfig): void {}

  protected render() {
    if (!this.menuai) {
      return nothing;
    }

    return html`
      <ha-card
        .header=${this.menuai.localize(
          "ui.panel.lovelace.cards.empty_state.title"
        )}
      >
        <div class="card-content">
          ${this.menuai.localize(
            "ui.panel.lovelace.cards.empty_state.no_devices"
          )}
        </div>
        <div class="card-actions">
          <a href="/config/integrations/dashboard">
            <mwc-button>
              ${this.menuai.localize(
                "ui.panel.lovelace.cards.empty_state.go_to_integrations_page"
              )}
            </mwc-button>
          </a>
        </div>
      </ha-card>
    `;
  }

  static styles = css`
    .content {
      margin-top: -1em;
      padding: 16px;
    }

    .card-actions a {
      text-decoration: none;
    }

    mwc-button {
      margin-left: -8px;
      margin-inline-start: -8px;
      margin-inline-end: initial;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-empty-state-card": HuiEmptyStateCard;
  }
}
