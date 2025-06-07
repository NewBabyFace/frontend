import { mdiArrowUpBoldCircle, mdiPuzzle } from "@mdi/js";
import type { CSSResultGroup, TemplateResult } from "lit";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators";
import memoizeOne from "memoize-one";
import { atLeastVersion } from "../../../src/common/config/version";
import { navigate } from "../../../src/common/navigate";
import { caseInsensitiveStringCompare } from "../../../src/common/string/compare";
import "../../../src/components/ha-card";
import type { menuaiioAddonRepository } from "../../../src/data/menuaiio/addon";
import type { StoreAddon } from "../../../src/data/supervisor/store";
import type { Supervisor } from "../../../src/data/supervisor/supervisor";
import type { menuai } from "../../../src/types";
import "../components/menuaiio-card-content";
import { filterAndSort } from "../components/menuaiio-filter-addons";
import { menuaiioStyle } from "../resources/menuaiio-style";

@customElement("menuaiio-addon-repository")
export class menuaiioAddonRepositoryEl extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: false }) public supervisor!: Supervisor;

  @property({ attribute: false }) public repo!: menuaiioAddonRepository;

  @property({ attribute: false }) public addons!: StoreAddon[];

  @property() public filter!: string;

  private _getAddons = memoizeOne((addons: StoreAddon[], filter?: string) => {
    if (filter) {
      return filterAndSort(addons, filter);
    }
    return addons.sort((a, b) =>
      caseInsensitiveStringCompare(a.name, b.name, this.menuai.locale.language)
    );
  });

  protected render(): TemplateResult {
    const repo = this.repo;
    let _addons = this.addons;
    if (!this.menuai.userData?.showAdvanced) {
      _addons = _addons.filter(
        (addon) => !addon.advanced && addon.stage === "stable"
      );
    }
    const addons = this._getAddons(_addons, this.filter);

    if (this.filter && addons.length < 1) {
      return html`
        <div class="content">
          <p class="description">
            ${this.supervisor.localize("store.no_results_found", {
              repository: repo.name,
            })}
          </p>
        </div>
      `;
    }
    return html`
      <div class="content">
        <h1>${repo.name}</h1>
        <div class="card-group">
          ${addons.map(
            (addon) => html`
              <ha-card
                outlined
                .addon=${addon}
                class=${addon.available ? "" : "not_available"}
                @click=${this._addonTapped}
              >
                <div class="card-content">
                  <menuaiio-card-content
                    .menuai=${this.menuai}
                    .title=${addon.name}
                    .description=${addon.description}
                    .available=${addon.available}
                    .icon=${addon.installed && addon.update_available
                      ? mdiArrowUpBoldCircle
                      : mdiPuzzle}
                    .iconTitle=${addon.installed
                      ? addon.update_available
                        ? this.supervisor.localize(
                            "common.new_version_available"
                          )
                        : this.supervisor.localize("addon.state.installed")
                      : addon.available
                        ? this.supervisor.localize("addon.state.not_installed")
                        : this.supervisor.localize("addon.state.not_available")}
                    .iconClass=${addon.installed
                      ? addon.update_available
                        ? "update"
                        : "installed"
                      : !addon.available
                        ? "not_available"
                        : ""}
                    .iconImage=${atLeastVersion(
                      this.menuai.config.version,
                      0,
                      105
                    ) && addon.icon
                      ? `/api/menuaiio/addons/${addon.slug}/icon`
                      : undefined}
                    .showTopbar=${addon.installed || !addon.available}
                    .topbarClass=${addon.installed
                      ? addon.update_available
                        ? "update"
                        : "installed"
                      : !addon.available
                        ? "unavailable"
                        : ""}
                  ></menuaiio-card-content>
                </div>
              </ha-card>
            `
          )}
        </div>
      </div>
    `;
  }

  private _addonTapped(ev) {
    navigate(`/menuaiio/addon/${ev.currentTarget.addon.slug}?store=true`);
  }

  static get styles(): CSSResultGroup {
    return [
      menuaiioStyle,
      css`
        ha-card {
          cursor: pointer;
          overflow: hidden;
        }
        .not_available {
          opacity: 0.6;
        }
        a.repo {
          color: var(--primary-text-color);
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "menuaiio-addon-repository": menuaiioAddonRepositoryEl;
  }
}
