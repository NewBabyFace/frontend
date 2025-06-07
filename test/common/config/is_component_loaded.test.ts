import { describe, it, expect } from "vitest";
import { isComponentLoaded } from "../../../src/common/config/is_component_loaded";
import type { menuai } from "../../../src/types";

describe("isComponentLoaded", () => {
  it("should return if the component is loaded", () => {
    const menuai = {
      config: { components: ["test_component"] },
    } as unknown as menuai;
    expect(isComponentLoaded(menuai, "test_component")).toBe(true);
    expect(isComponentLoaded(menuai, "other_component")).toBe(false);
  });
});
