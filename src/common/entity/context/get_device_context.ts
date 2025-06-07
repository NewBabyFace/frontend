import type { AreaRegistryEntry } from "../../../data/area_registry";
import type { DeviceRegistryEntry } from "../../../data/device_registry";
import type { FloorRegistryEntry } from "../../../data/floor_registry";
import type { menuai } from "../../../types";

interface DeviceContext {
  device: DeviceRegistryEntry;
  area: AreaRegistryEntry | null;
  floor: FloorRegistryEntry | null;
}

export const getDeviceContext = (
  device: DeviceRegistryEntry,
  menuai: menuai
): DeviceContext => {
  const areaId = device.area_id;
  const area = areaId ? menuai.areas[areaId] : undefined;
  const floorId = area?.floor_id;
  const floor = floorId ? menuai.floors[floorId] : undefined;

  return {
    device: device,
    area: area || null,
    floor: floor || null,
  };
};
