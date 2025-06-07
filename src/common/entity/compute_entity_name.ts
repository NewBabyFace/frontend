import type { menuaiEntity } from "home-assistant-js-websocket";
import type {
  EntityRegistryDisplayEntry,
  EntityRegistryEntry,
} from "../../data/entity_registry";
import type { menuai } from "../../types";
import { computeDeviceName } from "./compute_device_name";
import { computeStateName } from "./compute_state_name";
import { stripPrefixFromEntityName } from "./strip_prefix_from_entity_name";

export const computeEntityName = (
  stateObj: menuaiEntity,
  menuai: menuai
): string | undefined => {
  const entry = menuai.entities[stateObj.entity_id] as
    | EntityRegistryDisplayEntry
    | undefined;

  if (!entry) {
    // Fall back to state name if not in the entity registry (friendly name)
    return computeStateName(stateObj);
  }
  return computeEntityEntryName(entry, menuai);
};

export const computeEntityEntryName = (
  entry: EntityRegistryDisplayEntry | EntityRegistryEntry,
  menuai: menuai
): string | undefined => {
  const name =
    entry.name || ("original_name" in entry ? entry.original_name : undefined);

  const device = entry.device_id ? menuai.devices[entry.device_id] : undefined;

  if (!device) {
    if (name) {
      return name;
    }
    const stateObj = menuai.states[entry.entity_id] as menuaiEntity | undefined;
    if (stateObj) {
      return computeStateName(stateObj);
    }
    return undefined;
  }

  const deviceName = computeDeviceName(device);

  // If the device name is the same as the entity name, consider empty entity name
  if (deviceName === name) {
    return undefined;
  }

  // Remove the device name from the entity name if it starts with it
  if (deviceName && name) {
    return stripPrefixFromEntityName(name, deviceName) || name;
  }

  return name;
};
