import type { menuai } from "../types";

export interface WakeWord {
  id: string;
  name: string;
}

export const fetchWakeWordInfo = (menuai: menuai, entity_id: string) =>
  menuai.callWS<{ wake_words: WakeWord[] }>({
    type: "wake_word/info",
    entity_id,
  });
