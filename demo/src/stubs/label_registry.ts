import type { LabelRegistryEntry } from "../../../src/data/label_registry";
import type { Mockmenuai } from "../../../src/fake_data/provide_menuai";

export const mockLabelRegistry = (
  menuai: Mockmenuai,
  data: LabelRegistryEntry[] = []
) => menuai.mockWS("config/label_registry/list", () => data);
