import type { menuaiEntity } from "home-assistant-js-websocket";
import type { AreaRegistryEntry } from "../../../data/area_registry";
import type { DeviceRegistryEntry } from "../../../data/device_registry";
import type {
  EntityRegistryDisplayEntry,
  EntityRegistryEntry,
  ExtEntityRegistryEntry,
} from "../../../data/entity_registry";
import type { FloorRegistryEntry } from "../../../data/floor_registry";
import type { menuai } from "../../../types";

interface EntityContext {
  entity: EntityRegistryDisplayEntry | null;
  device: DeviceRegistryEntry | null;
  area: AreaRegistryEntry | null;
  floor: FloorRegistryEntry | null;
}

export const getEntityContext = (
  stateObj: menuaiEntity,
  menuai: menuai
): EntityContext => {
  const entry = menuai.entities[stateObj.entity_id] as
    | EntityRegistryDisplayEntry
    | undefined;

  if (!entry) {
    return {
      entity: null,
      device: null,
      area: null,
      floor: null,
    };
  }
  return getEntityEntryContext(entry, menuai);
};

export const getEntityEntryContext = (
  entry:
    | EntityRegistryDisplayEntry
    | EntityRegistryEntry
    | ExtEntityRegistryEntry,
  menuai: menuai
): EntityContext => {
  const entity = menuai.entities[entry.entity_id];
  const deviceId = entry?.device_id;
  const device = deviceId ? menuai.devices[deviceId] : undefined;
  const areaId = entry?.area_id || device?.area_id;
  const area = areaId ? menuai.areas[areaId] : undefined;
  const floorId = area?.floor_id;
  const floor = floorId ? menuai.floors[floorId] : undefined;

  return {
    entity: entity,
    device: device || null,
    area: area || null,
    floor: floor || null,
  };
};
