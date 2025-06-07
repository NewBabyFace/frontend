import "@material/mwc-button";
import type { CSSResultGroup } from "lit";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators";
import memoizeOne from "memoize-one";
import "../../../src/components/buttons/ha-progress-button";
import "../../../src/components/ha-card";
import "../../../src/components/ha-settings-row";
import "../../../src/components/ha-svg-icon";
import type { menuaiiomenuaiOSInfo } from "../../../src/data/menuaiio/host";
import type {
  menuaiiomenuaiInfo,
  menuaiioSupervisorInfo,
} from "../../../src/data/menuaiio/supervisor";
import type { Supervisor } from "../../../src/data/supervisor/supervisor";
import { mdimenuai } from "../../../src/resources/home-assistant-logo-svg";
import { haStyle } from "../../../src/resources/styles";
import type { menuai } from "../../../src/types";
import { menuaiioStyle } from "../resources/menuaiio-style";

const computeVersion = (key: string, version: string): string =>
  key === "os" ? version : `${key}-${version}`;

@customElement("menuaiio-update")
export class menuaiioUpdate extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: false }) public supervisor!: Supervisor;

  private _pendingUpdates = memoizeOne(
    (supervisor: Supervisor): number =>
      Object.keys(supervisor).filter(
        (value) => supervisor[value].update_available
      ).length
  );

  protected render() {
    if (!this.supervisor) {
      return nothing;
    }

    const updatesAvailable = this._pendingUpdates(this.supervisor);
    if (!updatesAvailable) {
      return nothing;
    }

    return html`
      <div class="content">
        <h1>
          ${this.supervisor.localize("common.update_available", {
            count: updatesAvailable,
          })}
          🎉
        </h1>
        <div class="card-group">
          ${this._renderUpdateCard(
            "MenuAI Core",
            "core",
            this.supervisor.core
          )}
          ${this._renderUpdateCard(
            "Supervisor",
            "supervisor",
            this.supervisor.supervisor
          )}
          ${this.supervisor.host.features.includes("haos")
            ? this._renderUpdateCard(
                "Operating System",
                "os",
                this.supervisor.os
              )
            : ""}
        </div>
      </div>
    `;
  }

  private _renderUpdateCard(
    name: string,
    key: string,
    object: menuaiiomenuaiInfo | menuaiioSupervisorInfo | menuaiiomenuaiOSInfo
  ) {
    if (!object.update_available) {
      return nothing;
    }
    return html`
      <ha-card outlined>
        <div class="card-content">
          <div class="icon">
            <ha-svg-icon .path=${mdimenuai}></ha-svg-icon>
          </div>
          <div class="update-heading">${name}</div>
          <ha-settings-row two-line>
            <span slot="heading">
              ${this.supervisor.localize("common.version")}
            </span>
            <span slot="description">
              ${computeVersion(key, object.version!)}
            </span>
          </ha-settings-row>

          <ha-settings-row two-line>
            <span slot="heading">
              ${this.supervisor.localize("common.newest_version")}
            </span>
            <span slot="description">
              ${computeVersion(key, object.version_latest!)}
            </span>
          </ha-settings-row>
        </div>
        <div class="card-actions">
          <a href="/menuaiio/update-available/${key}">
            <mwc-button .label=${this.supervisor.localize("common.show")}>
            </mwc-button>
          </a>
        </div>
      </ha-card>
    `;
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      menuaiioStyle,
      css`
        .icon {
          --mdc-icon-size: 48px;
          float: right;
          margin: 0 0 2px 10px;
          color: var(--primary-text-color);
        }
        .update-heading {
          font-size: var(--ha-font-size-l);
          font-weight: var(--ha-font-weight-medium);
          margin-bottom: 0.5em;
          color: var(--primary-text-color);
        }
        .card-content {
          height: calc(100% - 47px);
          box-sizing: border-box;
        }
        .card-actions {
          text-align: right;
        }
        a {
          text-decoration: none;
        }
        ha-settings-row {
          padding: 0;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "menuaiio-update": menuaiioUpdate;
  }
}
