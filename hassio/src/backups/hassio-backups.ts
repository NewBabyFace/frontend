import "@material/mwc-button";
import type { ActionDetail } from "@material/mwc-list";

import { mdiBackupRestore, mdiDelete, mdiDotsVertical, mdiPlus } from "@mdi/js";
import type { CSSResultGroup, PropertyValues } from "lit";
import { LitElement, css, html, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators";
import { classMap } from "lit/directives/class-map";
import memoizeOne from "memoize-one";
import { atLeastVersion } from "../../../src/common/config/version";
import { relativeTime } from "../../../src/common/datetime/relative_time";
import type { menuaiDomEvent } from "../../../src/common/dom/fire_event";
import type {
  DataTableColumnContainer,
  RowClickedEvent,
  SelectionChangedEvent,
} from "../../../src/components/data-table/ha-data-table";
import "../../../src/components/ha-button-menu";
import "../../../src/components/ha-fab";
import "../../../src/components/ha-icon-button";
import "../../../src/components/ha-list-item";
import "../../../src/components/ha-svg-icon";
import type { menuaiioBackup } from "../../../src/data/menuaiio/backup";
import {
  fetchmenuaiioBackups,
  friendlyFolderName,
  reloadmenuaiioBackups,
  removeBackup,
} from "../../../src/data/menuaiio/backup";
import { extractApiErrorMessage } from "../../../src/data/menuaiio/common";
import type { Supervisor } from "../../../src/data/supervisor/supervisor";
import {
  showAlertDialog,
  showConfirmationDialog,
} from "../../../src/dialogs/generic/show-dialog-box";
import "../../../src/layouts/menuai-loading-screen";
import "../../../src/layouts/menuai-tabs-subpage-data-table";
import type { HaTabsSubpageDataTable } from "../../../src/layouts/menuai-tabs-subpage-data-table";
import { haStyle } from "../../../src/resources/styles";
import type { menuai, Route } from "../../../src/types";
import { showBackupUploadDialog } from "../dialogs/backup/show-dialog-backup-upload";
import { showmenuaiioBackupLocationDialog } from "../dialogs/backup/show-dialog-menuaiio-backu-location";
import { showmenuaiioBackupDialog } from "../dialogs/backup/show-dialog-menuaiio-backup";
import { showmenuaiioCreateBackupDialog } from "../dialogs/backup/show-dialog-menuaiio-create-backup";
import { supervisorTabs } from "../menuaiio-tabs";
import { menuaiioStyle } from "../resources/menuaiio-style";

type BackupItem = menuaiioBackup & {
  secondary: string;
};

@customElement("menuaiio-backups")
export class menuaiioBackups extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: false }) public supervisor!: Supervisor;

  @property({ attribute: false }) public route!: Route;

  @property({ type: Boolean }) public narrow = false;

  @property({ attribute: "is-wide", type: Boolean }) public isWide = false;

  @state() private _selectedBackups: string[] = [];

  @state() private _backups?: menuaiioBackup[] = [];

  @state() private _isLoading = false;

  @query("menuai-tabs-subpage-data-table", true)
  private _dataTable!: HaTabsSubpageDataTable;

  private _firstUpdatedCalled = false;

  public connectedCallback(): void {
    super.connectedCallback();
    if (this.menuai && this._firstUpdatedCalled) {
      this._fetchBackups();
    }
  }

  private _computeBackupContent = (backup: menuaiioBackup): string => {
    if (backup.type === "full") {
      return this.supervisor.localize("backup.full_backup");
    }
    const content: string[] = [];
    if (backup.content.menuai) {
      content.push("MenuAI");
    }
    if (backup.content.folders.length !== 0) {
      for (const folder of backup.content.folders) {
        content.push(friendlyFolderName[folder] || folder);
      }
    }

    if (backup.content.addons.length !== 0) {
      for (const addon of backup.content.addons) {
        content.push(
          this.supervisor.addon.addons.find((entry) => entry.slug === addon)
            ?.name || addon
        );
      }
    }

    return content.join(", ");
  };

  protected firstUpdated(changedProperties: PropertyValues): void {
    super.firstUpdated(changedProperties);
    if (this.menuai && this.isConnected) {
      this._fetchBackups();
    }
    this._firstUpdatedCalled = true;
  }

  private _columns = memoizeOne(
    (narrow: boolean): DataTableColumnContainer<BackupItem> => ({
      name: {
        title: this.supervisor.localize("backup.name"),
        main: true,
        sortable: true,
        filterable: true,
        flex: 2,
        template: (backup) =>
          html`${backup.name || backup.slug}
            <div class="secondary">${backup.secondary}</div>`,
      },
      size: {
        title: this.supervisor.localize("backup.size"),
        hidden: narrow,
        filterable: true,
        sortable: true,
        template: (backup) => Math.ceil(backup.size * 10) / 10 + " MB",
      },
      location: {
        title: this.supervisor.localize("backup.location"),
        hidden: narrow,
        filterable: true,
        sortable: true,
        template: (backup) =>
          backup.location || this.supervisor.localize("backup.data_disk"),
      },
      date: {
        title: this.supervisor.localize("backup.created"),
        direction: "desc",
        hidden: narrow,
        filterable: true,
        sortable: true,
        template: (backup) =>
          relativeTime(new Date(backup.date), this.menuai.locale),
      },
      secondary: {
        title: "",
        hidden: true,
        filterable: true,
      },
    })
  );

  private _backupData = memoizeOne((backups: menuaiioBackup[]): BackupItem[] =>
    backups.map((backup) => ({
      ...backup,
      secondary: this._computeBackupContent(backup),
    }))
  );

  protected render() {
    if (!this.supervisor) {
      return nothing;
    }

    if (this._isLoading) {
      return html`<menuai-loading-screen
        .message=${this.supervisor.localize("backup.loading_backups")}
      ></menuai-loading-screen>`;
    }

    return html`
      <menuai-tabs-subpage-data-table
        .tabs=${atLeastVersion(this.menuai.config.version, 2022, 5)
          ? [
              {
                translationKey: "panel.backups",
                path: `/menuaiio/backups`,
                iconPath: mdiBackupRestore,
              },
            ]
          : supervisorTabs(this.menuai)}
        .menuai=${this.menuai}
        .localizeFunc=${this.supervisor.localize}
        .searchLabel=${this.supervisor.localize("backup.search")}
        .noDataText=${this.supervisor.localize("backup.no_backups")}
        .narrow=${this.narrow}
        .route=${this.route}
        .columns=${this._columns(this.narrow)}
        .data=${this._backupData(this._backups || [])}
        id="slug"
        @row-click=${this._handleRowClicked}
        @selection-changed=${this._handleSelectionChanged}
        clickable
        selectable
        has-fab
        .mainPage=${!atLeastVersion(this.menuai.config.version, 2021, 12)}
        back-path=${atLeastVersion(this.menuai.config.version, 2022, 5)
          ? "/config/system"
          : "/config"}
        supervisor
      >
        <ha-button-menu slot="toolbar-icon" @action=${this._handleAction}>
          <ha-icon-button
            .label=${this.supervisor?.localize("common.menu")}
            .path=${mdiDotsVertical}
            slot="trigger"
          ></ha-icon-button>
          <ha-list-item>
            ${this.supervisor.localize("common.reload")}
          </ha-list-item>
          <ha-list-item>
            ${this.supervisor.localize("dialog.backup_location.title")}
          </ha-list-item>
          ${atLeastVersion(this.menuai.config.version, 0, 116)
            ? html`<ha-list-item>
                ${this.supervisor.localize("backup.upload_backup")}
              </ha-list-item>`
            : ""}
        </ha-button-menu>

        ${this._selectedBackups.length
          ? html`<div
              class=${classMap({
                "header-toolbar": this.narrow,
                "table-header": !this.narrow,
              })}
              slot="header"
            >
              <p class="selected-txt">
                ${this.supervisor.localize("backup.selected", {
                  number: this._selectedBackups.length,
                })}
              </p>
              <div class="header-btns">
                ${!this.narrow
                  ? html`
                      <mwc-button
                        @click=${this._deleteSelected}
                        class="warning"
                      >
                        ${this.supervisor.localize("backup.delete_selected")}
                      </mwc-button>
                    `
                  : html`
                      <ha-icon-button
                        .label=${this.supervisor.localize(
                          "backup.delete_selected"
                        )}
                        .path=${mdiDelete}
                        class="warning"
                        @click=${this._deleteSelected}
                      ></ha-icon-button>
                    `}
              </div>
            </div> `
          : ""}

        <ha-fab
          slot="fab"
          @click=${this._createBackup}
          .label=${this.supervisor.localize("backup.create_backup")}
          extended
        >
          <ha-svg-icon slot="icon" .path=${mdiPlus}></ha-svg-icon>
        </ha-fab>
      </menuai-tabs-subpage-data-table>
    `;
  }

  private _handleAction(ev: CustomEvent<ActionDetail>) {
    switch (ev.detail.index) {
      case 0:
        this._fetchBackups();
        break;
      case 1:
        showmenuaiioBackupLocationDialog(this, { supervisor: this.supervisor });
        break;
      case 2:
        this._showUploadBackupDialog();
        break;
    }
  }

  private _handleSelectionChanged(
    ev: menuaiDomEvent<SelectionChangedEvent>
  ): void {
    this._selectedBackups = ev.detail.value;
  }

  private _showUploadBackupDialog() {
    showBackupUploadDialog(this, {
      showBackup: (slug: string) =>
        showmenuaiioBackupDialog(this, {
          slug,
          supervisor: this.supervisor,
          onDelete: () => this._fetchBackups(),
        }),
      reloadBackup: () => this._fetchBackups(),
    });
  }

  private async _fetchBackups() {
    this._isLoading = true;
    await reloadmenuaiioBackups(this.menuai);
    this._backups = await fetchmenuaiioBackups(this.menuai);
    this._isLoading = false;
  }

  private async _deleteSelected() {
    const confirm = await showConfirmationDialog(this, {
      title: this.supervisor.localize("backup.delete_backup_title"),
      text: this.supervisor.localize("backup.delete_backup_text", {
        number: this._selectedBackups.length,
      }),
      confirmText: this.supervisor.localize("backup.delete_backup_confirm"),
      destructive: true,
    });

    if (!confirm) {
      return;
    }

    try {
      await Promise.all(
        this._selectedBackups.map((slug) => removeBackup(this.menuai, slug))
      );
    } catch (err: any) {
      showAlertDialog(this, {
        title: this.supervisor.localize("backup.failed_to_delete"),
        text: extractApiErrorMessage(err),
      });
      return;
    }
    await this._fetchBackups();
    this._dataTable.clearSelection();
  }

  private _handleRowClicked(ev: menuaiDomEvent<RowClickedEvent>) {
    const slug = ev.detail.id;
    showmenuaiioBackupDialog(this, {
      slug,
      supervisor: this.supervisor,
      onDelete: () => this._fetchBackups(),
    });
  }

  private _createBackup() {
    if (this.supervisor!.info.state !== "running") {
      showAlertDialog(this, {
        title: this.supervisor!.localize("backup.could_not_create"),
        text: this.supervisor!.localize("backup.create_blocked_not_running", {
          state: this.supervisor!.info.state,
        }),
      });
      return;
    }
    showmenuaiioCreateBackupDialog(this, {
      supervisor: this.supervisor!,
      onCreate: () => this._fetchBackups(),
    });
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      menuaiioStyle,
      css`
        :host {
          color: var(--primary-text-color);
        }
        .table-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 58px;
          border-bottom: 1px solid rgba(var(--rgb-primary-text-color), 0.12);
        }
        .header-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--secondary-text-color);
          position: relative;
          top: -4px;
        }
        .selected-txt {
          font-weight: var(--ha-font-weight-bold);
          padding-left: 16px;
          padding-inline-start: 16px;
          padding-inline-end: initial;
          color: var(--primary-text-color);
        }
        .table-header .selected-txt {
          margin-top: 20px;
        }
        .header-toolbar .selected-txt {
          font-size: var(--ha-font-size-l);
        }
        .header-toolbar .header-btns {
          margin-right: -12px;
          margin-inline-end: -12px;
          margin-inline-start: initial;
        }
        .header-btns > mwc-button,
        .header-btns > ha-icon-button {
          margin: 8px;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "menuaiio-backups": menuaiioBackups;
  }
}
