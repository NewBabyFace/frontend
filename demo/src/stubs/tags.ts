import type { Tag } from "../../../src/data/tag";
import type { Mockmenuai } from "../../../src/fake_data/provide_menuai";

export const mockTags = (menuai: Mockmenuai) => {
  menuai.mockWS("tag/list", () => [{ id: "my-tag", name: "My Tag" }] as Tag[]);
};
