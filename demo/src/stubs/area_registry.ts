import type { AreaRegistryEntry } from "../../../src/data/area_registry";
import type { Mockmenuai } from "../../../src/fake_data/provide_menuai";

export const mockAreaRegistry = (
  menuai: Mockmenuai,
  data: AreaRegistryEntry[] = []
) => {
  menuai.mockWS("config/area_registry/list", () => data);
  const areas = {};
  data.forEach((area) => {
    areas[area.area_id] = area;
  });
  menuai.updatemenuai({ areas });
};
