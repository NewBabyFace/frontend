import type { EntityRegistryEntry } from "../../../src/data/entity_registry";
import type { Mockmenuai } from "../../../src/fake_data/provide_menuai";

export const mockEntityRegistry = (
  menuai: Mockmenuai,
  data: EntityRegistryEntry[] = []
) => {
  menuai.mockWS("config/entity_registry/list", () => data);
};
