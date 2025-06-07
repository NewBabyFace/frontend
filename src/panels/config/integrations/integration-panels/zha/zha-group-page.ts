import "@material/mwc-button";
import { mdiDelete } from "@mdi/js";
import type { CSSResultGroup, PropertyValues } from "lit";
import { LitElement, css, html, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators";
import type { menuaiDomEvent } from "../../../../../common/dom/fire_event";
import { navigate } from "../../../../../common/navigate";
import type { SelectionChangedEvent } from "../../../../../components/data-table/ha-data-table";
import "../../../../../components/ha-card";
import "../../../../../components/ha-icon-button";
import "../../../../../components/ha-list";
import "../../../../../components/ha-list-item";
import "../../../../../components/ha-spinner";
import type { ZHADeviceEndpoint, ZHAGroup } from "../../../../../data/zha";
import {
  addMembersToGroup,
  fetchGroup,
  fetchGroupableDevices,
  removeGroups,
  removeMembersFromGroup,
} from "../../../../../data/zha";
import "../../../../../layouts/menuai-error-screen";
import "../../../../../layouts/menuai-subpage";
import type { menuai } from "../../../../../types";
import "../../../ha-config-section";
import { formatAsPaddedHex } from "./functions";
import "./zha-device-endpoint-data-table";
import type { ZHADeviceEndpointDataTable } from "./zha-device-endpoint-data-table";

@customElement("zha-group-page")
export class ZHAGroupPage extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ type: Object }) public group?: ZHAGroup;

  @property({ attribute: false, type: Number }) public groupId!: number;

  @property({ type: Boolean }) public narrow = false;

  @property({ attribute: "is-wide", type: Boolean }) public isWide = false;

  @property({ attribute: false, type: Array })
  public deviceEndpoints: ZHADeviceEndpoint[] = [];

  @state() private _processingAdd = false;

  @state() private _processingRemove = false;

  @state()
  private _filteredDeviceEndpoints: ZHADeviceEndpoint[] = [];

  @state() private _selectedDevicesToAdd: string[] = [];

  @state() private _selectedDevicesToRemove: string[] = [];

  @query("#addMembers", true)
  private _zhaAddMembersDataTable!: ZHADeviceEndpointDataTable;

  @query("#removeMembers")
  private _zhaRemoveMembersDataTable!: ZHADeviceEndpointDataTable;

  private _firstUpdatedCalled = false;

  public connectedCallback(): void {
    super.connectedCallback();
    if (this.menuai && this._firstUpdatedCalled) {
      this._fetchData();
    }
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    this._processingAdd = false;
    this._processingRemove = false;
    this._selectedDevicesToRemove = [];
    this._selectedDevicesToAdd = [];
    this.deviceEndpoints = [];
    this._filteredDeviceEndpoints = [];
  }

  protected firstUpdated(changedProperties: PropertyValues): void {
    super.firstUpdated(changedProperties);
    if (this.menuai) {
      this._fetchData();
    }
    this._firstUpdatedCalled = true;
  }

  protected render() {
    if (!this.group) {
      return html`
        <menuai-error-screen
          .menuai=${this.menuai}
          .error=${this.menuai.localize(
            "ui.panel.config.zha.groups.group_not_found"
          )}
        ></menuai-error-screen>
      `;
    }

    return html`
      <menuai-subpage
        .menuai=${this.menuai}
        .narrow=${this.narrow}
        .header=${this.group.name}
      >
        <ha-icon-button
          slot="toolbar-icon"
          .path=${mdiDelete}
          @click=${this._deleteGroup}
          .label=${this.menuai.localize("ui.panel.config.zha.groups.delete")}
        ></ha-icon-button>
        <ha-config-section .isWide=${this.isWide}>
          <div class="header">
            ${this.menuai.localize("ui.panel.config.zha.groups.group_info")}
          </div>

          <p slot="introduction">
            ${this.menuai.localize("ui.panel.config.zha.groups.group_details")}
          </p>

          <p><b>Name:</b> ${this.group.name}</p>
          <p><b>Group Id:</b> ${formatAsPaddedHex(this.group.group_id)}</p>

          <div class="header">
            ${this.menuai.localize("ui.panel.config.zha.groups.members")}
          </div>
          <ha-card>
            <ha-list>
              ${this.group.members.length
                ? this.group.members.map(
                    (member) =>
                      html`<a
                        href="/config/devices/device/${member.device
                          .device_reg_id}"
                      >
                        <ha-list-item
                          >${member.device.user_given_name ||
                          member.device.name}</ha-list-item
                        >
                      </a>`
                  )
                : html`
                    <ha-list-item> This group has no members </ha-list-item>
                  `}
            </ha-list>
          </ha-card>
          ${this.group.members.length
            ? html`
                <div class="header">
                  ${this.menuai.localize(
                    "ui.panel.config.zha.groups.remove_members"
                  )}
                </div>

                <zha-device-endpoint-data-table
                  id="removeMembers"
                  .menuai=${this.menuai}
                  .deviceEndpoints=${this.group.members}
                  .narrow=${this.narrow}
                  selectable
                  @selection-changed=${this._handleRemoveSelectionChanged}
                >
                </zha-device-endpoint-data-table>

                <div class="buttons">
                  <mwc-button
                    .disabled=${!this._selectedDevicesToRemove.length ||
                    this._processingRemove}
                    @click=${this._removeMembersFromGroup}
                    class="button"
                  >
                    ${this._processingRemove
                      ? html`<ha-spinner
                          .ariaLabel=${this.menuai.localize(
                            "ui.panel.config.zha.groups.removing_members"
                          )}
                        ></ha-spinner>`
                      : nothing}
                    ${this.menuai!.localize(
                      "ui.panel.config.zha.groups.remove_members"
                    )}</mwc-button
                  >
                </div>
              `
            : nothing}

          <div class="header">
            ${this.menuai.localize("ui.panel.config.zha.groups.add_members")}
          </div>

          <zha-device-endpoint-data-table
            id="addMembers"
            .menuai=${this.menuai}
            .deviceEndpoints=${this._filteredDeviceEndpoints}
            .narrow=${this.narrow}
            selectable
            @selection-changed=${this._handleAddSelectionChanged}
          >
          </zha-device-endpoint-data-table>

          <div class="buttons">
            <mwc-button
              .disabled=${!this._selectedDevicesToAdd.length ||
              this._processingAdd}
              @click=${this._addMembersToGroup}
              class="button"
            >
              ${this._processingAdd
                ? html`<ha-spinner
                    size="small"
                    aria-label="Saving"
                  ></ha-spinner>`
                : ""}
              ${this.menuai!.localize(
                "ui.panel.config.zha.groups.add_members"
              )}</mwc-button
            >
          </div>
        </ha-config-section>
      </menuai-subpage>
    `;
  }

  private async _fetchData() {
    if (this.groupId !== null && this.groupId !== undefined) {
      this.group = await fetchGroup(this.menuai!, this.groupId);
    }
    this.deviceEndpoints = await fetchGroupableDevices(this.menuai!);
    // filter the groupable devices so we only show devices that aren't already in the group
    this._filterDevices();
  }

  private _filterDevices() {
    // filter the groupable devices so we only show devices that aren't already in the group
    this._filteredDeviceEndpoints = this.deviceEndpoints.filter(
      (deviceEndpoint) =>
        !this.group!.members.some(
          (member) =>
            member.device.ieee === deviceEndpoint.device.ieee &&
            member.endpoint_id === deviceEndpoint.endpoint_id
        )
    );
  }

  private _handleAddSelectionChanged(
    ev: menuaiDomEvent<SelectionChangedEvent>
  ): void {
    this._selectedDevicesToAdd = ev.detail.value;
  }

  private _handleRemoveSelectionChanged(
    ev: menuaiDomEvent<SelectionChangedEvent>
  ): void {
    this._selectedDevicesToRemove = ev.detail.value;
  }

  private async _addMembersToGroup(): Promise<void> {
    this._processingAdd = true;
    const members = this._selectedDevicesToAdd.map((member) => {
      const memberParts = member.split("_");
      return { ieee: memberParts[0], endpoint_id: memberParts[1] };
    });
    this.group = await addMembersToGroup(this.menuai, this.groupId, members);
    this._filterDevices();
    this._selectedDevicesToAdd = [];
    this._zhaAddMembersDataTable.clearSelection();
    this._processingAdd = false;
  }

  private async _removeMembersFromGroup(): Promise<void> {
    this._processingRemove = true;
    const members = this._selectedDevicesToRemove.map((member) => {
      const memberParts = member.split("_");
      return { ieee: memberParts[0], endpoint_id: memberParts[1] };
    });
    this.group = await removeMembersFromGroup(this.menuai, this.groupId, members);
    this._filterDevices();
    this._selectedDevicesToRemove = [];
    this._zhaRemoveMembersDataTable.clearSelection();
    this._processingRemove = false;
  }

  private async _deleteGroup(): Promise<void> {
    await removeGroups(this.menuai, [this.groupId]);
    navigate(`/config/zha/groups`, { replace: true });
  }

  static get styles(): CSSResultGroup {
    return [
      css`
        menuai-subpage {
          --app-header-text-color: var(--sidebar-icon-color);
        }
        .header {
          font-family: var(--ha-font-family-body);
          -webkit-font-smoothing: var(--ha-font-smoothing);
          -moz-osx-font-smoothing: var(--ha-moz-osx-font-smoothing);
          font-size: var(--ha-font-size-4xl);
          font-weight: var(--ha-font-weight-normal);
          line-height: var(--ha-line-height-condensed);
          opacity: var(--dark-primary-opacity);
        }

        .button {
          float: right;
        }

        a {
          color: var(--primary-color);
          text-decoration: none;
        }
        .buttons {
          align-items: flex-end;
          padding: 8px;
        }
        .buttons .warning {
          --mdc-theme-primary: var(--error-color);
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "zha-group-page": ZHAGroupPage;
  }
}
