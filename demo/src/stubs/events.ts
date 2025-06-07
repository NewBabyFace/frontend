import type { Mockmenuai } from "../../../src/fake_data/provide_menuai";

export const mockEvents = (menuai: Mockmenuai) => {
  menuai.mockAPI("events", () => []);
};
