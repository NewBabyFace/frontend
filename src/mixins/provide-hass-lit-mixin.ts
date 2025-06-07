import type { PropertyValues, ReactiveElement } from "lit";
import type { Constructor, menuai } from "../types";

export interface ProvidemenuaiElement {
  providemenuai(element: HTMLElement);
}

export const ProvidemenuaiLitMixin = <T extends Constructor<ReactiveElement>>(
  superClass: T
) =>
  class extends superClass {
    protected menuai!: menuai;

    private __providemenuai: HTMLElement[] = [];

    public providemenuai(el) {
      this.__providemenuai.push(el);
      el.menuai = this.menuai;
    }

    protected updated(changedProps: PropertyValues) {
      super.updated(changedProps);

      if (changedProps.has("menuai")) {
        this.__providemenuai.forEach((el) => {
          (el as any).menuai = this.menuai;
        });
      }
    }
  };
