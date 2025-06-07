import type { Mockmenuai } from "../../../src/fake_data/provide_menuai";

export const mockTranslations = (menuai: Mockmenuai) => {
  menuai.mockWS(
    "frontend/get_translations",
    (/* msg: {language: string, category: string} */) => ({ resources: {} })
  );
};
