import type { ActionDetail } from "@material/mwc-list/mwc-list-foundation";

import { mdiDotsVertical } from "@mdi/js";
import type { PropertyValues, TemplateResult } from "lit";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators";
import memoizeOne from "memoize-one";
import { atLeastVersion } from "../../../src/common/config/version";
import { fireEvent } from "../../../src/common/dom/fire_event";
import { navigate } from "../../../src/common/navigate";
import { extractSearchParam } from "../../../src/common/url/search-params";
import "../../../src/components/ha-button-menu";
import "../../../src/components/ha-icon-button";
import "../../../src/components/ha-list-item";
import "../../../src/components/search-input";
import type { menuaiioAddonRepository } from "../../../src/data/menuaiio/addon";
import { reloadmenuaiioAddons } from "../../../src/data/menuaiio/addon";
import { extractApiErrorMessage } from "../../../src/data/menuaiio/common";
import type { StoreAddon } from "../../../src/data/supervisor/store";
import type { Supervisor } from "../../../src/data/supervisor/supervisor";
import { showAlertDialog } from "../../../src/dialogs/generic/show-dialog-box";
import "../../../src/layouts/menuai-loading-screen";
import "../../../src/layouts/menuai-subpage";
import type { menuai, Route } from "../../../src/types";
import { showRegistriesDialog } from "../dialogs/registries/show-dialog-registries";
import { showRepositoriesDialog } from "../dialogs/repositories/show-dialog-repositories";
import "./menuaiio-addon-repository";

const sortRepos = (a: menuaiioAddonRepository, b: menuaiioAddonRepository) => {
  if (a.slug === "local") {
    return -1;
  }
  if (b.slug === "local") {
    return 1;
  }
  if (a.slug === "core") {
    return -1;
  }
  if (b.slug === "core") {
    return 1;
  }
  return a.name.toUpperCase() < b.name.toUpperCase() ? -1 : 1;
};

@customElement("menuaiio-addon-store")
export class menuaiioAddonStore extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: false }) public supervisor!: Supervisor;

  @property({ type: Boolean }) public narrow = false;

  @property({ attribute: false }) public route!: Route;

  @state() private _filter?: string;

  public async refreshData() {
    try {
      await reloadmenuaiioAddons(this.menuai);
    } catch (err) {
      showAlertDialog(this, {
        text: extractApiErrorMessage(err),
      });
    } finally {
      this._loadData();
    }
  }

  protected render() {
    let repos: (TemplateResult | typeof nothing)[] = [];

    if (this.supervisor.store.repositories) {
      repos = this.addonRepositories(
        this.supervisor.store.repositories,
        this.supervisor.store.addons,
        this._filter
      );
    }

    return html`
      <menuai-subpage
        .menuai=${this.menuai}
        .narrow=${this.narrow}
        .route=${this.route}
        .header=${this.supervisor.localize("panel.store")}
      >
        <ha-button-menu slot="toolbar-icon" @action=${this._handleAction}>
          <ha-icon-button
            .label=${this.supervisor.localize("common.menu")}
            .path=${mdiDotsVertical}
            slot="trigger"
          ></ha-icon-button>
          <ha-list-item>
            ${this.supervisor.localize("store.check_updates")}
          </ha-list-item>
          <ha-list-item>
            ${this.supervisor.localize("store.repositories")}
          </ha-list-item>
          ${this.menuai.userData?.showAdvanced &&
          atLeastVersion(this.menuai.config.version, 0, 117)
            ? html`<ha-list-item>
                ${this.supervisor.localize("store.registries")}
              </ha-list-item>`
            : ""}
        </ha-button-menu>
        ${repos.length === 0
          ? html`<menuai-loading-screen no-toolbar></menuai-loading-screen>`
          : html`
              <div class="search">
                <search-input
                  .menuai=${this.menuai}
                  .filter=${this._filter}
                  @value-changed=${this._filterChanged}
                ></search-input>
              </div>

              ${repos}
            `}
        ${!this.menuai.userData?.showAdvanced
          ? html`
              <div class="advanced">
                <a href="/profile" target="_top">
                  ${this.supervisor.localize("store.missing_addons")}
                </a>
              </div>
            `
          : ""}
      </menuai-subpage>
    `;
  }

  protected firstUpdated(changedProps: PropertyValues) {
    super.firstUpdated(changedProps);
    const repositoryUrl = extractSearchParam("repository_url");
    navigate("/menuaiio/store", { replace: true });
    if (repositoryUrl) {
      this._manageRepositories(repositoryUrl);
    }

    this.addEventListener("menuai-api-called", (ev) => this._apiCalled(ev));
    this._loadData();
  }

  private addonRepositories = memoizeOne(
    (
      repositories: menuaiioAddonRepository[],
      addons: StoreAddon[],
      filter?: string
    ) =>
      repositories.sort(sortRepos).map((repo) => {
        const filteredAddons = addons.filter(
          (addon) => addon.repository === repo.slug
        );

        return filteredAddons.length !== 0
          ? html`
              <menuaiio-addon-repository
                .menuai=${this.menuai}
                .repo=${repo}
                .addons=${filteredAddons}
                .filter=${filter!}
                .supervisor=${this.supervisor}
              ></menuaiio-addon-repository>
            `
          : nothing;
      })
  );

  private _handleAction(ev: CustomEvent<ActionDetail>) {
    switch (ev.detail.index) {
      case 0:
        this.refreshData();
        break;
      case 1:
        this._manageRepositoriesClicked();
        break;
      case 2:
        this._manageRegistries();
        break;
    }
  }

  private _apiCalled(ev) {
    if (ev.detail.success) {
      this._loadData();
    }
  }

  private _manageRepositoriesClicked() {
    this._manageRepositories();
  }

  private _manageRepositories(url?: string) {
    showRepositoriesDialog(this, {
      supervisor: this.supervisor,
      url,
    });
  }

  private _manageRegistries() {
    showRegistriesDialog(this, { supervisor: this.supervisor });
  }

  private _loadData() {
    fireEvent(this, "supervisor-collection-refresh", { collection: "addon" });
    fireEvent(this, "supervisor-collection-refresh", {
      collection: "supervisor",
    });
  }

  private _filterChanged(e) {
    this._filter = e.detail.value;
  }

  static styles = css`
    menuaiio-addon-repository {
      margin-top: 24px;
    }
    .search {
      position: sticky;
      top: 0;
      z-index: 2;
    }
    search-input {
      display: block;
      --mdc-text-field-fill-color: var(--sidebar-background-color);
      --mdc-text-field-idle-line-color: var(--divider-color);
    }
    .advanced {
      padding: 12px;
      display: flex;
      flex-wrap: wrap;
      color: var(--primary-text-color);
    }
    .advanced a {
      margin-left: 0.5em;
      margin-inline-start: 0.5em;
      margin-inline-end: initial;
      color: var(--primary-color);
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "menuaiio-addon-store": menuaiioAddonStore;
  }
}
