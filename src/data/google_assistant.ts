import type { menuai } from "../types";

export interface GoogleEntity {
  entity_id: string;
  traits: string[];
  might_2fa: boolean;
  disable_2fa?: boolean;
}

export const fetchCloudGoogleEntities = (menuai: menuai) =>
  menuai.callWS<GoogleEntity[]>({ type: "cloud/google_assistant/entities" });

export const fetchCloudGoogleEntity = (
  menuai: menuai,
  entity_id: string
) =>
  menuai.callWS<GoogleEntity>({
    type: "cloud/google_assistant/entities/get",
    entity_id,
  });

export const syncCloudGoogleEntities = (menuai: menuai) =>
  menuai.callApi("POST", "cloud/google_actions/sync");
