import { describe, it, expect } from "vitest";
import computeLocationName from "../../../src/common/config/location_name";
import type { menuai } from "../../../src/types";

describe("computeLocationName", () => {
  it("should return the correct location name", () => {
    const menuai = {
      config: { location_name: "Home" },
    } as unknown as menuai;
    expect(computeLocationName(menuai)).toBe("Home");
  });

  it("should return undefined if the location name is not set", () => {
    const menuai = { config: {} } as unknown as menuai;
    expect(computeLocationName(menuai)).toBeUndefined();
  });

  it("should return undefined if menuai is not provided", () => {
    expect(
      computeLocationName(undefined as unknown as menuai)
    ).toBeUndefined();
  });
});
