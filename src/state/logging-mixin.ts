import type { menuaiDomEvent } from "../common/dom/fire_event";
import type { SystemLogLevel } from "../data/system_log";
import type { Constructor } from "../types";
import type { menuaiBaseEl } from "./menuai-base-mixin";

interface WriteLogParams {
  level?: SystemLogLevel;
  message: string;
}

declare global {
  // for fire event
  interface menuaiDomEvents {
    write_log: WriteLogParams;
  }
  interface HTMLElementEventMap {
    write_log: menuaiDomEvent<WriteLogParams>;
  }
}

export const loggingMixin = <T extends Constructor<menuaiBaseEl>>(
  superClass: T
) =>
  class extends superClass {
    protected menuaiConnected() {
      super.menuaiConnected();
      window.addEventListener("error", async (ev) => {
        if (!this.menuai?.connected) {
          return;
        }
        if (
          (!__DEV__ &&
            ev.message.includes("ResizeObserver loop limit exceeded")) ||
          ev.message.includes(
            "ResizeObserver loop completed with undelivered notifications"
          )
        ) {
          ev.preventDefault();
          ev.stopImmediatePropagation();
          ev.stopPropagation();
          return;
        }
        try {
          const { createLogMessage } = await import("../resources/log-message");
          const message = await createLogMessage(
            ev.error,
            "Uncaught error",
            // The error object from browsers includes the message and a stack trace,
            // so use the data in the error event just as fallback
            ev.message,
            `@${ev.filename}:${ev.lineno}:${ev.colno}`
          );
          await this._writeLog({ message });
        } catch (e) {
          // catch errors during logging so we don't get into a loop
          // eslint-disable-next-line no-console
          console.error("Failure writing uncaught error to system log:", e);
        }
      });
      window.addEventListener("unhandledrejection", async (ev) => {
        if (!this.menuai?.connected) {
          return;
        }
        try {
          const { createLogMessage } = await import("../resources/log-message");
          const message = await createLogMessage(
            ev.reason,
            "Unhandled promise rejection"
          );
          await this._writeLog({
            message,
            level: "debug",
          });
        } catch (e) {
          // catch errors during logging so we don't get into a loop
          // eslint-disable-next-line no-console
          console.error(
            "Failure writing unhandled promise rejection to system log:",
            e
          );
        }
      });
    }

    protected firstUpdated(changedProps) {
      super.firstUpdated(changedProps);
      this.addEventListener("write_log", (ev) => {
        this._writeLog(ev.detail);
      });
    }

    private _writeLog(log: WriteLogParams) {
      return this.menuai?.callService(
        "system_log",
        "write",
        {
          logger: `frontend.${
            __DEV__ ? "js_dev" : "js"
          }.${__BUILD__}.${__VERSION__.replace(".", "")}`,
          message: log.message,
          level: log.level || "error",
        },
        undefined,
        false
      );
    }
  };
