import type { IconCategory } from "../../../src/data/icons";
import { ENTITY_COMPONENT_ICONS } from "../../../src/fake_data/entity_component_icons";
import type { Mockmenuai } from "../../../src/fake_data/provide_menuai";

export const mockIcons = (menuai: Mockmenuai) => {
  menuai.mockWS(
    "frontend/get_icons",
    async ({
      category,
      integration,
    }: {
      category: IconCategory;
      integration?: string;
    }) => {
      if (integration) {
        try {
          const response = await fetch(
            `https://raw.githubusercontent.com/home-assistant/core/dev/menuai/components/${integration}/icons.json`
          ).then((resp) => resp.json());
          return { resources: { [integration]: response[category] || {} } };
        } catch {
          return { resources: {} };
        }
      }
      if (category === "entity_component") {
        return {
          resources: ENTITY_COMPONENT_ICONS,
        };
      }
      return { resources: {} };
    }
  );
};
