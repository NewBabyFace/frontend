import type { menuai } from "../../../../types";
import { getHeaderFooterElementClass } from "../../create-element/create-header-footer-element";
import type { LovelaceHeaderFooterConfig } from "../../header-footer/types";

export const getHeaderFooterStubConfig = async (
  menuai: menuai,
  type: LovelaceHeaderFooterConfig["type"],
  entities: string[],
  entitiesFallback: string[]
): Promise<LovelaceHeaderFooterConfig> => {
  let config: LovelaceHeaderFooterConfig = { type };

  const elClass = await getHeaderFooterElementClass(type);

  if (elClass && elClass.getStubConfig) {
    const classStubConfig = await elClass.getStubConfig(
      menuai,
      entities,
      entitiesFallback
    );

    config = { ...config, ...classStubConfig };
  }

  return config;
};
