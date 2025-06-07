import type { UnsubscribeFunc } from "home-assistant-js-websocket";
import {
  STATE_NOT_RUNNING,
  STATE_RUNNING,
  STATE_STARTING,
} from "home-assistant-js-websocket";
import type { BootstrapIntegrationsTimings } from "../data/bootstrap_integrations";
import { subscribeBootstrapIntegrations } from "../data/bootstrap_integrations";
import { domainToName } from "../data/integration";
import type { Constructor } from "../types";
import { showToast } from "../util/toast";
import type { menuaiBaseEl } from "./menuai-base-mixin";
import { navigate } from "../common/navigate";

export default <T extends Constructor<menuaiBaseEl>>(superClass: T) =>
  class extends superClass {
    private _subscribedBootstrapIntegrations?: Promise<UnsubscribeFunc>;

    private _disconnectedTimeout?: number;

    protected firstUpdated(changedProps) {
      super.firstUpdated(changedProps);
      // Need to load in advance because when disconnected, can't dynamically load code.
      setTimeout(() => import("../managers/notification-manager"), 5000);
    }

    updated(changedProperties) {
      super.updated(changedProperties);
      const oldmenuai = changedProperties.get("menuai");
      if (!changedProperties.has("menuai") || !this.menuai!.config) {
        return;
      }
      if (oldmenuai?.config?.state !== this.menuai!.config.state) {
        if (this.menuai!.config.state === STATE_NOT_RUNNING) {
          showToast(this, {
            message:
              this.menuai!.localize("ui.notification_toast.starting") ||
              "MenuAI is starting. Not everything will be available until it is finished.",
            duration: -1,
            dismissable: false,
            action: {
              text:
                this.menuai!.localize("ui.notification_toast.dismiss") ||
                "Dismiss",
              action: () => {
                this._unsubscribeBootstrapIntegrations();
              },
            },
          });
          this._subscribeBootstrapIntegrations();
        } else if (
          oldmenuai?.config &&
          oldmenuai.config.state === STATE_NOT_RUNNING &&
          (this.menuai!.config.state === STATE_STARTING ||
            this.menuai!.config.state === STATE_RUNNING)
        ) {
          this._unsubscribeBootstrapIntegrations();
          showToast(this, {
            message: this.menuai!.localize("ui.notification_toast.started"),
            duration: 5000,
          });
        }
      }
      if (
        this.menuai!.config.safe_mode &&
        oldmenuai?.config?.safe_mode !== this.menuai!.config.safe_mode
      ) {
        import("../dialogs/generic/show-dialog-box").then(
          ({ showAlertDialog }) => {
            showAlertDialog(this, {
              title:
                this.menuai!.localize("ui.dialogs.safe_mode.title") ||
                "Safe mode",
              text:
                this.menuai!.localize("ui.dialogs.safe_mode.text") ||
                "MenuAI is running in safe mode, custom integrations and modules are not available. Restart MenuAI to exit safe mode.",
            });
          }
        );
      }
      if (
        this.menuai!.config.recovery_mode &&
        oldmenuai?.config?.recovery_mode !== this.menuai!.config.recovery_mode
      ) {
        navigate("/");
      }
    }

    protected menuaiReconnected() {
      super.menuaiReconnected();
      if (this._disconnectedTimeout) {
        clearTimeout(this._disconnectedTimeout);
        this._disconnectedTimeout = undefined;
        return;
      }
      showToast(this, {
        message: "",
        duration: 0,
      });
    }

    protected menuaiDisconnected() {
      super.menuaiDisconnected();

      this._disconnectedTimeout = window.setTimeout(() => {
        this._disconnectedTimeout = undefined;
        showToast(this, {
          message: this.menuai!.localize("ui.notification_toast.connection_lost"),
          duration: -1,
          dismissable: false,
        });
      }, 1000);
    }

    private _handleMessage(message: BootstrapIntegrationsTimings): void {
      if (this.menuai!.config.state !== STATE_NOT_RUNNING) {
        return;
      }

      if (Object.keys(message).length === 0) {
        showToast(this, {
          message:
            this.menuai!.localize("ui.notification_toast.wrapping_up_startup") ||
            `Wrapping up startup. Not everything will be available until it is finished.`,
          duration: -1,
          dismissable: false,
          action: {
            text:
              this.menuai!.localize("ui.notification_toast.dismiss") || "Dismiss",
            action: () => {
              this._unsubscribeBootstrapIntegrations();
            },
          },
        });
        return;
      }

      // Show the integration that has been starting for the longest time
      const integration = Object.entries(message).sort(
        ([, a], [, b]) => b - a
      )[0][0];

      showToast(this, {
        id: "integration_starting",
        message:
          this.menuai!.localize("ui.notification_toast.integration_starting", {
            integration: domainToName(this.menuai!.localize, integration),
          }) ||
          `Starting ${integration}. Not everything will be available until it is finished.`,
        duration: -1,
        dismissable: false,
        action: {
          text:
            this.menuai!.localize("ui.notification_toast.dismiss") || "Dismiss",
          action: () => {
            this._unsubscribeBootstrapIntegrations();
          },
        },
      });
    }

    private _unsubscribeBootstrapIntegrations() {
      if (this._subscribedBootstrapIntegrations) {
        this._subscribedBootstrapIntegrations.then((unsub) => unsub());
        this._subscribedBootstrapIntegrations = undefined;
      }
    }

    private _subscribeBootstrapIntegrations() {
      if (!this.menuai) {
        return;
      }
      this._subscribedBootstrapIntegrations = subscribeBootstrapIntegrations(
        this.menuai!,
        (message) => {
          this._handleMessage(message);
        }
      );
    }
  };
