import type { validateConfig } from "../../../src/data/config";
import type { Mockmenuai } from "../../../src/fake_data/provide_menuai";

export const mockConfig = (menuai: Mockmenuai) => {
  menuai.mockWS<typeof validateConfig>("validate_config", () => ({
    actions: { valid: true, error: null },
    conditions: { valid: true, error: null },
    triggers: { valid: true, error: null },
  }));
};
