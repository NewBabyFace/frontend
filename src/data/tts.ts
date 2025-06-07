import type { menuai } from "../types";

export interface TTSEngine {
  engine_id: string;
  supported_languages?: string[];
  name?: string;
  deprecated: boolean;
}

export interface TTSVoice {
  voice_id: string;
  name: string;
}

export const convertTextToSpeech = (
  menuai: menuai,
  data: {
    platform: string;
    message: string;
    cache?: boolean;
    language?: string;
    options?: Record<string, unknown>;
  }
) => menuai.callApi<{ url: string; path: string }>("POST", "tts_get_url", data);

const TTS_MEDIA_SOURCE_PREFIX = "media-source://tts/";

export const isTTSMediaSource = (mediaContentId: string) =>
  mediaContentId.startsWith(TTS_MEDIA_SOURCE_PREFIX);

export const getProviderFromTTSMediaSource = (mediaContentId: string) =>
  mediaContentId.substring(TTS_MEDIA_SOURCE_PREFIX.length);

export const listTTSEngines = (
  menuai: menuai,
  language?: string,
  country?: string
): Promise<{ providers: TTSEngine[] }> =>
  menuai.callWS({
    type: "tts/engine/list",
    language,
    country,
  });

export const getTTSEngine = (
  menuai: menuai,
  engine_id: string
): Promise<{ provider: TTSEngine }> =>
  menuai.callWS({
    type: "tts/engine/get",
    engine_id,
  });

export const listTTSVoices = (
  menuai: menuai,
  engine_id: string,
  language: string
): Promise<{ voices: TTSVoice[] | null }> =>
  menuai.callWS({
    type: "tts/engine/voices",
    engine_id,
    language,
  });
