import type { menuai } from "../types";

export interface AlexaEntity {
  entity_id: string;
  display_categories: string[];
  interfaces: string[];
}

export const fetchCloudAlexaEntities = (menuai: menuai) =>
  menuai.callWS<AlexaEntity[]>({ type: "cloud/alexa/entities" });

export const fetchCloudAlexaEntity = (menuai: menuai, entity_id: string) =>
  menuai.callWS<AlexaEntity>({
    type: "cloud/alexa/entities/get",
    entity_id,
  });

export const syncCloudAlexaEntities = (menuai: menuai) =>
  menuai.callWS({ type: "cloud/alexa/sync" });
