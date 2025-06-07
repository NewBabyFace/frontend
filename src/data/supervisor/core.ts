import { atLeastVersion } from "../../common/config/version";
import type { menuai } from "../../types";
import type { menuaiioResponse } from "../menuaiio/common";

export const restartCore = async (menuai: menuai) => {
  await menuai.callService("menuai", "restart");
};

export const updateCore = async (menuai: menuai, backup: boolean) => {
  if (atLeastVersion(menuai.config.version, 2025, 2, 0)) {
    await menuai.callWS({
      type: "menuaiio/update/core",
      backup: backup,
    });
    return;
  }

  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    await menuai.callWS({
      type: "supervisor/api",
      endpoint: "/core/update",
      method: "post",
      timeout: null,
      data: { backup },
    });
    return;
  }

  await menuai.callApi<menuaiioResponse<void>>("POST", "menuaiio/core/update", {
    backup,
  });
};
