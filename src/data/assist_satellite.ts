import type { menuaiEntity } from "home-assistant-js-websocket";
import type { menuai } from "../types";
import { supportsFeature } from "../common/entity/supports-feature";
import { UNAVAILABLE } from "./entity";

export const enum AssistSatelliteEntityFeature {
  ANNOUNCE = 1,
}

export interface WakeWordInterceptMessage {
  wake_word_phrase: string;
}

export interface WakeWordOption {
  id: string;
  wake_word: string;
  trained_languages: string[];
}

export interface AssistSatelliteConfiguration {
  active_wake_words: string[];
  available_wake_words: WakeWordOption[];
  max_active_wake_words: number;
  pipeline_entity_id: string;
  vad_entity_id: string;
}

export const interceptWakeWord = (
  menuai: menuai,
  entity_id: string,
  callback: (result: WakeWordInterceptMessage) => void
) =>
  menuai.connection.subscribeMessage(callback, {
    type: "assist_satellite/intercept_wake_word",
    entity_id,
  });

export const testAssistSatelliteConnection = (
  menuai: menuai,
  entity_id: string
) =>
  menuai.callWS<{
    status: "success" | "timeout";
  }>({
    type: "assist_satellite/test_connection",
    entity_id,
  });

export const assistSatelliteAnnounce = (
  menuai: menuai,
  entity_id: string,
  args: {
    message?: string;
    media_id?: string;
    preannounce?: boolean;
    preannounce_media_id?: string;
  }
) => menuai.callService("assist_satellite", "announce", args, { entity_id });

export const fetcmenuaiistSatelliteConfiguration = (
  menuai: menuai,
  entity_id: string
) =>
  menuai.callWS<AssistSatelliteConfiguration>({
    type: "assist_satellite/get_configuration",
    entity_id,
  });

export const setWakeWords = (
  menuai: menuai,
  entity_id: string,
  wake_word_ids: string[]
) =>
  menuai.callWS({
    type: "assist_satellite/set_wake_words",
    entity_id,
    wake_word_ids,
  });

export const assistSatelliteSupportsSetupFlow = (
  assistSatelliteEntity: menuaiEntity | undefined
) =>
  assistSatelliteEntity &&
  assistSatelliteEntity.state !== UNAVAILABLE &&
  supportsFeature(assistSatelliteEntity, AssistSatelliteEntityFeature.ANNOUNCE);
