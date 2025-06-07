import type { Constructor } from "../types";
import type { menuaiBaseEl } from "./menuai-base-mixin";

export default <T extends Constructor<menuaiBaseEl>>(superClass: T) =>
  class extends superClass {
    protected firstUpdated(changedProps) {
      super.firstUpdated(changedProps);
      // @ts-ignore
      this.registerDialog({
        dialogShowEvent: "menuai-notification",
        dialogTag: "notification-manager",
        dialogImport: () => import("../managers/notification-manager"),
        addHistory: false,
      });
    }
  };
