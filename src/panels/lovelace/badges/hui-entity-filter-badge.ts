import type { PropertyValues } from "lit";
import { ReactiveElement } from "lit";
import { customElement, property, state } from "lit/decorators";
import type { menuai } from "../../../types";
import { evaluateStateFilter } from "../common/evaluate-filter";
import { processConfigEntities } from "../common/process-config-entities";
import {
  addEntityToCondition,
  checkConditionsMet,
  extractConditionEntityIds,
} from "../common/validate-condition";
import type { EntityFilterEntityConfig } from "../entity-rows/types";
import type { LovelaceBadge } from "../types";
import "./hui-badge";
import type { HuiBadge } from "./hui-badge";
import type { EntityFilterBadgeConfig } from "./types";

@customElement("hui-entity-filter-badge")
export class HuiEntityFilterBadge
  extends ReactiveElement
  implements LovelaceBadge
{
  @property({ attribute: false }) public preview = false;

  @property({ attribute: false }) public menuai!: menuai;

  @state() private _config?: EntityFilterBadgeConfig;

  private _elements?: HuiBadge[];

  private _configEntities?: EntityFilterEntityConfig[];

  private _oldEntities?: EntityFilterEntityConfig[];

  public setConfig(config: EntityFilterBadgeConfig): void {
    if (!config.entities.length || !Array.isArray(config.entities)) {
      throw new Error("Entities must be specified");
    }

    if (
      !(
        (config.conditions && Array.isArray(config.conditions)) ||
        (config.state_filter && Array.isArray(config.state_filter))
      ) &&
      !config.entities.every(
        (entity) =>
          typeof entity === "object" &&
          entity.state_filter &&
          Array.isArray(entity.state_filter)
      )
    ) {
      throw new Error("Incorrect filter config");
    }

    while (this.lastChild) {
      this.removeChild(this.lastChild);
    }
    this._elements = undefined;

    this._configEntities = processConfigEntities(config.entities);
    this._oldEntities = undefined;
    this._config = config;
  }

  protected createRenderRoot() {
    return this;
  }

  protected shouldUpdate(changedProperties: PropertyValues): boolean {
    if (
      changedProperties.has("_config") ||
      (changedProperties.has("menuai") &&
        this._haveEntitiesChanged(
          changedProperties.get("menuai") as menuai | undefined
        ))
    ) {
      return true;
    }
    return false;
  }

  protected update(changedProperties: PropertyValues) {
    super.update(changedProperties);
    if (!this.menuai || !this._configEntities) {
      return;
    }

    if (this._elements) {
      for (const element of this._elements) {
        element.menuai = this.menuai;
      }
    }

    const entitiesList = this._configEntities.filter((entityConf) => {
      const stateObj = this.menuai.states[entityConf.entity];
      if (!stateObj) return false;

      const conditions = entityConf.conditions ?? this._config!.conditions;
      if (conditions) {
        const conditionWithEntity = conditions.map((condition) =>
          addEntityToCondition(condition, entityConf.entity)
        );
        return checkConditionsMet(conditionWithEntity, this.menuai!);
      }

      const filters = entityConf.state_filter ?? this._config!.state_filter;
      if (filters) {
        return filters.some((filter) => evaluateStateFilter(stateObj, filter));
      }

      return false;
    });

    if (entitiesList.length === 0) {
      this.style.display = "none";
      this._oldEntities = entitiesList;
      return;
    }

    const isSame =
      this._oldEntities &&
      entitiesList.length === this._oldEntities.length &&
      entitiesList.every((entity, idx) => entity === this._oldEntities![idx]);

    if (!isSame) {
      this._elements = [];
      for (const badgeConfig of entitiesList) {
        const element = document.createElement("hui-badge");
        element.menuai = this.menuai;
        element.preview = this.preview;
        element.config = {
          type: "entity",
          ...badgeConfig,
        };
        element.load();
        this._elements.push(element);
      }
      this._oldEntities = entitiesList;
    }

    if (!this._elements) {
      return;
    }

    while (this.lastChild) {
      this.removeChild(this.lastChild);
    }

    for (const element of this._elements) {
      this.appendChild(element);
    }

    this.style.display = "flex";
    this.style.flexWrap = "wrap";
    this.style.justifyContent = "center";
    this.style.gap = "8px";
  }

  private _haveEntitiesChanged(oldmenuai?: menuai): boolean {
    if (!oldmenuai) {
      return true;
    }

    if (!this._oldEntities || this.menuai.localize !== oldmenuai.localize) {
      return true;
    }

    for (const config of this._configEntities!) {
      if (this.menuai.states[config.entity] !== oldmenuai.states[config.entity]) {
        return true;
      }
      if (config.conditions) {
        const entityIds = extractConditionEntityIds(config.conditions);
        for (const entityId of entityIds) {
          if (this.menuai.states[entityId] !== oldmenuai.states[entityId]) {
            return true;
          }
        }
      }
    }

    if (this._config?.conditions) {
      const entityIds = extractConditionEntityIds(this._config?.conditions);
      for (const entityId of entityIds) {
        if (this.menuai.states[entityId] !== oldmenuai.states[entityId]) {
          return true;
        }
      }
    }
    return false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-entity-filter-badge": HuiEntityFilterBadge;
  }
}
