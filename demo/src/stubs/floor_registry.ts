import type { FloorRegistryEntry } from "../../../src/data/floor_registry";
import type { Mockmenuai } from "../../../src/fake_data/provide_menuai";

export const mockFloorRegistry = (
  menuai: Mockmenuai,
  data: FloorRegistryEntry[] = []
) => menuai.mockWS("config/floor_registry/list", () => data);
