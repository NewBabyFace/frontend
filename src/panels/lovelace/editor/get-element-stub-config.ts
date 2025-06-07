import type { LovelaceElementConfig } from "../elements/types";
import type { menuai } from "../../../types";
import { getPictureElementClass } from "../create-element/create-picture-element";

export const getElementStubConfig = async (
  menuai: menuai,
  type: string,
  entities: string[],
  entitiesFallback: string[]
): Promise<LovelaceElementConfig> => {
  let elementConfig: LovelaceElementConfig = { type };

  if (type !== "conditional") {
    elementConfig.style = { left: "50%", top: "50%" };
  }

  const elClass = await getPictureElementClass(type);

  if (elClass && elClass.getStubConfig) {
    const classStubConfig = await elClass.getStubConfig(
      menuai,
      entities,
      entitiesFallback
    );

    elementConfig = { ...elementConfig, ...classStubConfig };
  }

  return elementConfig;
};
