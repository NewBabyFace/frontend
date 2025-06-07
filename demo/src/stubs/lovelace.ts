import type { LocalizeFunc } from "../../../src/common/translations/localize";
import type { Mockmenuai } from "../../../src/fake_data/provide_menuai";
import {
  selectedDemoConfig,
  selectedDemoConfigIndex,
  setDemoConfig,
} from "../configs/demo-configs";
import "../custom-cards/cast-demo-row";
import "../custom-cards/ha-demo-card";
import { mapEntities } from "./entities";

export const mockLovelace = (
  menuai: Mockmenuai,
  localizePromise: Promise<LocalizeFunc>
) => {
  menuai.mockWS("lovelace/config", ({ url_path }) => {
    if (url_path === "map") {
      menuai.addEntities(mapEntities());
      return {
        strategy: {
          type: "map",
        },
      };
    }
    return Promise.all([selectedDemoConfig, localizePromise]).then(
      ([config, localize]) => config.lovelace(localize)
    );
  });

  menuai.mockWS("lovelace/config/save", () => Promise.resolve());
  menuai.mockWS("lovelace/resources", () => Promise.resolve([]));
};

customElements.whenDefined("hui-root").then(() => {
  // eslint-disable-next-line
  const HUIRoot = customElements.get("hui-root")!;

  const oldFirstUpdated = HUIRoot.prototype.firstUpdated;

  HUIRoot.prototype.firstUpdated = function (changedProperties) {
    oldFirstUpdated.call(this, changedProperties);
    this.addEventListener("set-demo-config", async (ev) => {
      const index = (ev as CustomEvent).detail.index;
      try {
        await setDemoConfig(this.menuai, this.lovelace!, index);
      } catch (_err: any) {
        setDemoConfig(this.menuai, this.lovelace!, selectedDemoConfigIndex);
        alert("Failed to switch config :-(");
      }
    });
  };
});
