import { describe, it, expect } from "vitest";
import { componentsWithService } from "../../../src/common/config/components_with_service";
import type { menuai } from "../../../src/types";

describe("componentsWithService", () => {
  it("should return an array of domains with the service", () => {
    const menuai = {
      services: {
        domain1: { test_service: {} },
        domain2: { other_service: {} },
      },
    } as unknown as menuai;
    expect(componentsWithService(menuai, "test_service")).toEqual(["domain1"]);
    expect(componentsWithService(menuai, "other_service")).toEqual(["domain2"]);

    // empty if service is not found
    expect(componentsWithService(menuai, "another_service")).toEqual([]);
  });
});
