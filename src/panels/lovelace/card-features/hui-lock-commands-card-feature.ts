import { mdiLock, mdiLockOpenVariant } from "@mdi/js";
import type { CSSResultGroup } from "lit";
import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators";
import { computeDomain } from "../../../common/entity/compute_domain";
import "../../../components/ha-control-button";
import "../../../components/ha-control-button-group";
import { forwardHaptic } from "../../../data/haptics";
import {
  callProtectedLockService,
  canLock,
  canUnlock,
  type LockEntity,
} from "../../../data/lock";
import type { menuai } from "../../../types";
import type { LovelaceCardFeature } from "../types";
import { cardFeatureStyles } from "./common/card-feature-styles";
import type {
  LockCommandsCardFeatureConfig,
  LovelaceCardFeatureContext,
} from "./types";

export const supportsLockCommandsCardFeature = (
  menuai: menuai,
  context: LovelaceCardFeatureContext
) => {
  const stateObj = context.entity_id
    ? menuai.states[context.entity_id]
    : undefined;
  if (!stateObj) return false;
  const domain = computeDomain(stateObj.entity_id);
  return domain === "lock";
};

@customElement("hui-lock-commands-card-feature")
class HuiLockCommandsCardFeature
  extends LitElement
  implements LovelaceCardFeature
{
  @property({ attribute: false }) public menuai?: menuai;

  @property({ attribute: false }) public context?: LovelaceCardFeatureContext;

  @state() private _config?: LockCommandsCardFeatureConfig;

  private get _stateObj() {
    if (!this.menuai || !this.context || !this.context.entity_id) {
      return undefined;
    }
    return this.menuai.states[this.context.entity_id!] as LockEntity | undefined;
  }

  static getStubConfig(): LockCommandsCardFeatureConfig {
    return {
      type: "lock-commands",
    };
  }

  public setConfig(config: LockCommandsCardFeatureConfig): void {
    if (!config) {
      throw new Error("Invalid configuration");
    }
    this._config = config;
  }

  private _onTap(ev): void {
    ev.stopPropagation();
    const service = ev.target.dataset.service;
    if (!this.menuai || !this._stateObj || !service) {
      return;
    }
    forwardHaptic("light");
    callProtectedLockService(this, this.menuai, this._stateObj, service);
  }

  protected render() {
    if (
      !this._config ||
      !this.menuai ||
      !this.context ||
      !this._stateObj ||
      !supportsLockCommandsCardFeature(this.menuai, this.context)
    ) {
      return nothing;
    }

    return html`
      <ha-control-button-group>
        <ha-control-button
          .label=${this.menuai.localize("ui.card.lock.lock")}
          .disabled=${!canLock(this._stateObj)}
          @click=${this._onTap}
          data-service="lock"
        >
          <ha-svg-icon .path=${mdiLock}></ha-svg-icon>
        </ha-control-button>
        <ha-control-button
          .label=${this.menuai.localize("ui.card.lock.unlock")}
          .disabled=${!canUnlock(this._stateObj)}
          @click=${this._onTap}
          data-service="unlock"
        >
          <ha-svg-icon .path=${mdiLockOpenVariant}></ha-svg-icon>
        </ha-control-button>
      </ha-control-button-group>
    `;
  }

  static get styles(): CSSResultGroup {
    return cardFeatureStyles;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-lock-commands-card-feature": HuiLockCommandsCardFeature;
  }
}
