import type { LovelaceCardConfig } from "../../../data/lovelace/config/card";
import type { menuai } from "../../../types";
import { getBadgeElementClass } from "../create-element/create-badge-element";

export const getBadgeStubConfig = async (
  menuai: menuai,
  type: string,
  entities: string[],
  entitiesFallback: string[]
): Promise<LovelaceCardConfig> => {
  let badgeConfig: LovelaceCardConfig = { type };

  const elClass = await getBadgeElementClass(type);

  if (elClass && elClass.getStubConfig) {
    const classStubConfig = await elClass.getStubConfig(
      menuai,
      entities,
      entitiesFallback
    );

    badgeConfig = { ...badgeConfig, ...classStubConfig };
  }

  return badgeConfig;
};
