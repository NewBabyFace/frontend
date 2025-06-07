import { memoize } from "@fullcalendar/core/internal";
import { setHours, setMinutes } from "date-fns";
import type { menuaiConfig } from "home-assistant-js-websocket";
import memoizeOne from "memoize-one";
import checkValidDate from "../common/datetime/check_valid_date";
import {
  formatDateTime,
  formatDateTimeNumeric,
} from "../common/datetime/format_date_time";
import { formatTime } from "../common/datetime/format_time";
import type { LocalizeFunc } from "../common/translations/localize";
import type { menuai } from "../types";
import { fileDownload } from "../util/file_download";
import { handleFetchPromise } from "../util/menuai-call-api";
import type { BackupManagerState, ManagerStateEvent } from "./backup_manager";
import { domainToName } from "./integration";
import type { FrontendLocaleData } from "./translation";

export const enum BackupScheduleRecurrence {
  NEVER = "never",
  DAILY = "daily",
  CUSTOM_DAYS = "custom_days",
}

export type BackupDay = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export const BACKUP_DAYS: BackupDay[] = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
];

export const sortWeekdays = (weekdays) =>
  weekdays.sort((a, b) => BACKUP_DAYS.indexOf(a) - BACKUP_DAYS.indexOf(b));

export interface Retention {
  copies?: number | null;
  days?: number | null;
}

export interface BackupConfig {
  automatic_backups_configured: boolean;
  last_attempted_automatic_backup: string | null;
  last_completed_automatic_backup: string | null;
  next_automatic_backup: string | null;
  next_automatic_backup_additional?: boolean;
  create_backup: {
    agent_ids: string[];
    include_addons: string[] | null;
    include_all_addons: boolean;
    include_database: boolean;
    include_folders: string[] | null;
    name: string | null;
    password: string | null;
  };
  retention: Retention;
  schedule: {
    recurrence: BackupScheduleRecurrence;
    time?: string | null;
    days: BackupDay[];
  };
  agents: BackupAgentsConfig;
}

export interface BackupMutableConfig {
  automatic_backups_configured?: boolean;
  create_backup?: {
    agent_ids?: string[];
    include_addons?: string[];
    include_all_addons?: boolean;
    include_database?: boolean;
    include_folders?: string[];
    name?: string | null;
    password?: string | null;
  };
  retention?: Retention;
  schedule?: {
    recurrence: BackupScheduleRecurrence;
    time?: string | null;
    days?: BackupDay[] | null;
  };
  agents?: BackupAgentsConfig;
}

export type BackupAgentsConfig = Record<string, BackupAgentConfig>;

export interface BackupAgentConfig {
  protected?: boolean;
  retention?: Retention | null;
}

export interface BackupAgent {
  agent_id: string;
  name: string;
}

export interface BackupContentAgent {
  size: number;
  protected: boolean;
}

export interface AddonInfo {
  name: string | null;
  slug: string;
  version: string | null;
}

export interface BackupContent {
  backup_id: string;
  date: string;
  name: string;
  agents: Record<string, BackupContentAgent>;
  failed_agent_ids?: string[];
  failed_addons?: AddonInfo[];
  failed_folders?: string[];
  extra_metadata?: {
    "supervisor.addon_update"?: string;
  };
  with_automatic_settings: boolean;
}

export interface BackupData {
  addons: BackupAddon[];
  database_included: boolean;
  folders: string[];
  menuai_version: string;
  menuai_included: boolean;
}

export interface BackupAddon {
  name: string;
  slug: string;
  version: string;
}

export interface BackupContentExtended extends BackupContent, BackupData {}

export interface BackupInfo {
  backups: BackupContent[];
  agent_errors: Record<string, string>;
  last_attempted_automatic_backup: string | null;
  last_completed_automatic_backup: string | null;
  last_action_event: ManagerStateEvent | null;
  next_automatic_backup: string | null;
  next_automatic_backup_additional: boolean;
  state: BackupManagerState;
}

export interface BackupDetails {
  backup: BackupContentExtended;
}

export interface BackupAgentsInfo {
  agents: BackupAgent[];
}

export interface GenerateBackupParams {
  agent_ids: string[];
  include_addons?: string[];
  include_all_addons?: boolean;
  include_database?: boolean;
  include_folders?: string[];
  include_menuai?: boolean;
  name?: string;
  password?: string;
}

export interface RestoreBackupParams {
  backup_id: string;
  agent_id: string;
  password?: string;
  restore_addons?: string[];
  restore_database?: boolean;
  restore_folders?: string[];
  restore_menuai?: boolean;
}

export const fetchBackupConfig = (menuai: menuai) =>
  menuai.callWS<{ config: BackupConfig }>({ type: "backup/config/info" });

export const updateBackupConfig = (
  menuai: menuai,
  config: BackupMutableConfig
) => menuai.callWS({ type: "backup/config/update", ...config });

export const getBackupDownloadUrl = (
  id: string,
  agentId: string,
  password?: string | null
) =>
  `/api/backup/download/${id}?agent_id=${agentId}${password ? `&password=${password}` : ""}`;

export const fetchBackupInfo = (menuai: menuai): Promise<BackupInfo> =>
  menuai.callWS({
    type: "backup/info",
  });

export const fetchBackupDetails = (
  menuai: menuai,
  id: string
): Promise<BackupDetails> =>
  menuai.callWS({
    type: "backup/details",
    backup_id: id,
  });

export const fetchBackupAgentsInfo = (
  menuai: menuai
): Promise<BackupAgentsInfo> =>
  menuai.callWS({
    type: "backup/agents/info",
  });

export const deleteBackup = (menuai: menuai, id: string): Promise<void> =>
  menuai.callWS({
    type: "backup/delete",
    backup_id: id,
  });

export const generateBackup = (
  menuai: menuai,
  params: GenerateBackupParams
): Promise<{ backup_id: string }> =>
  menuai.callWS({
    type: "backup/generate",
    ...params,
  });

export const generateBackupWithAutomaticSettings = (
  menuai: menuai
): Promise<void> =>
  menuai.callWS({
    type: "backup/generate_with_automatic_settings",
  });

export const restoreBackup = (
  menuai: menuai,
  params: RestoreBackupParams
): Promise<{ backup_id: string }> =>
  menuai.callWS({
    type: "backup/restore",
    ...params,
  });

export const uploadBackup = async (
  menuai: menuai,
  file: File,
  agentIds: string[]
): Promise<{ backup_id: string }> => {
  const fd = new FormData();
  fd.append("file", file);

  const params = new URLSearchParams();

  agentIds.forEach((agentId) => {
    params.append("agent_id", agentId);
  });

  return handleFetchPromise(
    menuai.fetchWithAuth(`/api/backup/upload?${params.toString()}`, {
      method: "POST",
      body: fd,
    })
  );
};

export const getPreferredAgentForDownload = (agents: string[]) => {
  const localAgent = agents.find(isLocalAgent);
  if (localAgent) {
    return localAgent;
  }
  const networkMountAgent = agents.find(isNetworkMountAgent);
  if (networkMountAgent) {
    return networkMountAgent;
  }

  return agents[0];
};

export const canDecryptBackupOnDownload = (
  menuai: menuai,
  backup_id: string,
  agent_id: string,
  password: string
) =>
  menuai.callWS({
    type: "backup/can_decrypt_on_download",
    backup_id,
    agent_id,
    password,
  });

export const CORE_LOCAL_AGENT = "backup.local";
export const menuaiIO_LOCAL_AGENT = "menuaiio.local";
export const CLOUD_AGENT = "cloud.cloud";

export const isLocalAgent = (agentId: string) =>
  [CORE_LOCAL_AGENT, menuaiIO_LOCAL_AGENT].includes(agentId);

export const isNetworkMountAgent = (agentId: string) => {
  const [domain, name] = agentId.split(".");
  return domain === "menuaiio" && name !== "local";
};

export const computeBackupAgentName = (
  localize: LocalizeFunc,
  agentId: string,
  agents: BackupAgent[]
) => {
  if (isLocalAgent(agentId)) {
    return localize("ui.panel.config.backup.agents.local_agent");
  }

  const agent = agents.find((a) => a.agent_id === agentId);

  const domain = agentId.split(".")[0];
  const name = agent ? agent.name : agentId.split(".")[1];

  // If it's a network mount agent, only show the name
  if (isNetworkMountAgent(agentId)) {
    return name;
  }

  const domainName = domainToName(localize, domain);

  // If there are multiple agents for a domain, show the name
  const showName =
    agents.filter((a) => a.agent_id.split(".")[0] === domain).length > 1;

  return showName ? `${domainName}: ${name}` : domainName;
};

export const computeBackupSize = (backup: BackupContent) =>
  Math.max(...Object.values(backup.agents).map((agent) => agent.size));

export type BackupType = "automatic" | "manual" | "addon_update";

const BACKUP_TYPE_ORDER: BackupType[] = ["automatic", "manual", "addon_update"];

export const getBackupTypes = memoize((ismenuaiio: boolean) =>
  ismenuaiio
    ? BACKUP_TYPE_ORDER
    : BACKUP_TYPE_ORDER.filter((type) => type !== "addon_update")
);

export const computeBackupType = (
  backup: BackupContent,
  ismenuaiio: boolean
): BackupType => {
  if (backup.with_automatic_settings) {
    return "automatic";
  }
  if (ismenuaiio && backup.extra_metadata?.["supervisor.addon_update"] != null) {
    return "addon_update";
  }
  return "manual";
};

export const compareAgents = (a: string, b: string) => {
  const isLocalA = isLocalAgent(a);
  const isLocalB = isLocalAgent(b);
  const isNetworkMountAgentA = isNetworkMountAgent(a);
  const isNetworkMountAgentB = isNetworkMountAgent(b);

  const getPriority = (isLocal: boolean, isNetworkMount: boolean) => {
    if (isLocal) return 1;
    if (isNetworkMount) return 2;
    return 3;
  };

  const priorityA = getPriority(isLocalA, isNetworkMountAgentA);
  const priorityB = getPriority(isLocalB, isNetworkMountAgentB);

  if (priorityA !== priorityB) {
    return priorityA - priorityB;
  }

  return a.localeCompare(b);
};

export const generateEncryptionKey = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const pattern = "xxxx-xxxx-xxxx-xxxx-xxxx-xxxx-xxxx";
  let result = "";
  const randomArray = new Uint8Array(pattern.length);
  crypto.getRandomValues(randomArray);
  randomArray.forEach((number, index) => {
    result += pattern[index] === "-" ? "-" : chars[number % chars.length];
  });
  return result;
};

export const generateEmergencyKit = (
  menuai: menuai,
  encryptionKey: string
) =>
  "data:text/plain;charset=utf-8," +
  encodeURIComponent(`${menuai.localize("ui.panel.config.backup.emergency_kit_file.title")}

${menuai.localize("ui.panel.config.backup.emergency_kit_file.description")}

${menuai.localize("ui.panel.config.backup.emergency_kit_file.date")} ${formatDateTime(new Date(), menuai.locale, menuai.config)}

${menuai.localize("ui.panel.config.backup.emergency_kit_file.instance")}
${menuai.config.location_name}

${menuai.localize("ui.panel.config.backup.emergency_kit_file.url")}
${menuai.auth.data.menuaiUrl}

${menuai.localize("ui.panel.config.backup.emergency_kit_file.encryption_key")}
${encryptionKey}

${menuai.localize("ui.panel.config.backup.emergency_kit_file.more_info", { link: "https://www.home-assistant.io/more-info/backup-emergency-kit" })}`);

export const geneateEmergencyKitFileName = (
  menuai: menuai,
  append?: string
) =>
  `home_assistant_backup_emergency_kit_${append ? `${append}_` : ""}${formatDateTimeNumeric(new Date(), menuai.locale, menuai.config).replace(",", "").replace(" ", "_")}.txt`;

export const downloadEmergencyKit = (
  menuai: menuai,
  key: string,
  appendFileName?: string
) =>
  fileDownload(
    generateEmergencyKit(menuai, key),
    geneateEmergencyKitFileName(menuai, appendFileName)
  );

export const DEFAULT_OPTIMIZED_BACKUP_START_TIME = setMinutes(
  setHours(new Date(), 4),
  45
);

export const DEFAULT_OPTIMIZED_BACKUP_END_TIME = setMinutes(
  setHours(new Date(), 5),
  45
);

export const getFormattedBackupTime = memoizeOne(
  (
    locale: FrontendLocaleData,
    config: menuaiConfig,
    backupTime?: Date | string | null
  ) => {
    if (checkValidDate(backupTime as Date)) {
      return formatTime(backupTime as Date, locale, config);
    }
    if (typeof backupTime === "string" && backupTime) {
      const splitted = backupTime.split(":");
      const date = setMinutes(
        setHours(new Date(), parseInt(splitted[0])),
        parseInt(splitted[1])
      );
      return formatTime(date, locale, config);
    }

    return `${formatTime(DEFAULT_OPTIMIZED_BACKUP_START_TIME, locale, config)} - ${formatTime(DEFAULT_OPTIMIZED_BACKUP_END_TIME, locale, config)}`;
  }
);

export const SUPPORTED_UPLOAD_FORMAT = "application/x-tar";

export interface BackupUploadFileFormData {
  file?: File;
}

export const INITIAL_UPLOAD_FORM_DATA: BackupUploadFileFormData = {
  file: undefined,
};
