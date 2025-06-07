import type { Mockmenuai } from "../../../src/fake_data/provide_menuai";

export const mockAuth = (menuai: Mockmenuai) => {
  menuai.mockWS("config/auth/list", () => []);
  menuai.mockWS("auth/refresh_tokens", () => []);
};
