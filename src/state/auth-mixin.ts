import { subscribeUser, userCollection } from "../data/ws-user";
import type { Constructor } from "../types";
import { clearState } from "../util/ha-pref-storage";
import type { menuaiBaseEl } from "./menuai-base-mixin";

declare global {
  // for fire event
  interface menuaiDomEvents {
    "menuai-refresh-current-user": undefined;
  }
}

export default <T extends Constructor<menuaiBaseEl>>(superClass: T) =>
  class extends superClass {
    protected firstUpdated(changedProps) {
      super.firstUpdated(changedProps);
      this.addEventListener("menuai-logout", () => this._handleLogout());
      this.addEventListener("menuai-refresh-current-user", () => {
        userCollection(this.menuai!.connection).refresh();
      });
    }

    protected menuaiConnected() {
      super.menuaiConnected();
      subscribeUser(this.menuai!.connection, (user) =>
        this._updatemenuai({ user })
      );
    }

    private async _handleLogout() {
      try {
        await this.menuai!.auth.revoke();
        this.menuai!.connection.close();
        clearState();
        document.location.href = "/";
      } catch (err: any) {
        // eslint-disable-next-line
        console.error(err);
        alert("Log out failed");
      }
    }
  };
