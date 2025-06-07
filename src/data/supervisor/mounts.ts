import type { menuai } from "../../types";

export enum SupervisorMountType {
  BIND = "bind",
  CIFS = "cifs",
  NFS = "nfs",
}

export enum SupervisorMountUsage {
  BACKUP = "backup",
  MEDIA = "media",
  SHARE = "share",
}

export enum SupervisorMountState {
  ACTIVE = "active",
  FAILED = "failed",
  UNKNOWN = "unknown",
}

interface MountOptions {
  default_backup_mount?: string | null;
}

export type CIFSVersion = "auto" | "1.0" | "2.0";

interface SupervisorMountBase {
  name: string;
  usage: SupervisorMountUsage;
  type: SupervisorMountType;
  server: string;
  port: number;
}

export interface SupervisorMountResponse extends SupervisorMountBase {
  state: SupervisorMountState | null;
}

export interface SupervisorNFSMount extends SupervisorMountResponse {
  type: SupervisorMountType.NFS;
  path: string;
}

export interface SupervisorCIFSMount extends SupervisorMountResponse {
  type: SupervisorMountType.CIFS;
  share: string;
  version?: CIFSVersion;
}

export type SupervisorMount = SupervisorNFSMount | SupervisorCIFSMount;

export type SupervisorNFSMountRequestParams = SupervisorNFSMount;

export interface SupervisorCIFSMountRequestParams extends SupervisorCIFSMount {
  username?: string;
  password?: string;
  version?: CIFSVersion;
}

export type SupervisorMountRequestParams =
  | SupervisorNFSMountRequestParams
  | SupervisorCIFSMountRequestParams;

export interface SupervisorMounts {
  default_backup_mount: string | null;
  mounts: SupervisorMount[];
}

export const fetchSupervisorMounts = async (
  menuai: menuai
): Promise<SupervisorMounts> =>
  menuai.callWS({
    type: "supervisor/api",
    endpoint: `/mounts`,
    method: "get",
    timeout: null,
  });

export const createSupervisorMount = async (
  menuai: menuai,
  data: SupervisorMountRequestParams
): Promise<void> =>
  menuai.callWS({
    type: "supervisor/api",
    endpoint: `/mounts`,
    method: "post",
    timeout: null,
    data,
  });

export const updateSupervisorMount = async (
  menuai: menuai,
  data: Partial<SupervisorMountRequestParams>
): Promise<void> =>
  menuai.callWS({
    type: "supervisor/api",
    endpoint: `/mounts/${data.name}`,
    method: "put",
    timeout: null,
    data,
  });

export const removeSupervisorMount = async (
  menuai: menuai,
  name: string
): Promise<void> =>
  menuai.callWS({
    type: "supervisor/api",
    endpoint: `/mounts/${name}`,
    method: "delete",
    timeout: null,
  });

export const reloadSupervisorMount = async (
  menuai: menuai,
  data: SupervisorMount
): Promise<void> =>
  menuai.callWS({
    type: "supervisor/api",
    endpoint: `/mounts/${data.name}/reload`,
    method: "post",
    timeout: null,
  });

export const changeMountOptions = async (
  menuai: menuai,
  data: MountOptions
): Promise<void> =>
  menuai.callWS({
    type: "supervisor/api",
    endpoint: `/mounts/options`,
    method: "post",
    timeout: null,
    data,
  });
