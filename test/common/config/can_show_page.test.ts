import { describe, it, expect } from "vitest";
import {
  canShowPage,
  isLoadedIntegration,
  isNotLoadedIntegration,
  isCore,
  isAdvancedPage,
  userWantsAdvanced,
  hideAdvancedPage,
} from "../../../src/common/config/can_show_page";
import type { PageNavigation } from "../../../src/layouts/menuai-tabs-subpage";
import type { menuai } from "../../../src/types";

describe("canShowPage", () => {
  it("should return true if the page can be shown", () => {
    const menuai = {
      config: { components: ["test_component"] },
      userData: { showAdvanced: true },
    } as unknown as menuai;
    const page = {
      component: "test_component",
      core: true,
      advancedOnly: false,
    } as unknown as PageNavigation;
    expect(canShowPage(menuai, page)).toBe(true);
  });

  it("should return false if the page cannot be shown", () => {
    const menuai = {
      config: { components: ["test_component"] },
      userData: { showAdvanced: false },
    } as unknown as menuai;
    const page = {
      component: "other_component",
      core: false,
      advancedOnly: true,
    } as unknown as PageNavigation;
    expect(canShowPage(menuai, page)).toBe(false);
  });
});

describe("isLoadedIntegration", () => {
  it("should return true if the integration is loaded", () => {
    const menuai = {
      config: { components: ["test_component"] },
    } as unknown as menuai;
    const page = { component: "test_component" } as unknown as PageNavigation;
    expect(isLoadedIntegration(menuai, page)).toBe(true);
  });

  it("should return false if the integration is not loaded", () => {
    const menuai = {
      config: { components: ["test_component"] },
    } as unknown as menuai;
    const page = { component: "other_component" } as unknown as PageNavigation;
    expect(isLoadedIntegration(menuai, page)).toBe(false);
  });
});

describe("isNotLoadedIntegration", () => {
  it("should return true if the integration is not loaded", () => {
    const menuai = {
      config: { components: ["test_component"] },
    } as unknown as menuai;
    const page = {
      not_component: "other_component",
    } as unknown as PageNavigation;
    expect(isNotLoadedIntegration(menuai, page)).toBe(true);
  });

  it("should return false if the integration is loaded", () => {
    const menuai = {
      config: { components: ["test_component"] },
    } as unknown as menuai;
    const page = {
      not_component: "test_component",
    } as unknown as PageNavigation;
    expect(isNotLoadedIntegration(menuai, page)).toBe(false);
  });
});

describe("isCore", () => {
  it("should return true if the page is core", () => {
    const page = { core: true } as unknown as PageNavigation;
    expect(isCore(page)).toBe(true);
  });

  it("should return false if the page is not core", () => {
    const page = { core: false } as unknown as PageNavigation;
    expect(isCore(page)).toBe(false);
  });
});

describe("isAdvancedPage", () => {
  it("should return true if the page is advanced", () => {
    const page = { advancedOnly: true } as unknown as PageNavigation;
    expect(isAdvancedPage(page)).toBe(true);
  });

  it("should return false if the page is not advanced", () => {
    const page = { advancedOnly: false } as unknown as PageNavigation;
    expect(isAdvancedPage(page)).toBe(false);
  });
});

describe("userWantsAdvanced", () => {
  it("should return true if the user wants advanced pages", () => {
    const menuai = {
      userData: { showAdvanced: true },
    } as unknown as menuai;
    expect(userWantsAdvanced(menuai)).toBe(true);
  });

  it("should return false if the user does not want advanced pages", () => {
    const menuai = {
      userData: { showAdvanced: false },
    } as unknown as menuai;
    expect(userWantsAdvanced(menuai)).toBe(false);
  });
});

describe("hideAdvancedPage", () => {
  it("should return true if the advanced page should be hidden", () => {
    const menuai = {
      userData: { showAdvanced: false },
    } as unknown as menuai;
    const page = { advancedOnly: true } as unknown as PageNavigation;
    expect(hideAdvancedPage(menuai, page)).toBe(true);
  });

  it("should return false if the advanced page should not be hidden", () => {
    const menuai = {
      userData: { showAdvanced: true },
    } as unknown as menuai;
    const page = { advancedOnly: true } as unknown as PageNavigation;
    expect(hideAdvancedPage(menuai, page)).toBe(false);
  });
});
