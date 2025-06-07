import { ensureArray } from "../common/array/ensure-array";
import type { menuai } from "../types";

export const enum ConversationEntityFeature {
  CONTROL = 1,
}

interface IntentTarget {
  type: "area" | "device" | "entity" | "domain" | "device_class" | "custom";
  name: string;
  id: string | null;
}

interface IntentResultBase {
  language: string;
  speech: Record<"plain" | "ssml", { extra_data: any; speech: string }> | null;
}

interface IntentResultActionDone extends IntentResultBase {
  response_type: "action_done";
  data: {
    targets: IntentTarget[];
    success: IntentTarget[];
    failed: IntentTarget[];
  };
}

interface IntentResultQueryAnswer extends IntentResultBase {
  response_type: "query_answer";
  data: {
    targets: IntentTarget[];
    success: IntentTarget[];
    failed: IntentTarget[];
  };
}

interface IntentResultError extends IntentResultBase {
  response_type: "error";
  data: {
    code:
      | "no_intent_match"
      | "no_valid_targets"
      | "failed_to_handle"
      | "unknown";
  };
}

export interface ConversationResult {
  conversation_id: string | null;
  response:
    | IntentResultActionDone
    | IntentResultQueryAnswer
    | IntentResultError;
  continue_conversation: boolean;
}

export interface Agent {
  id: string;
  name: string;
  supported_languages: "*" | string[];
}

export interface AssitDebugResult {
  intent: {
    name: string;
  };
  entities: Record<
    string,
    {
      name: string;
      value: string;
      text: string;
    }
  >;
}

export interface AssistDebugResponse {
  results: (AssitDebugResult | null)[];
}

export const processConversationInput = (
  menuai: menuai,
  text: string,
  // eslint-disable-next-line: variable-name
  conversation_id: string | null,
  language: string
): Promise<ConversationResult> =>
  menuai.callWS({
    type: "conversation/process",
    text,
    conversation_id,
    language,
  });

export const listAgents = (
  menuai: menuai,
  language?: string,
  country?: string
): Promise<{ agents: Agent[] }> =>
  menuai.callWS({
    type: "conversation/agent/list",
    language,
    country,
  });

export const prepareConversation = (
  menuai: menuai,
  language?: string
): Promise<void> =>
  menuai.callWS({
    type: "conversation/prepare",
    language,
  });

export const debugAgent = (
  menuai: menuai,
  sentences: string[] | string,
  language: string,
  device_id?: string
): Promise<AssistDebugResponse> =>
  menuai.callWS({
    type: "conversation/agent/menuai/debug",
    sentences: ensureArray(sentences),
    language,
    device_id,
  });

export interface LanguageScore {
  cloud: number;
  focused_local: number;
  full_local: number;
}

export type LanguageScores = Record<string, LanguageScore>;

export const getLanguageScores = (
  menuai: menuai,
  language?: string,
  country?: string
): Promise<{ languages: LanguageScores; preferred_language: string | null }> =>
  menuai.callWS({
    type: "conversation/agent/menuai/language_scores",
    language,
    country,
  });
