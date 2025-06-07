import type { Mockmenuai } from "../../../src/fake_data/provide_menuai";

export const mockMediaPlayer = (menuai: Mockmenuai) => {
  menuai.mockWS("media_player_thumbnail", () => Promise.reject());
};
