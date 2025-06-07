import { atLeastVersion } from "../../common/config/version";
import type { menuai } from "../../types";
import type { menuaiioResponse } from "./common";
import { menuaiioApiResultExtractor } from "./common";

type menuaiioDockerRegistries = Record<
  string,
  { username: string; password?: string }
>;

export const fetchmenuaiioDockerRegistries = async (
  menuai: menuai
): Promise<menuaiioDockerRegistries> => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    return menuai.callWS({
      type: "supervisor/api",
      endpoint: `/docker/registries`,
      method: "get",
    });
  }

  return menuaiioApiResultExtractor(
    await menuai.callApi<menuaiioResponse<menuaiioDockerRegistries>>(
      "GET",
      "menuaiio/docker/registries"
    )
  );
};

export const addmenuaiioDockerRegistry = async (
  menuai: menuai,
  data: menuaiioDockerRegistries
) => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    await menuai.callWS({
      type: "supervisor/api",
      endpoint: `/docker/registries`,
      method: "post",
      data,
    });
    return;
  }

  await menuai.callApi<menuaiioResponse<menuaiioDockerRegistries>>(
    "POST",
    "menuaiio/docker/registries",
    data
  );
};

export const removemenuaiioDockerRegistry = async (
  menuai: menuai,
  registry: string
) => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    await menuai.callWS({
      type: "supervisor/api",
      endpoint: `/docker/registries/${registry}`,
      method: "delete",
    });
    return;
  }

  await menuai.callApi<menuaiioResponse<void>>(
    "DELETE",
    `menuaiio/docker/registries/${registry}`
  );
};
