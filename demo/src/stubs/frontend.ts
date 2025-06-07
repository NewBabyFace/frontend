import type { Mockmenuai } from "../../../src/fake_data/provide_menuai";

let changeFunction;

export const mockFrontend = (menuai: Mockmenuai) => {
  menuai.mockWS("frontend/get_user_data", () => ({
    value: null,
  }));
  menuai.mockWS("frontend/set_user_data", ({ key, value }) => {
    if (key === "sidebar") {
      changeFunction?.({
        value: {
          panelOrder: value.panelOrder || [],
          hiddenPanels: value.hiddenPanels || [],
        },
      });
    }
  });
  menuai.mockWS("frontend/subscribe_user_data", (_msg, _menuai, onChange) => {
    changeFunction = onChange;
    onChange?.({
      value: {
        panelOrder: [],
        hiddenPanels: [],
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {};
  });
};
