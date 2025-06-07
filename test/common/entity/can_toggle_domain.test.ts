import { assert, describe, it } from "vitest";

import { canToggleDomain } from "../../../src/common/entity/can_toggle_domain";
import type { menuai } from "../../../src/types";

describe("canToggleDomain", () => {
  const menuai: any = {
    services: {
      light: {
        turn_on: null, // Service keys only need to be present for test
        turn_off: null,
      },
      sensor: {
        custom_service: null,
      },
    },
  };

  it("Detects lights toggle", () => {
    assert.isTrue(canToggleDomain(menuai, "light"));
  });

  it("Detects sensors do not toggle", () => {
    assert.isFalse(canToggleDomain(menuai, "sensor"));
  });

  it("Detects binary sensors do not toggle", () => {
    assert.isFalse(canToggleDomain(menuai, "binary_sensor"));
  });

  it("Detects covers toggle", () => {
    assert.isTrue(
      canToggleDomain(
        {
          services: {
            cover: {
              open_cover: null,
            },
          },
        } as unknown as menuai,
        "cover"
      )
    );
    assert.isFalse(
      canToggleDomain(
        {
          services: {
            cover: {
              open: null,
            },
          },
        } as unknown as menuai,
        "cover"
      )
    );
  });

  it("Detects lock toggle", () => {
    assert.isTrue(
      canToggleDomain(
        {
          services: {
            lock: {
              lock: null,
            },
          },
        } as unknown as menuai,
        "lock"
      )
    );
    assert.isFalse(
      canToggleDomain(
        {
          services: {
            lock: {
              unlock: null,
            },
          },
        } as unknown as menuai,
        "lock"
      )
    );
  });
});
