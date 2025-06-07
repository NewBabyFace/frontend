import type { PropertyValues } from "lit";
import type { menuaiDomEvent } from "../common/dom/fire_event";
import { makeDialogManager, showDialog } from "../dialogs/make-dialog-manager";
import type { Constructor } from "../types";
import type { menuaiBaseEl } from "./menuai-base-mixin";

interface RegisterDialogParams {
  dialogShowEvent: keyof menuaiDomEvents;
  dialogTag: keyof HTMLElementTagNameMap;
  dialogImport: () => Promise<unknown>;
  addHistory?: boolean;
}

declare global {
  // for fire event
  interface menuaiDomEvents {
    "register-dialog": RegisterDialogParams;
  }
  // for add event listener
  interface HTMLElementEventMap {
    "register-dialog": menuaiDomEvent<RegisterDialogParams>;
  }
}

export const dialogManagerMixin = <T extends Constructor<menuaiBaseEl>>(
  superClass: T
) =>
  class extends superClass {
    protected firstUpdated(changedProps: PropertyValues) {
      super.firstUpdated(changedProps);
      // deprecated
      this.addEventListener("register-dialog", (e) =>
        this.registerDialog(e.detail)
      );
      makeDialogManager(this, this.shadowRoot!);
    }

    protected registerDialog({
      dialogShowEvent,
      dialogTag,
      dialogImport,
      addHistory = true,
    }: RegisterDialogParams) {
      this.addEventListener(dialogShowEvent, (showEv) => {
        showDialog(
          this,
          this.shadowRoot!,
          dialogTag,
          (showEv as menuaiDomEvent<unknown>).detail,
          dialogImport,
          addHistory
        );
      });
    }
  };
