import type { menuai } from "../types";

export const voiceAssistants = {
  conversation: { domain: "assist_pipeline", name: "Assist" },
  "cloud.alexa": {
    domain: "alexa",
    name: "Amazon Alexa",
  },
  "cloud.google_assistant": {
    domain: "google_assistant",
    name: "Google Assistant",
  },
} as const;

export interface ExposeEntitySettings {
  conversation?: boolean;
  "cloud.alexa"?: boolean;
  "cloud.google_assistant"?: boolean;
}

export const setExposeNewEntities = (
  menuai: menuai,
  assistant: string,
  expose_new: boolean
) =>
  menuai.callWS({
    type: "menuai/expose_new_entities/set",
    assistant,
    expose_new,
  });

export const getExposeNewEntities = (menuai: menuai, assistant: string) =>
  menuai.callWS<{ expose_new: boolean }>({
    type: "menuai/expose_new_entities/get",
    assistant,
  });

export const exposeEntities = (
  menuai: menuai,
  assistants: string[],
  entity_ids: string[],
  should_expose: boolean
) =>
  menuai.callWS({
    type: "menuai/expose_entity",
    assistants,
    entity_ids,
    should_expose,
  });

export const listExposedEntities = (menuai: menuai) =>
  menuai.callWS<{ exposed_entities: Record<string, ExposeEntitySettings> }>({
    type: "menuai/expose_entity/list",
  });
