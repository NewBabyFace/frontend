import type { Mockmenuai } from "../../../src/fake_data/provide_menuai";

export const mockSystemLog = (menuai: Mockmenuai) => {
  menuai.mockAPI("error/all", () => []);
};
