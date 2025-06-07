import type { PropertyValues } from "lit";
import { customElement, property } from "lit/decorators";
import type { Blueprints } from "../../../data/blueprint";
import { fetchBlueprints } from "../../../data/blueprint";
import type { RouterOptions } from "../../../layouts/menuai-router-page";
import { menuaiRouterPage } from "../../../layouts/menuai-router-page";
import type { menuai } from "../../../types";
import "./ha-blueprint-overview";

declare global {
  // for fire event
  interface menuaiDomEvents {
    "reload-blueprints": undefined;
  }
}

@customElement("ha-config-blueprint")
class HaConfigBlueprint extends menuaiRouterPage {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ type: Boolean }) public narrow = false;

  @property({ attribute: "is-wide", type: Boolean }) public isWide = false;

  @property({ attribute: false }) public showAdvanced = false;

  @property({ attribute: false })
  public blueprints: Record<string, Blueprints> = {};

  protected routerOptions: RouterOptions = {
    defaultPage: "dashboard",
    routes: {
      dashboard: {
        tag: "ha-blueprint-overview",
        cache: true,
      },
      edit: {
        tag: "ha-blueprint-editor",
      },
    },
  };

  private async _getBlueprints() {
    const [automation, script] = await Promise.all([
      fetchBlueprints(this.menuai, "automation"),
      fetchBlueprints(this.menuai, "script"),
    ]);
    this.blueprints = { automation, script };
  }

  protected firstUpdated(changedProps) {
    super.firstUpdated(changedProps);
    this.addEventListener("reload-blueprints", () => {
      this._getBlueprints();
    });
    this._getBlueprints();
  }

  protected updatePageEl(pageEl, changedProps: PropertyValues) {
    pageEl.menuai = this.menuai;
    pageEl.narrow = this.narrow;
    pageEl.isWide = this.isWide;
    pageEl.route = this.routeTail;
    pageEl.showAdvanced = this.showAdvanced;
    pageEl.blueprints = this.blueprints;

    if (
      (!changedProps || changedProps.has("route")) &&
      this._currentPage === "edit"
    ) {
      const blueprintId = this.routeTail.path.substr(1);
      pageEl.blueprintId = blueprintId === "new" ? null : blueprintId;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-config-blueprint": HaConfigBlueprint;
  }
}
