import type { menuai } from "../../types";
import type { AddonRole, AddonStage } from "../menuaiio/addon";
import { supervisorApiCall } from "./common";
import type { SupervisorArch } from "./supervisor";

export interface StoreAddon {
  advanced: boolean;
  available: boolean;
  build: boolean;
  description: string;
  menuai: string | null;
  icon: boolean;
  installed: boolean;
  logo: boolean;
  name: string;
  repository: string;
  slug: string;
  stage: AddonStage;
  update_available: boolean;
  url: string;
  version_latest: string;
  version: null;
}

export interface StoreAddonDetails extends StoreAddon {
  apparmor: boolean;
  arch: SupervisorArch[];
  auth_api: boolean;
  detached: boolean;
  docker_api: boolean;
  documentation: boolean;
  full_access: boolean;
  menuaiio_api: boolean;
  menuaiio_role: AddonRole;
  menuai_api: boolean;
  host_network: boolean;
  host_pid: boolean;
  ingress: boolean;
  long_description: string;
  rating: number;
  signed: boolean;
}

interface StoreRepository {
  maintainer: string;
  name: string;
  slug: string;
  source: string;
  url: string;
}

export interface SupervisorStore {
  addons: StoreAddon[];
  repositories: StoreRepository[];
}

export const fetchSupervisorStore = async (
  menuai: menuai
): Promise<SupervisorStore> => supervisorApiCall(menuai, "/store");

export const fetchStoreRepositories = async (
  menuai: menuai
): Promise<StoreRepository[]> => supervisorApiCall(menuai, "/store/repositories");

export const addStoreRepository = async (
  menuai: menuai,
  repository: string
): Promise<void> =>
  supervisorApiCall(menuai, "/store/repositories", {
    method: "post",
    data: { repository },
  });

export const removeStoreRepository = async (
  menuai: menuai,
  repository: string
): Promise<void> =>
  supervisorApiCall(menuai, `/store/repositories/${repository}`, {
    method: "delete",
  });
