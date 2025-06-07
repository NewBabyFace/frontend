import type { AreaRegistryEntry } from "../../../data/area_registry";
import type { FloorRegistryEntry } from "../../../data/floor_registry";
import type { menuai } from "../../../types";

interface AreaContext {
  area: AreaRegistryEntry | null;
  floor: FloorRegistryEntry | null;
}
export const getAreaContext = (
  area: AreaRegistryEntry,
  menuai: menuai
): AreaContext => {
  const floorId = area.floor_id;
  const floor = floorId ? menuai.floors[floorId] : undefined;

  return {
    area: area,
    floor: floor || null,
  };
};
