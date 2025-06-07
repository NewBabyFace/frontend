import { describe, it, expect } from "vitest";
import { isServiceLoaded } from "../../../src/common/config/is_service_loaded";
import type { menuai } from "../../../src/types";

describe("isServiceLoaded", () => {
  it("should return true if the service is loaded", () => {
    const menuai = {
      services: {
        light: {
          turn_on: {},
        },
      },
    } as unknown as menuai;
    expect(isServiceLoaded(menuai, "light", "turn_on")).toBe(true);
  });

  it("should return false if the service is not loaded", () => {
    const menuai: menuai = {
      services: {
        light: {
          turn_on: {},
        },
      },
    } as unknown as menuai;
    expect(isServiceLoaded(menuai, "light", "turn_off")).toBe(false);
  });

  it("should return false if the domain is not loaded", () => {
    const menuai: menuai = {
      services: {
        light: {
          turn_on: {},
        },
      },
    } as unknown as menuai;
    expect(isServiceLoaded(menuai, "switch", "turn_on")).toBe(false);
  });

  it("should handle null menuai", () => {
    expect(
      isServiceLoaded(null as unknown as menuai, "light", "turn_on")
    ).toBe(null);
  });
});
