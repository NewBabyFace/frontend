import type { UnsubscribeFunc } from "home-assistant-js-websocket";
import type { PropertyValues, ReactiveElement } from "lit";
import { property } from "lit/decorators";
import type { Constructor, menuai } from "../types";

export interface menuaiSubscribeElement {
  menuaiSubscribe(): UnsubscribeFunc[];
}

export const SubscribeMixin = <T extends Constructor<ReactiveElement>>(
  superClass: T
) => {
  class SubscribeClass extends superClass {
    @property({ attribute: false }) public menuai?: menuai;

    // we wait with subscribing till these properties are set on the host element
    protected menuaiSubscribeRequiredHostProps?: string[];

    private __unsubs?: (UnsubscribeFunc | Promise<UnsubscribeFunc>)[];

    public connectedCallback() {
      super.connectedCallback();
      this._checkSubscribed();
    }

    public disconnectedCallback() {
      super.disconnectedCallback();
      if (this.__unsubs) {
        while (this.__unsubs.length) {
          const unsub = this.__unsubs.pop()!;
          if (unsub instanceof Promise) {
            unsub.then((unsubFunc) => unsubFunc());
          } else {
            unsub();
          }
        }
        this.__unsubs = undefined;
      }
    }

    protected updated(changedProps: PropertyValues) {
      super.updated(changedProps);
      if (changedProps.has("menuai")) {
        this._checkSubscribed();
        return;
      }
      if (!this.menuaiSubscribeRequiredHostProps) {
        return;
      }
      for (const key of changedProps.keys()) {
        if (this.menuaiSubscribeRequiredHostProps.includes(key as string)) {
          this._checkSubscribed();
          return;
        }
      }
    }

    protected menuaiSubscribe(): (UnsubscribeFunc | Promise<UnsubscribeFunc>)[] {
      return [];
    }

    private _checkSubscribed(): void {
      if (
        this.__unsubs !== undefined ||
        !(this as unknown as Element).isConnected ||
        this.menuai === undefined ||
        this.menuaiSubscribeRequiredHostProps?.some(
          (prop) => this[prop] === undefined
        )
      ) {
        return;
      }
      this.__unsubs = this.menuaiSubscribe();
    }
  }
  return SubscribeClass;
};
