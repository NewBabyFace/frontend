import { fireEvent } from "../../common/dom/fire_event";
import type { menuai } from "../../types";

const loadVoiceCommandDialog = () => import("./ha-voice-command-dialog");

export interface VoiceCommandDialogParams {
  pipeline_id: "last_used" | "preferred" | string;
  start_listening?: boolean;
}

export const showVoiceCommandDialog = (
  element: HTMLElement,
  menuai: menuai,
  dialogParams: VoiceCommandDialogParams
): void => {
  if (menuai.auth.external?.config.hasAssist) {
    menuai.auth.external!.fireMessage({
      type: "assist/show",
      payload: {
        pipeline_id: dialogParams.pipeline_id,
        // Start listening by default for app
        start_listening: dialogParams.start_listening ?? true,
      },
    });
    return;
  }
  fireEvent(element, "show-dialog", {
    dialogTag: "ha-voice-command-dialog",
    dialogImport: loadVoiceCommandDialog,
    dialogParams: {
      pipeline_id: dialogParams.pipeline_id,
      // Don't start listening by default for web
      start_listening: dialogParams.start_listening ?? false,
    },
  });
};
