import type { Mockmenuai } from "../../../src/fake_data/provide_menuai";

export const mockTemplate = (menuai: Mockmenuai) => {
  menuai.mockAPI("template", () =>
    Promise.reject({
      body: { message: "Template dev tool does not work in the demo." },
    })
  );
  menuai.mockWS("render_template", (msg, _menuai, onChange) => {
    onChange!({
      result: msg.template,
      listeners: { all: false, domains: [], entities: [], time: false },
    });
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {};
  });
};
