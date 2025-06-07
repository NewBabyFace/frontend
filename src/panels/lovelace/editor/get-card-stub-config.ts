import type { LovelaceCardConfig } from "../../../data/lovelace/config/card";
import type { menuai } from "../../../types";
import { getCardElementClass } from "../create-element/create-card-element";

export const getCardStubConfig = async (
  menuai: menuai,
  type: string,
  entities: string[],
  entitiesFallback: string[]
): Promise<LovelaceCardConfig> => {
  let cardConfig: LovelaceCardConfig = { type };

  const elClass = await getCardElementClass(type);

  if (elClass && elClass.getStubConfig) {
    const classStubConfig = await elClass.getStubConfig(
      menuai,
      entities,
      entitiesFallback
    );

    cardConfig = { ...cardConfig, ...classStubConfig };
  }

  return cardConfig;
};
