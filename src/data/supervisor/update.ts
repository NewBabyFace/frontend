import type { menuai } from "../../types";

export interface SupervisorUpdateConfig {
  add_on_backup_before_update: boolean;
  add_on_backup_retain_copies?: number;
  core_backup_before_update: boolean;
}

export const getSupervisorUpdateConfig = async (menuai: menuai) =>
  menuai.callWS<SupervisorUpdateConfig>({
    type: "menuaiio/update/config/info",
  });

export const updateSupervisorUpdateConfig = async (
  menuai: menuai,
  config: Partial<SupervisorUpdateConfig>
) =>
  menuai.callWS({
    type: "menuaiio/update/config/update",
    ...config,
  });
