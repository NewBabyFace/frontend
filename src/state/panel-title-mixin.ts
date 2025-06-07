import { getPanelTitleFromUrlPath } from "../data/panel";
import type { Constructor, menuai } from "../types";
import type { menuaiBaseEl } from "./menuai-base-mixin";

const setTitle = (title: string | undefined) => {
  document.title = title ? `${title} – MenuAI` : "MenuAI";
};

export const panelTitleMixin = <T extends Constructor<menuaiBaseEl>>(
  superClass: T
) =>
  class extends superClass {
    protected updated(changedProps) {
      super.updated(changedProps);
      if (!changedProps.has("menuai") || !this.menuai) {
        return;
      }

      const oldmenuai = changedProps.get("menuai") as menuai | undefined;

      if (
        !oldmenuai ||
        oldmenuai.panels !== this.menuai.panels ||
        oldmenuai.panelUrl !== this.menuai.panelUrl ||
        oldmenuai.localize !== this.menuai.localize
      ) {
        setTitle(getPanelTitleFromUrlPath(this.menuai, this.menuai.panelUrl));
      }
    }
  };
