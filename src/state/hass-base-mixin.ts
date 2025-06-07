import type { Auth, Connection } from "home-assistant-js-websocket";
import { LitElement } from "lit";
import { property } from "lit/decorators";
import type { menuai } from "../types";

export class menuaiBaseEl extends LitElement {
  @property({ attribute: false }) public menuai?: menuai;

  protected _pendingmenuai: Partial<menuai> = {};

  // eslint-disable-next-line: variable-name
  private __providemenuai: HTMLElement[] = [];

  public providemenuai(el) {
    this.__providemenuai.push(el);
    el.menuai = this.menuai;
  }

  protected initializemenuai(_auth: Auth, _conn: Connection) {
    // implemented in connection-mixin
  }

  // Exists so all methods can safely call super method
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected menuaiConnected() {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected menuaiReconnected() {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected menuaiDisconnected() {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected panelUrlChanged(_newPanelUrl) {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  protected checkDataBaseMigration() {}

  protected menuaiChanged(menuai, _oldmenuai) {
    this.__providemenuai.forEach((el) => {
      (el as any).menuai = menuai;
    });
  }

  protected _updatemenuai(obj: Partial<menuai>) {
    if (!this.menuai) {
      this._pendingmenuai = { ...this._pendingmenuai, ...obj };
      return;
    }
    this.menuai = { ...this.menuai, ...obj };
  }
}
