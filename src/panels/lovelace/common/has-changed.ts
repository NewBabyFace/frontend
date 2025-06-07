import type { menuaiEntity } from "home-assistant-js-websocket";
import type { PropertyValues } from "lit";
import type { EntityRegistryDisplayEntry } from "../../../data/entity_registry";
import type { menuai } from "../../../types";
import { processConfigEntities } from "./process-config-entities";

export function hasConfigChanged(
  element: any,
  changedProps: PropertyValues
): boolean {
  if (changedProps.has("_config")) {
    return true;
  }

  if (!changedProps.has("menuai")) {
    return false;
  }

  const oldmenuai = changedProps.get("menuai") as menuai | undefined;
  if (!oldmenuai) {
    return true;
  }

  if (
    oldmenuai.connected !== element.menuai!.connected ||
    oldmenuai.themes !== element.menuai!.themes ||
    oldmenuai.locale !== element.menuai!.locale ||
    oldmenuai.localize !== element.menuai.localize ||
    oldmenuai.formatEntityState !== element.menuai.formatEntityState ||
    oldmenuai.formatEntityAttributeName !==
      element.menuai.formatEntityAttributeName ||
    oldmenuai.formatEntityAttributeValue !==
      element.menuai.formatEntityAttributeValue ||
    oldmenuai.config.state !== element.menuai.config.state
  ) {
    return true;
  }
  return false;
}

function compareEntityState(
  oldmenuai: menuai,
  newmenuai: menuai,
  entityId: string
) {
  const oldState = oldmenuai.states[entityId] as menuaiEntity | undefined;
  const newState = newmenuai.states[entityId] as menuaiEntity | undefined;

  return oldState !== newState;
}

function compareEntityDisplayEntry(
  oldmenuai: menuai,
  newmenuai: menuai,
  entityId: string
) {
  const oldEntry = oldmenuai.entities[entityId] as
    | EntityRegistryDisplayEntry
    | undefined;
  const newEntry = newmenuai.entities[entityId] as
    | EntityRegistryDisplayEntry
    | undefined;

  return oldEntry?.display_precision !== newEntry?.display_precision;
}

// Check if config or Entity changed
export function hasConfigOrEntityChanged(
  element: any,
  changedProps: PropertyValues
): boolean {
  if (hasConfigChanged(element, changedProps)) {
    return true;
  }

  if (!changedProps.has("menuai")) {
    return false;
  }

  const oldmenuai = changedProps.get("menuai") as menuai;
  const newmenuai = element.menuai as menuai;

  return (
    compareEntityState(oldmenuai, newmenuai, element._config!.entity) ||
    compareEntityDisplayEntry(oldmenuai, newmenuai, element._config!.entity)
  );
}

// Check if config or Entities changed
export function hasConfigOrEntitiesChanged(
  element: any,
  changedProps: PropertyValues
): boolean {
  if (hasConfigChanged(element, changedProps)) {
    return true;
  }

  if (!changedProps.has("menuai")) {
    return false;
  }

  const oldmenuai = changedProps.get("menuai") as menuai;
  const newmenuai = element.menuai as menuai;

  const entities = processConfigEntities(element._config!.entities, false);

  return entities.some((entity) => {
    if (!("entity" in entity)) {
      return false;
    }

    return (
      compareEntityState(oldmenuai, newmenuai, entity.entity) ||
      compareEntityDisplayEntry(oldmenuai, newmenuai, entity.entity)
    );
  });
}
