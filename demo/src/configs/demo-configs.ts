import type { Mockmenuai } from "../../../src/fake_data/provide_menuai";
import type { Lovelace } from "../../../src/panels/lovelace/types";
import { energyEntities } from "../stubs/entities";
import type { DemoConfig } from "./types";

export const demoConfigs: (() => Promise<DemoConfig>)[] = [
  () => import("./sections").then((mod) => mod.demoSections),
  () => import("./arsaboo").then((mod) => mod.demoArsaboo),
  () => import("./teachingbirds").then((mod) => mod.demoTeachingbirds),
  () => import("./kernehed").then((mod) => mod.demoKernehed),
  () => import("./jimpower").then((mod) => mod.demoJimpower),
];

// eslint-disable-next-line import/no-mutable-exports
export let selectedDemoConfigIndex = 0;
// eslint-disable-next-line import/no-mutable-exports
export let selectedDemoConfig: Promise<DemoConfig> =
  demoConfigs[selectedDemoConfigIndex]();

export const setDemoConfig = async (
  menuai: Mockmenuai,
  lovelace: Lovelace,
  index: number
) => {
  const confProm = demoConfigs[index]();
  const config = await confProm;

  selectedDemoConfigIndex = index;
  selectedDemoConfig = confProm;

  menuai.addEntities(config.entities(menuai.localize), true);
  menuai.addEntities(energyEntities());
  lovelace.saveConfig(config.lovelace(menuai.localize));
  menuai.mockTheme(config.theme());
};
