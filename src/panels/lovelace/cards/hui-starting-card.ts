import "@material/mwc-button/mwc-button";
import { STATE_NOT_RUNNING } from "home-assistant-js-websocket";
import type { PropertyValues } from "lit";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators";
import { fireEvent } from "../../../common/dom/fire_event";
import "../../../components/ha-card";
import "../../../components/ha-spinner";
import type { LovelaceCardConfig } from "../../../data/lovelace/config/card";
import type { menuai } from "../../../types";
import type { LovelaceCard } from "../types";

@customElement("hui-starting-card")
export class HuiStartingCard extends LitElement implements LovelaceCard {
  @property({ attribute: false }) public menuai?: menuai;

  public getCardSize(): number {
    return 2;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public setConfig(_config: LovelaceCardConfig): void {}

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);
    if (!changedProperties.has("menuai") || !this.menuai!.config) {
      return;
    }

    if (this.menuai!.config.state !== STATE_NOT_RUNNING) {
      fireEvent(this, "config-refresh");
    }
  }

  protected render() {
    if (!this.menuai) {
      return nothing;
    }

    return html`
      <div class="content">
        <ha-spinner></ha-spinner>
        ${this.menuai.localize("ui.panel.lovelace.cards.starting.description")}
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
      height: calc(100vh - var(--header-height));
    }
    ha-spinner {
      margin-bottom: 20px;
    }
    .content {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-starting-card": HuiStartingCard;
  }
}
