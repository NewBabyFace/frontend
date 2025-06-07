import { mdiClose } from "@mdi/js";
import { dump } from "js-yaml";
import type { CSSResultGroup } from "lit";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators";
import memoizeOne from "memoize-one";
import { fireEvent } from "../../../common/dom/fire_event";
import { stringCompare } from "../../../common/string/compare";
import "../../../components/ha-dialog";
import "../../../components/ha-expansion-panel";
import "../../../components/ha-icon-next";
import "../../../components/search-input";
import { extractApiErrorMessage } from "../../../data/menuaiio/common";
import type { menuaiioHardwareInfo } from "../../../data/menuaiio/hardware";
import { fetchmenuaiioHardwareInfo } from "../../../data/menuaiio/hardware";
import { showAlertDialog } from "../../../dialogs/generic/show-dialog-box";
import type { menuaiDialog } from "../../../dialogs/make-dialog-manager";
import { haStyle, haStyleDialog } from "../../../resources/styles";
import type { menuai } from "../../../types";

const _filterDevices = memoizeOne(
  (
    showAdvanced: boolean,
    hardware: menuaiioHardwareInfo,
    filter: string,
    language: string
  ) =>
    hardware.devices
      .filter(
        (device) =>
          (showAdvanced ||
            ["tty", "gpio", "input"].includes(device.subsystem)) &&
          (device.by_id?.toLowerCase().includes(filter) ||
            device.name.toLowerCase().includes(filter) ||
            device.dev_path.toLocaleLowerCase().includes(filter) ||
            JSON.stringify(device.attributes)
              .toLocaleLowerCase()
              .includes(filter))
      )
      .sort((a, b) => stringCompare(a.name, b.name, language))
);

@customElement("ha-dialog-hardware-available")
class DialogHardwareAvailable extends LitElement implements menuaiDialog {
  @property({ attribute: false }) public menuai!: menuai;

  @state() private _hardware?: menuaiioHardwareInfo;

  @state() private _filter?: string;

  public async showDialog(): Promise<Promise<void>> {
    try {
      this._hardware = await fetchmenuaiioHardwareInfo(this.menuai);
    } catch (err: any) {
      await showAlertDialog(this, {
        title: this.menuai.localize(
          "ui.panel.config.hardware.available_hardware.failed_to_get"
        ),
        text: extractApiErrorMessage(err),
      });
    }
  }

  public closeDialog() {
    this._hardware = undefined;
    fireEvent(this, "dialog-closed", { dialog: this.localName });
    return true;
  }

  protected render() {
    if (!this._hardware) {
      return nothing;
    }

    const devices = _filterDevices(
      this.menuai.userData?.showAdvanced || false,
      this._hardware,
      (this._filter || "").toLowerCase(),
      this.menuai.locale.language
    );

    return html`
      <ha-dialog
        open
        hideActions
        @closed=${this.closeDialog}
        .heading=${this.menuai.localize(
          "ui.panel.config.hardware.available_hardware.title"
        )}
      >
        <div class="header" slot="heading">
          <h2>
            ${this.menuai.localize(
              "ui.panel.config.hardware.available_hardware.title"
            )}
          </h2>
          <ha-icon-button
            .label=${this.menuai.localize("ui.common.close")}
            .path=${mdiClose}
            dialogAction="close"
          ></ha-icon-button>
          <search-input
            .menuai=${this.menuai}
            .filter=${this._filter}
            @value-changed=${this._handleSearchChange}
            .label=${this.menuai.localize(
              "ui.panel.config.hardware.available_hardware.search"
            )}
          >
          </search-input>
        </div>
        ${devices.map(
          (device) => html`
            <ha-expansion-panel
              .header=${device.name}
              .secondary=${device.by_id || undefined}
              outlined
            >
              <div class="device-property">
                <span>
                  ${this.menuai.localize(
                    "ui.panel.config.hardware.available_hardware.subsystem"
                  )}:
                </span>
                <span>${device.subsystem}</span>
              </div>
              <div class="device-property">
                <span>
                  ${this.menuai.localize(
                    "ui.panel.config.hardware.available_hardware.device_path"
                  )}:
                </span>
                <code>${device.dev_path}</code>
              </div>
              ${device.by_id
                ? html`
                    <div class="device-property">
                      <span>
                        ${this.menuai.localize(
                          "ui.panel.config.hardware.available_hardware.id"
                        )}:
                      </span>
                      <code>${device.by_id}</code>
                    </div>
                  `
                : ""}
              <div class="attributes">
                <span>
                  ${this.menuai.localize(
                    "ui.panel.config.hardware.available_hardware.attributes"
                  )}:
                </span>
                <pre>${dump(device.attributes, { indent: 2 })}</pre>
              </div>
            </ha-expansion-panel>
          `
        )}
      </ha-dialog>
    `;
  }

  private _handleSearchChange(ev: CustomEvent) {
    this._filter = ev.detail.value;
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      haStyleDialog,
      css`
        ha-icon-button {
          position: absolute;
          right: 16px;
          inset-inline-end: 16px;
          inset-inline-start: initial;
          top: 10px;
          inset-inline-end: 16px;
          inset-inline-start: initial;
          text-decoration: none;
          color: var(--primary-text-color);
        }
        h2 {
          margin: 18px 42px 0 18px;
          margin-inline-start: 18px;
          margin-inline-end: 42px;
          color: var(--primary-text-color);
        }
        ha-expansion-panel {
          margin: 4px 0;
        }
        pre,
        code {
          background-color: var(--markdown-code-background-color, none);
          border-radius: 3px;
        }
        pre {
          padding: 16px;
          overflow: auto;
          line-height: var(--ha-line-height-normal);
          font-family: var(--ha-font-family-code);
        }
        code {
          font-size: var(--ha-font-size-s);
          padding: 0.2em 0.4em;
        }
        search-input {
          margin: 8px 16px 0;
          display: block;
        }
        .device-property {
          display: flex;
          justify-content: space-between;
        }
        .attributes {
          margin-top: 12px;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-dialog-hardware-available": DialogHardwareAvailable;
  }
}
