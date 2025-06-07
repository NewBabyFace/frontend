import { mdiHomeImportOutline, mdiPause, mdiPlay } from "@mdi/js";
import { LitElement, css, html, nothing } from "lit";
import { customElement, property } from "lit/decorators";
import memoizeOne from "memoize-one";
import { computeStateDomain } from "../../../common/entity/compute_state_domain";
import { supportsFeature } from "../../../common/entity/supports-feature";
import { blankBeforePercent } from "../../../common/translations/blank_before_percent";
import "../../../components/entity/ha-battery-icon";
import "../../../components/ha-icon-button";
import { UNAVAILABLE } from "../../../data/entity";
import type { EntityRegistryDisplayEntry } from "../../../data/entity_registry";
import {
  findBatteryChargingEntity,
  findBatteryEntity,
} from "../../../data/entity_registry";
import type { LawnMowerEntity } from "../../../data/lawn_mower";
import { LawnMowerEntityFeature } from "../../../data/lawn_mower";
import type { menuai } from "../../../types";

interface LawnMowerCommand {
  translationKey: string;
  icon: string;
  serviceName: string;
  isVisible: (stateObj: LawnMowerEntity) => boolean;
}

const LAWN_MOWER_COMMANDS: LawnMowerCommand[] = [
  {
    translationKey: "start_mowing",
    icon: mdiPlay,
    serviceName: "start_mowing",
    isVisible: (stateObj) =>
      supportsFeature(stateObj, LawnMowerEntityFeature.START_MOWING),
  },
  {
    translationKey: "pause",
    icon: mdiPause,
    serviceName: "pause",
    isVisible: (stateObj) =>
      supportsFeature(stateObj, LawnMowerEntityFeature.PAUSE),
  },
  {
    translationKey: "dock",
    icon: mdiHomeImportOutline,
    serviceName: "dock",
    isVisible: (stateObj) =>
      supportsFeature(stateObj, LawnMowerEntityFeature.DOCK),
  },
];

@customElement("more-info-lawn_mower")
class MoreInfoLawnMower extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: false }) public stateObj?: LawnMowerEntity;

  protected render() {
    if (!this.menuai || !this.stateObj) {
      return nothing;
    }

    const stateObj = this.stateObj;

    return html`
      ${stateObj.state !== UNAVAILABLE
        ? html` <div class="flex-horizontal">
            <div>
              <span class="status-subtitle"
                >${this.menuai!.localize(
                  "ui.dialogs.more_info_control.lawn_mower.activity"
                )}:
              </span>
              <span>
                <strong>${this.menuai.formatEntityState(stateObj)}</strong>
              </span>
            </div>
            ${this._renderBattery()}
          </div>`
        : nothing}
      ${LAWN_MOWER_COMMANDS.some((item) => item.isVisible(stateObj))
        ? html`
            <div>
              <p></p>
              <div class="status-subtitle">
                ${this.menuai!.localize(
                  "ui.dialogs.more_info_control.lawn_mower.commands"
                )}
              </div>
              <div class="flex-horizontal space-around">
                ${LAWN_MOWER_COMMANDS.filter((item) =>
                  item.isVisible(stateObj)
                ).map(
                  (item) => html`
                    <div>
                      <ha-icon-button
                        .path=${item.icon}
                        .entry=${item}
                        @click=${this._callService}
                        .label=${this.menuai!.localize(
                          `ui.dialogs.more_info_control.lawn_mower.${item.translationKey}`
                        )}
                        .disabled=${stateObj.state === UNAVAILABLE}
                      ></ha-icon-button>
                    </div>
                  `
                )}
              </div>
            </div>
          `
        : ""}
    `;
  }

  private _deviceEntities = memoizeOne(
    (
      deviceId: string,
      entities: menuai["entities"]
    ): EntityRegistryDisplayEntry[] => {
      const entries = Object.values(entities);
      return entries.filter((entity) => entity.device_id === deviceId);
    }
  );

  private _renderBattery() {
    const stateObj = this.stateObj!;

    const deviceId = this.menuai.entities[stateObj.entity_id]?.device_id;

    const entities = deviceId
      ? this._deviceEntities(deviceId, this.menuai.entities)
      : [];

    const batteryEntity = findBatteryEntity(this.menuai, entities);
    const battery = batteryEntity
      ? this.menuai.states[batteryEntity.entity_id]
      : undefined;

    const batteryIsBinary =
      battery && computeStateDomain(battery) === "binary_sensor";

    // Use device battery entity
    if (battery && (batteryIsBinary || !isNaN(battery.state as any))) {
      const batteryChargingEntity = findBatteryChargingEntity(
        this.menuai,
        entities
      );
      const batteryCharging = batteryChargingEntity
        ? this.menuai.states[batteryChargingEntity?.entity_id]
        : undefined;

      return html`
        <div>
          <span>
            ${batteryIsBinary
              ? ""
              : `${Number(battery.state).toFixed()}${blankBeforePercent(
                  this.menuai.locale
                )}%`}
            <ha-battery-icon
              .menuai=${this.menuai}
              .batteryStateObj=${battery}
              .batteryChargingStateObj=${batteryCharging}
            ></ha-battery-icon>
          </span>
        </div>
      `;
    }

    return nothing;
  }

  private _callService(ev: CustomEvent) {
    const entry = (ev.target! as any).entry as LawnMowerCommand;
    this.menuai.callService("lawn_mower", entry.serviceName, {
      entity_id: this.stateObj!.entity_id,
    });
  }

  static styles = css`
    :host {
      line-height: var(--ha-line-height-normal);
    }
    .status-subtitle {
      color: var(--secondary-text-color);
    }
    .flex-horizontal {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }
    .space-around {
      justify-content: space-around;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "more-info-lawn_mower": MoreInfoLawnMower;
  }
}
