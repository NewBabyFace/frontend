import { atLeastVersion } from "../../common/config/version";
import type { HaFormSchema } from "../../components/ha-form/types";
import type { menuai, TranslationDict } from "../../types";
import { supervisorApiCall } from "../supervisor/common";
import type { StoreAddonDetails } from "../supervisor/store";
import type { Supervisor, SupervisorArch } from "../supervisor/supervisor";
import type { menuaiioResponse } from "./common";
import { extractApiErrorMessage, menuaiioApiResultExtractor } from "./common";

export type AddonCapability = Exclude<
  keyof TranslationDict["supervisor"]["addon"]["dashboard"]["capability"],
  "label" | "role" | "stages"
>;
export type AddonStage = "stable" | "experimental" | "deprecated";
export type AddonAppArmour = "disable" | "default" | "profile";
export type AddonRole = "default" | "menuai" | "manager" | "admin";
export type AddonStartup =
  | "initialize"
  | "system"
  | "services"
  | "application"
  | "once";
export type AddonState =
  | "startup"
  | "started"
  | "stopped"
  | "unknown"
  | "error"
  | null;
export type AddonRepository = "core" | "local" | string;

interface AddonTranslations {
  network?: Record<string, string>;
  configuration?: Record<string, { name?: string; description?: string }>;
}

export interface menuaiioAddonInfo {
  advanced: boolean;
  available: boolean;
  build: boolean;
  description: string;
  detached: boolean;
  menuai: string;
  icon: boolean;
  installed: boolean;
  logo: boolean;
  name: string;
  repository: AddonRepository;
  slug: string;
  stage: AddonStage;
  state: AddonState;
  update_available: boolean;
  url: string | null;
  version_latest: string;
  version: string;
}

export interface menuaiioAddonDetails extends menuaiioAddonInfo {
  apparmor: AddonAppArmour;
  arch: SupervisorArch[];
  audio_input: null | string;
  audio_output: null | string;
  audio: boolean;
  auth_api: boolean;
  auto_uart: boolean;
  auto_update: boolean;
  boot: "auto" | "manual";
  changelog: boolean;
  devices: string[];
  devicetree: boolean;
  discovery: string[];
  docker_api: boolean;
  documentation: boolean;
  full_access: boolean;
  gpio: boolean;
  menuaiio_api: boolean;
  menuaiio_role: AddonRole;
  hostname: string;
  menuai_api: boolean;
  host_dbus: boolean;
  host_ipc: boolean;
  host_network: boolean;
  host_pid: boolean;
  ingress_entry: null | string;
  ingress_panel: boolean;
  ingress_url: null | string;
  ingress: boolean;
  ip_address: string;
  kernel_modules: boolean;
  long_description: null | string;
  machine: any;
  network_description: null | Record<string, string>;
  network: null | Record<string, number>;
  options: Record<string, unknown>;
  privileged: any;
  protected: boolean;
  rating: "1-8";
  schema: HaFormSchema[] | null;
  services_role: string[];
  signed: boolean;
  slug: string;
  startup: AddonStartup;
  stdin: boolean;
  system_managed: boolean;
  system_managed_config_entry: string | null;
  translations: Record<string, AddonTranslations>;
  watchdog: null | boolean;
  webui: null | string;
}

export interface menuaiioAddonsInfo {
  addons: menuaiioAddonInfo[];
  repositories: menuaiioAddonRepository[];
}

export interface menuaiioAddonSetSecurityParams {
  protected?: boolean;
}

export interface menuaiioAddonRepository {
  slug: string;
  name: string;
  source: string;
  url: string;
  maintainer: string;
}

export interface menuaiioAddonSetOptionParams {
  audio_input?: string | null;
  audio_output?: string | null;
  options?: Record<string, unknown> | null;
  boot?: "auto" | "manual";
  auto_update?: boolean;
  ingress_panel?: boolean;
  network?: Record<string, unknown> | null;
  watchdog?: boolean;
}

export const reloadmenuaiioAddons = async (menuai: menuai) => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    await menuai.callWS({
      type: "supervisor/api",
      endpoint: "/addons/reload",
      method: "post",
    });
    return;
  }
  await menuai.callApi<menuaiioResponse<void>>("POST", `menuaiio/addons/reload`);
};

export const fetchmenuaiioAddonsInfo = async (
  menuai: menuai
): Promise<menuaiioAddonsInfo> => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    return menuai.callWS({
      type: "supervisor/api",
      endpoint: "/addons",
      method: "get",
    });
  }

  return menuaiioApiResultExtractor(
    await menuai.callApi<menuaiioResponse<menuaiioAddonsInfo>>("GET", `menuaiio/addons`)
  );
};

export const fetchmenuaiioAddonInfo = async (
  menuai: menuai,
  slug: string
): Promise<menuaiioAddonDetails> => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    return menuai.callWS({
      type: "supervisor/api",
      endpoint: `/addons/${slug}/info`,
      method: "get",
    });
  }

  return menuaiioApiResultExtractor(
    await menuai.callApi<menuaiioResponse<menuaiioAddonDetails>>(
      "GET",
      `menuaiio/addons/${slug}/info`
    )
  );
};

export const fetchmenuaiioAddonChangelog = async (
  menuai: menuai,
  slug: string
) => menuai.callApi<string>("GET", `menuaiio/addons/${slug}/changelog`);

export const fetchmenuaiioAddonLogs = async (menuai: menuai, slug: string) =>
  menuai.callApi<string>("GET", `menuaiio/addons/${slug}/logs`);

export const fetchmenuaiioAddonDocumentation = async (
  menuai: menuai,
  slug: string
) => menuai.callApi<string>("GET", `menuaiio/addons/${slug}/documentation`);

export const setmenuaiioAddonOption = async (
  menuai: menuai,
  slug: string,
  data: menuaiioAddonSetOptionParams
) => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    const response = await menuai.callWS<menuaiioResponse<any>>({
      type: "supervisor/api",
      endpoint: `/addons/${slug}/options`,
      method: "post",
      data,
    });

    if (response.result === "error") {
      throw Error(extractApiErrorMessage(response));
    }
    return response;
  }

  return menuai.callApi<menuaiioResponse<any>>(
    "POST",
    `menuaiio/addons/${slug}/options`,
    data
  );
};

export const validatemenuaiioAddonOption = async (
  menuai: menuai,
  slug: string,
  data?: any
): Promise<{ message: string; valid: boolean }> => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    return menuai.callWS({
      type: "supervisor/api",
      endpoint: `/addons/${slug}/options/validate`,
      method: "post",
      data,
    });
  }

  return (
    await menuai.callApi<menuaiioResponse<{ message: string; valid: boolean }>>(
      "POST",
      `menuaiio/addons/${slug}/options/validate`
    )
  ).data;
};

export const startmenuaiioAddon = async (menuai: menuai, slug: string) => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    return menuai.callWS({
      type: "supervisor/api",
      endpoint: `/addons/${slug}/start`,
      method: "post",
      timeout: null,
    });
  }

  return menuai.callApi<string>("POST", `menuaiio/addons/${slug}/start`);
};

export const stopmenuaiioAddon = async (menuai: menuai, slug: string) => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    return menuai.callWS({
      type: "supervisor/api",
      endpoint: `/addons/${slug}/stop`,
      method: "post",
      timeout: null,
    });
  }

  return menuai.callApi<string>("POST", `menuaiio/addons/${slug}/stop`);
};

export const setmenuaiioAddonSecurity = async (
  menuai: menuai,
  slug: string,
  data: menuaiioAddonSetSecurityParams
) => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    await menuai.callWS({
      type: "supervisor/api",
      endpoint: `/addons/${slug}/security`,
      method: "post",
      data,
    });
    return;
  }

  await menuai.callApi<menuaiioResponse<void>>(
    "POST",
    `menuaiio/addons/${slug}/security`,
    data
  );
};

export const installmenuaiioAddon = async (
  menuai: menuai,
  slug: string
): Promise<void> => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    await menuai.callWS({
      type: "supervisor/api",
      endpoint: `/addons/${slug}/install`,
      method: "post",
      timeout: null,
    });
    return;
  }

  await menuai.callApi<menuaiioResponse<void>>(
    "POST",
    `menuaiio/addons/${slug}/install`
  );
};

export const updatemenuaiioAddon = async (
  menuai: menuai,
  slug: string,
  backup: boolean
): Promise<void> => {
  if (atLeastVersion(menuai.config.version, 2025, 2, 0)) {
    await menuai.callWS({
      type: "menuaiio/update/addon",
      addon: slug,
      backup: backup,
    });
    return;
  }

  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    await menuai.callWS({
      type: "supervisor/api",
      endpoint: `/store/addons/${slug}/update`,
      method: "post",
      timeout: null,
      data: { backup },
    });
    return;
  }

  await menuai.callApi<menuaiioResponse<void>>(
    "POST",
    `menuaiio/addons/${slug}/update`,
    { backup }
  );
};

export const restartmenuaiioAddon = async (
  menuai: menuai,
  slug: string
): Promise<void> => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    await menuai.callWS({
      type: "supervisor/api",
      endpoint: `/addons/${slug}/restart`,
      method: "post",
      timeout: null,
    });
    return;
  }

  await menuai.callApi<menuaiioResponse<void>>(
    "POST",
    `menuaiio/addons/${slug}/restart`
  );
};

export const uninstallmenuaiioAddon = async (
  menuai: menuai,
  slug: string,
  removeData: boolean
): Promise<void> => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    await menuai.callWS({
      type: "supervisor/api",
      endpoint: `/addons/${slug}/uninstall`,
      method: "post",
      timeout: null,
      data: { remove_config: removeData },
    });
    return;
  }

  await menuai.callApi<menuaiioResponse<void>>(
    "POST",
    `menuaiio/addons/${slug}/uninstall`,
    { remove_config: removeData }
  );
};

export const fetchAddonInfo = (
  menuai: menuai,
  supervisor: Supervisor,
  addonSlug: string
): Promise<menuaiioAddonDetails | StoreAddonDetails> =>
  supervisorApiCall(
    menuai,
    !supervisor.addon?.addons.find((addon) => addon.slug === addonSlug)
      ? `/store/addons/${addonSlug}` // Use /store/addons when add-on is not installed
      : `/addons/${addonSlug}/info` // Use /addons when add-on is installed
  );

export const rebuildLocalAddon = async (
  menuai: menuai,
  slug: string
): Promise<void> => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    return menuai.callWS<undefined>({
      type: "supervisor/api",
      endpoint: `/addons/${slug}/rebuild`,
      method: "post",
      timeout: null,
    });
  }
  return (
    await menuai.callApi<menuaiioResponse<void>>(
      "POST",
      `menuaiio/addons/${slug}rebuild`
    )
  ).data;
};
