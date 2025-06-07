import { atLeastVersion } from "../../common/config/version";
import type { menuai } from "../../types";
import type { menuaiioResponse } from "../menuaiio/common";
import { menuaiioApiResultExtractor } from "../menuaiio/common";

export interface SupervisorApiCallOptions {
  method?: "get" | "post" | "delete";
  data?: Record<string, any>;
  timeout?: number;
}

export const supervisorApiCall = async <T>(
  menuai: menuai,
  endpoint: string,
  options?: SupervisorApiCallOptions
): Promise<T> => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    // Websockets was added in 2021.2.4
    return menuai.callWS<T>({
      type: "supervisor/api",
      endpoint,
      method: options?.method || "get",
      timeout: options?.timeout ?? null,
      data: options?.data,
    });
  }
  return menuaiioApiResultExtractor(
    await menuai.callApi<menuaiioResponse<T>>(
      // @ts-ignore
      (options.method || "get").toUpperCase(),
      `menuaiio${endpoint}`,
      options?.data
    )
  );
};
