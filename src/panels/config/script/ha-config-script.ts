import { consume } from "@lit/context";
import type { menuaiEntities } from "home-assistant-js-websocket";
import type { PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators";
import memoizeOne from "memoize-one";
import { computeStateDomain } from "../../../common/entity/compute_state_domain";
import { debounce } from "../../../common/util/debounce";
import { fullEntitiesContext } from "../../../data/context";
import type { EntityRegistryEntry } from "../../../data/entity_registry";
import type { ScriptEntity } from "../../../data/script";
import type { RouterOptions } from "../../../layouts/menuai-router-page";
import { menuaiRouterPage } from "../../../layouts/menuai-router-page";
import type { menuai } from "../../../types";
import "./ha-script-editor";
import "./ha-script-picker";

const equal = (a: ScriptEntity[], b: ScriptEntity[]): boolean => {
  if (a.length !== b.length) {
    return false;
  }
  return a.every((enityA, index) => enityA === b[index]);
};

@customElement("ha-config-script")
class HaConfigScript extends menuaiRouterPage {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ type: Boolean }) public narrow = false;

  @property({ attribute: "is-wide", type: Boolean }) public isWide = false;

  @property({ attribute: false }) public showAdvanced = false;

  @property({ attribute: false }) public scripts: ScriptEntity[] = [];

  @state()
  @consume({ context: fullEntitiesContext, subscribe: true })
  _entityReg!: EntityRegistryEntry[];

  protected routerOptions: RouterOptions = {
    defaultPage: "dashboard",
    routes: {
      dashboard: {
        tag: "ha-script-picker",
        cache: true,
      },
      edit: {
        tag: "ha-script-editor",
      },
      show: {
        tag: "ha-script-editor",
      },
      trace: {
        tag: "ha-script-trace",
        load: () => import("./ha-script-trace"),
      },
    },
  };

  private _debouncedUpdateScripts = debounce((pageEl) => {
    const newScript = this._getScripts(this.menuai.states);
    if (!equal(newScript, pageEl.scripts)) {
      pageEl.scripts = newScript;
    }
  }, 10);

  private _getScripts = memoizeOne(
    (states: menuaiEntities): ScriptEntity[] =>
      Object.values(states).filter(
        (entity) =>
          computeStateDomain(entity) === "script" && !entity.attributes.restored
      ) as ScriptEntity[]
  );

  protected firstUpdated(changedProps) {
    super.firstUpdated(changedProps);
    this.menuai.loadBackendTranslation("device_automation");
  }

  protected updatePageEl(pageEl, changedProps: PropertyValues) {
    pageEl.menuai = this.menuai;
    pageEl.narrow = this.narrow;
    pageEl.isWide = this.isWide;
    pageEl.route = this.routeTail;
    pageEl.showAdvanced = this.showAdvanced;
    pageEl.entityRegistry = this._entityReg;

    if (this.menuai) {
      if (!pageEl.scripts || !changedProps) {
        pageEl.scripts = this._getScripts(this.menuai.states);
      } else if (changedProps.has("menuai")) {
        this._debouncedUpdateScripts(pageEl);
      }
    }

    if (
      (!changedProps || changedProps.has("route")) &&
      this._currentPage === "show"
    ) {
      pageEl.creatingNew = undefined;
      const scriptId = this.routeTail.path.substr(1);
      pageEl.entityId = scriptId === "new" ? null : scriptId;
      return;
    }

    if (
      (!changedProps || changedProps.has("route")) &&
      this._currentPage !== "dashboard"
    ) {
      pageEl.creatingNew = undefined;
      const scriptId = this.routeTail.path.substr(1);
      pageEl.scriptId = scriptId === "new" ? null : scriptId;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-config-script": HaConfigScript;
  }
}
