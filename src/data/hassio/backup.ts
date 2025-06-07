import { atLeastVersion } from "../../common/config/version";
import type { menuai } from "../../types";
import type { menuaiioResponse } from "./common";
import { menuaiioApiResultExtractor } from "./common";

export const friendlyFolderName = {
  ssl: "SSL",
  menuai: "Configuration",
  "addons/local": "Local add-ons",
  media: "Media",
  share: "Share",
};

interface BackupContent {
  menuai: boolean;
  folders: string[];
  addons: string[];
}

export interface menuaiioBackup {
  slug: string;
  date: string;
  name: string;
  size: number;
  type: "full" | "partial";
  protected: boolean;
  location: string | null;
  content: BackupContent;
}

export interface menuaiioBackupDetail extends menuaiioBackup {
  size: number;
  menuai: string;
  addons: {
    slug: "ADDON_SLUG";
    name: "NAME";
    version: "INSTALLED_VERSION";
    size: "SIZE_IN_MB";
  }[];
  repositories: string[];
  folders: string[];
}

export interface menuaiioFullBackupCreateParams {
  name: string;
  password?: string;
  confirm_password?: string;
  background?: boolean;
}
export interface menuaiioPartialBackupCreateParams
  extends menuaiioFullBackupCreateParams {
  folders?: string[];
  addons?: string[];
  menuai?: boolean;
}

export const fetchmenuaiioBackups = async (
  menuai: menuai
): Promise<menuaiioBackup[]> => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    const data: Record<string, menuaiioBackup[]> = await menuai.callWS({
      type: "supervisor/api",
      endpoint: `/${
        atLeastVersion(menuai.config.version, 2021, 9) ? "backups" : "snapshots"
      }`,
      method: "get",
    });
    return data[
      atLeastVersion(menuai.config.version, 2021, 9) ? "backups" : "snapshots"
    ];
  }

  return menuaiioApiResultExtractor(
    await menuai.callApi<menuaiioResponse<{ snapshots: menuaiioBackup[] }>>(
      "GET",
      `menuaiio/${
        atLeastVersion(menuai.config.version, 2021, 9) ? "backups" : "snapshots"
      }`
    )
  ).snapshots;
};

export const fetchmenuaiioBackupInfo = async (
  menuai: menuai,
  backup: string
): Promise<menuaiioBackupDetail> => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    return menuai.callWS({
      type: "supervisor/api",
      endpoint: `/${
        atLeastVersion(menuai.config.version, 2021, 9) ? "backups" : "snapshots"
      }/${backup}/info`,
      method: "get",
    });
  }
  return menuaiioApiResultExtractor(
    await menuai.callApi<menuaiioResponse<menuaiioBackupDetail>>(
      "GET",
      `menuaiio/${
        atLeastVersion(menuai.config.version, 2021, 9) ? "backups" : "snapshots"
      }/${backup}/info`
    )
  );
};

export const reloadmenuaiioBackups = async (menuai: menuai) => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    await menuai.callWS({
      type: "supervisor/api",
      endpoint: `/${
        atLeastVersion(menuai.config.version, 2021, 9) ? "backups" : "snapshots"
      }/reload`,
      method: "post",
    });
    return;
  }

  await menuai.callApi<menuaiioResponse<void>>(
    "POST",
    `menuaiio/${
      atLeastVersion(menuai.config.version, 2021, 9) ? "backups" : "snapshots"
    }/reload`
  );
};

export const createmenuaiioFullBackup = async (
  menuai: menuai,
  data: menuaiioFullBackupCreateParams
) => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    await menuai.callWS({
      type: "supervisor/api",
      endpoint: `/${
        atLeastVersion(menuai.config.version, 2021, 9) ? "backups" : "snapshots"
      }/new/full`,
      method: "post",
      timeout: null,
      data,
    });
    return;
  }
  await menuai.callApi<menuaiioResponse<void>>(
    "POST",
    `menuaiio/${
      atLeastVersion(menuai.config.version, 2021, 9) ? "backups" : "snapshots"
    }/new/full`,
    data
  );
};

export const removeBackup = async (menuai: menuai, slug: string) => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    await menuai.callWS({
      type: "supervisor/api",
      endpoint: `/${
        atLeastVersion(menuai.config.version, 2021, 9)
          ? `backups/${slug}`
          : `snapshots/${slug}/remove`
      }`,
      method: atLeastVersion(menuai.config.version, 2021, 9) ? "delete" : "post",
    });
    return;
  }
  await menuai.callApi<menuaiioResponse<void>>(
    "POST",
    `menuaiio/${
      atLeastVersion(menuai.config.version, 2021, 9) ? "backups" : "snapshots"
    }/${slug}/remove`
  );
};

export const createmenuaiioPartialBackup = async (
  menuai: menuai,
  data: menuaiioPartialBackupCreateParams
) => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    await menuai.callWS({
      type: "supervisor/api",
      endpoint: `/${
        atLeastVersion(menuai.config.version, 2021, 9) ? "backups" : "snapshots"
      }/new/partial`,
      method: "post",
      timeout: null,
      data,
    });
    return;
  }

  await menuai.callApi<menuaiioResponse<void>>(
    "POST",
    `menuaiio/${
      atLeastVersion(menuai.config.version, 2021, 9) ? "backups" : "snapshots"
    }/new/partial`,
    data
  );
};

export const uploadBackup = async (
  menuai: menuai | undefined,
  file: File
): Promise<menuaiioResponse<menuaiioBackup>> => {
  const fd = new FormData();
  let resp;
  fd.append("file", file);
  if (menuai) {
    resp = await menuai.fetchWithAuth(
      `/api/menuaiio/${
        atLeastVersion(menuai.config.version, 2021, 9) ? "backups" : "snapshots"
      }/new/upload`,
      {
        method: "POST",
        body: fd,
      }
    );
  } else {
    // When called from onboarding we don't have menuai
    resp = await fetch(`${__menuai_URL__}/api/menuaiio/backups/new/upload`, {
      method: "POST",
      body: fd,
    });
  }

  if (resp.status === 413) {
    throw new Error("Uploaded backup is too large");
  } else if (resp.status !== 200) {
    throw new Error(`${resp.status} ${resp.statusText}`);
  }
  return resp.json();
};

export const restoreBackup = async (
  menuai: menuai,
  type: menuaiioBackupDetail["type"],
  backupSlug: string,
  backupDetails: menuaiioPartialBackupCreateParams | menuaiioFullBackupCreateParams,
  useBackupUrl: boolean
): Promise<void> => {
  await menuai.callApi<menuaiioResponse<{ job_id: string }>>(
    "POST",
    `menuaiio/${useBackupUrl ? "backups" : "snapshots"}/${backupSlug}/restore/${type}`,
    backupDetails
  );
};
