import { atLeastVersion } from "../../common/config/version";
import type { menuai, TranslationDict } from "../../types";
import type { menuaiioResponse } from "./common";
import { menuaiioApiResultExtractor } from "./common";

export interface menuaiioResolution {
  unsupported: (keyof TranslationDict["supervisor"]["system"]["supervisor"]["unsupported_reason"])[];
  unhealthy: (keyof TranslationDict["supervisor"]["system"]["supervisor"]["unhealthy_reason"])[];
  issues: string[];
  suggestions: string[];
}

export const fetchmenuaiioResolution = async (
  menuai: menuai
): Promise<menuaiioResolution> => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    return menuai.callWS({
      type: "supervisor/api",
      endpoint: "/resolution/info",
      method: "get",
    });
  }

  return menuaiioApiResultExtractor(
    await menuai.callApi<menuaiioResponse<menuaiioResolution>>(
      "GET",
      "menuaiio/resolution/info"
    )
  );
};
