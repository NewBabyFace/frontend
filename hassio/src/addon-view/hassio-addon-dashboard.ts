import {
  mdiCogs,
  mdiFileDocument,
  mdiInformationVariant,
  mdiMathLog,
} from "@mdi/js";
import type { CSSResultGroup, TemplateResult } from "lit";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators";
import memoizeOne from "memoize-one";
import { fireEvent } from "../../../src/common/dom/fire_event";
import { navigate } from "../../../src/common/navigate";
import { extractSearchParam } from "../../../src/common/url/search-params";
import type { menuaiioAddonDetails } from "../../../src/data/menuaiio/addon";
import {
  fetchAddonInfo,
  fetchmenuaiioAddonInfo,
  fetchmenuaiioAddonsInfo,
} from "../../../src/data/menuaiio/addon";
import { extractApiErrorMessage } from "../../../src/data/menuaiio/common";
import type { StoreAddonDetails } from "../../../src/data/supervisor/store";
import {
  addStoreRepository,
  fetchSupervisorStore,
} from "../../../src/data/supervisor/store";
import type { Supervisor } from "../../../src/data/supervisor/supervisor";
import { showConfirmationDialog } from "../../../src/dialogs/generic/show-dialog-box";
import "../../../src/layouts/menuai-error-screen";
import "../../../src/layouts/menuai-loading-screen";
import "../../../src/layouts/menuai-tabs-subpage";
import type { PageNavigation } from "../../../src/layouts/menuai-tabs-subpage";
import { haStyle } from "../../../src/resources/styles";
import type { menuai, Route } from "../../../src/types";
import { menuaiioStyle } from "../resources/menuaiio-style";
import "./config/menuaiio-addon-audio";
import "./config/menuaiio-addon-config";
import "./config/menuaiio-addon-network";
import "./menuaiio-addon-router";
import "./info/menuaiio-addon-info";

@customElement("menuaiio-addon-dashboard")
class menuaiioAddonDashboard extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: false }) public supervisor!: Supervisor;

  @property({ attribute: false }) public route!: Route;

  @property({ attribute: false }) public addon?:
    | menuaiioAddonDetails
    | StoreAddonDetails;

  @property({ type: Boolean }) public narrow = false;

  @state()
  private _controlEnabled = false;

  @state() private _error?: string;

  private _backPath = new URLSearchParams(window.parent.location.search).get(
    "store"
  )
    ? "/menuaiio/store"
    : "/menuaiio/dashboard";

  private _computeTail = memoizeOne((route: Route) => {
    const dividerPos = route.path.indexOf("/", 1);
    return dividerPos === -1
      ? {
          prefix: route.prefix + route.path,
          path: "",
        }
      : {
          prefix: route.prefix + route.path.substr(0, dividerPos),
          path: route.path.substr(dividerPos),
        };
  });

  protected render(): TemplateResult {
    if (this._error) {
      return html`<menuai-error-screen
        .error=${this._error}
      ></menuai-error-screen>`;
    }

    if (!this.addon || !this.supervisor?.addon) {
      return html`<menuai-loading-screen></menuai-loading-screen>`;
    }

    const addonTabs: PageNavigation[] = [
      {
        translationKey: "addon.panel.info",
        path: `/menuaiio/addon/${this.addon.slug}/info`,
        iconPath: mdiInformationVariant,
      },
    ];

    if (this.addon.documentation) {
      addonTabs.push({
        translationKey: "addon.panel.documentation",
        path: `/menuaiio/addon/${this.addon.slug}/documentation`,
        iconPath: mdiFileDocument,
      });
    }

    if (this.addon.version) {
      addonTabs.push(
        {
          translationKey: "addon.panel.configuration",
          path: `/menuaiio/addon/${this.addon.slug}/config`,
          iconPath: mdiCogs,
        },
        {
          translationKey: "addon.panel.log",
          path: `/menuaiio/addon/${this.addon.slug}/logs`,
          iconPath: mdiMathLog,
        }
      );
    }

    const route = this._computeTail(this.route);

    return html`
      <menuai-tabs-subpage
        .menuai=${this.menuai}
        .localizeFunc=${this.supervisor.localize}
        .narrow=${this.narrow}
        .route=${route}
        .tabs=${addonTabs}
        .backPath=${this._backPath}
        supervisor
      >
        <span slot="header">${this.addon.name}</span>
        <menuaiio-addon-router
          .route=${route}
          .narrow=${this.narrow}
          .menuai=${this.menuai}
          .supervisor=${this.supervisor}
          .addon=${this.addon}
          .controlEnabled=${this._controlEnabled}
          @system-managed-take-control=${this._enableControl}
        ></menuaiio-addon-router>
      </menuai-tabs-subpage>
    `;
  }

  private _enableControl() {
    this._controlEnabled = true;
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      menuaiioStyle,
      css`
        :host {
          color: var(--primary-text-color);
        }
        .content {
          padding: 24px 0 32px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        menuaiio-addon-info,
        menuaiio-addon-network,
        menuaiio-addon-audio,
        menuaiio-addon-config {
          margin-bottom: 24px;
          width: 600px;
        }
        @media only screen and (max-width: 600px) {
          menuaiio-addon-info,
          menuaiio-addon-network,
          menuaiio-addon-audio,
          menuaiio-addon-config {
            max-width: 100%;
            min-width: 100%;
          }
        }
      `,
    ];
  }

  protected async firstUpdated(): Promise<void> {
    if (this.route.path === "") {
      const requestedAddon = extractSearchParam("addon");
      const requestedAddonRepository = extractSearchParam("repository_url");
      if (requestedAddonRepository) {
        const storeInfo = await fetchSupervisorStore(this.menuai);
        if (
          !storeInfo.repositories.find(
            (repo) => repo.source === requestedAddonRepository
          )
        ) {
          if (
            !(await showConfirmationDialog(this, {
              title: this.supervisor.localize("my.add_addon_repository_title"),
              text: this.supervisor.localize(
                "my.add_addon_repository_description",
                { addon: requestedAddon, repository: requestedAddonRepository }
              ),
              confirmText: this.supervisor.localize("common.add"),
              dismissText: this.supervisor.localize("common.cancel"),
            }))
          ) {
            this._error = this.supervisor.localize(
              "my.error_repository_not_found"
            );
            return;
          }

          try {
            await addStoreRepository(this.menuai, requestedAddonRepository);
          } catch (err: any) {
            this._error = extractApiErrorMessage(err);
          }
        }
      }

      if (requestedAddon) {
        const store = await fetchSupervisorStore(this.menuai);
        const validAddon = store.addons.some(
          (addon) => addon.slug === requestedAddon
        );
        if (!validAddon) {
          this._error = this.supervisor.localize("my.error_addon_not_found");
        } else {
          navigate(`/menuaiio/addon/${requestedAddon}`, { replace: true });
        }
      }
    }
    this.addEventListener("menuai-api-called", (ev) => this._apiCalled(ev));
  }

  private async _apiCalled(ev): Promise<void> {
    if (!ev.detail.success) {
      return;
    }

    const pathSplit: string[] = ev.detail.path?.split("/");

    if (!pathSplit || pathSplit.length === 0) {
      return;
    }

    const path: string = pathSplit[pathSplit.length - 1];

    if (["uninstall", "install", "update", "start", "stop"].includes(path)) {
      fireEvent(this, "supervisor-collection-refresh", {
        collection: "addon",
      });
    }

    if (path === "uninstall") {
      if (this.isConnected) {
        navigate(this._backPath);
      }
    } else if (path === "install") {
      this.addon = await fetchmenuaiioAddonInfo(this.menuai, this.addon!.slug);
    } else {
      await this._routeDataChanged();
    }
  }

  protected updated(changedProperties) {
    if (changedProperties.has("route") && !this.addon) {
      this._routeDataChanged();
    }
  }

  private async _routeDataChanged(): Promise<void> {
    const addon = this.route.path.split("/")[1];
    if (!addon) {
      return;
    }
    try {
      if (!this.supervisor.addon) {
        const addonsInfo = await fetchmenuaiioAddonsInfo(this.menuai);
        fireEvent(this, "supervisor-update", { addon: addonsInfo });
      }
      this.addon = await fetchAddonInfo(this.menuai, this.supervisor, addon);
    } catch (err: any) {
      this._error = `Error fetching addon info: ${extractApiErrorMessage(err)}`;
      this.addon = undefined;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "menuaiio-addon-dashboard": menuaiioAddonDashboard;
  }
}
