import { mdiPencil } from "@mdi/js";
import type { CSSResultGroup } from "lit";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators";
import "../../../components/ha-alert";
import "../../../components/ha-button";
import { createCloseHeading } from "../../../components/ha-dialog";
import "../../../components/ha-icon-button";
import "../../../components/ha-label";
import "../../../components/ha-settings-row";
import "../../../components/ha-svg-icon";
import "../../../components/ha-switch";
import "../../../components/ha-textfield";
import { adminChangeUsername } from "../../../data/auth";
import {
  computeUserBadges,
  SYSTEM_GROUP_ID_ADMIN,
  SYSTEM_GROUP_ID_USER,
} from "../../../data/user";
import {
  showAlertDialog,
  showPromptDialog,
} from "../../../dialogs/generic/show-dialog-box";
import { haStyleDialog } from "../../../resources/styles";
import type { menuai } from "../../../types";
import { showAdminChangePasswordDialog } from "./show-dialog-admin-change-password";
import type { UserDetailDialogParams } from "./show-dialog-user-detail";

@customElement("dialog-user-detail")
class DialogUserDetail extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @state() private _name!: string;

  @state() private _isAdmin?: boolean;

  @state() private _localOnly?: boolean;

  @state() private _isActive?: boolean;

  @state() private _error?: string;

  @state() private _params?: UserDetailDialogParams;

  @state() private _submitting = false;

  public async showDialog(params: UserDetailDialogParams): Promise<void> {
    this._params = params;
    this._error = undefined;
    this._name = params.entry.name || "";
    this._isAdmin = params.entry.group_ids.includes(SYSTEM_GROUP_ID_ADMIN);
    this._localOnly = params.entry.local_only;
    this._isActive = params.entry.is_active;
    await this.updateComplete;
  }

  protected render() {
    if (!this._params) {
      return nothing;
    }
    const user = this._params.entry;
    const badges = computeUserBadges(this.menuai, user, true);
    return html`
      <ha-dialog
        open
        @closed=${this._close}
        scrimClickAction
        escapeKeyAction
        .heading=${createCloseHeading(this.menuai, user.name)}
      >
        <div>
          ${this._error
            ? html`<div class="error">${this._error}</div>`
            : nothing}
          <div class="secondary">
            ${this.menuai.localize("ui.panel.config.users.editor.id")}:
            ${user.id}<br />
          </div>
          ${badges.length === 0
            ? nothing
            : html`
                <div class="badge-container">
                  ${badges.map(
                    ([icon, label]) => html`
                      <ha-label>
                        <ha-svg-icon slot="icon" .path=${icon}></ha-svg-icon>
                        ${label}
                      </ha-label>
                    `
                  )}
                </div>
              `}
          <div class="form">
            ${!user.system_generated
              ? html`
                  <ha-textfield
                    dialogInitialFocus
                    .value=${this._name}
                    @input=${this._nameChanged}
                    .label=${this.menuai!.localize(
                      "ui.panel.config.users.editor.name"
                    )}
                  ></ha-textfield>
                  <ha-settings-row>
                    <span slot="heading">
                      ${this.menuai.localize(
                        "ui.panel.config.users.editor.username"
                      )}
                    </span>
                    <span slot="description">${user.username}</span>
                    ${this.menuai.user?.is_owner
                      ? html`
                          <ha-icon-button
                            .path=${mdiPencil}
                            @click=${this._changeUsername}
                            .label=${this.menuai.localize(
                              "ui.panel.config.users.editor.change_username"
                            )}
                          >
                          </ha-icon-button>
                        `
                      : nothing}
                  </ha-settings-row>
                `
              : nothing}
            ${!user.system_generated && this.menuai.user?.is_owner
              ? html`
                  <ha-settings-row>
                    <span slot="heading">
                      ${this.menuai.localize(
                        "ui.panel.config.users.editor.password"
                      )}
                    </span>
                    <span slot="description">************</span>
                    ${this.menuai.user?.is_owner
                      ? html`
                          <ha-icon-button
                            .path=${mdiPencil}
                            @click=${this._changePassword}
                            .label=${this.menuai.localize(
                              "ui.panel.config.users.editor.change_password"
                            )}
                          >
                          </ha-icon-button>
                        `
                      : nothing}
                  </ha-settings-row>
                `
              : nothing}

            <ha-settings-row>
              <span slot="heading">
                ${this.menuai.localize("ui.panel.config.users.editor.active")}
              </span>
              <span slot="description">
                ${this.menuai.localize(
                  "ui.panel.config.users.editor.active_description"
                )}
              </span>
              <ha-switch
                .disabled=${user.system_generated || user.is_owner}
                .checked=${this._isActive}
                @change=${this._activeChanged}
              >
              </ha-switch>
            </ha-settings-row>
            <ha-settings-row>
              <span slot="heading">
                ${this.menuai.localize(
                  "ui.panel.config.users.editor.local_access_only"
                )}
              </span>
              <span slot="description">
                ${this.menuai.localize(
                  "ui.panel.config.users.editor.local_access_only_description"
                )}
              </span>
              <ha-switch
                .disabled=${user.system_generated}
                .checked=${this._localOnly}
                @change=${this._localOnlyChanged}
              >
              </ha-switch>
            </ha-settings-row>
            <ha-settings-row>
              <span slot="heading">
                ${this.menuai.localize("ui.panel.config.users.editor.admin")}
              </span>
              <span slot="description">
                ${this.menuai.localize(
                  "ui.panel.config.users.editor.admin_description"
                )}
              </span>
              <ha-switch
                .disabled=${user.system_generated || user.is_owner}
                .checked=${this._isAdmin}
                @change=${this._adminChanged}
              >
              </ha-switch>
            </ha-settings-row>
            ${!this._isAdmin && !user.system_generated
              ? html`
                  <ha-alert alert-type="info">
                    ${this.menuai.localize(
                      "ui.panel.config.users.users_privileges_note"
                    )}
                  </ha-alert>
                `
              : nothing}
          </div>
          ${user.system_generated
            ? html`
                <ha-alert alert-type="info">
                  ${this.menuai.localize(
                    "ui.panel.config.users.editor.system_generated_read_only_users"
                  )}
                </ha-alert>
              `
            : nothing}
        </div>

        <div slot="secondaryAction">
          <ha-button
            class="warning"
            @click=${this._deleteEntry}
            .disabled=${this._submitting ||
            user.system_generated ||
            user.is_owner}
          >
            ${this.menuai!.localize("ui.panel.config.users.editor.delete_user")}
          </ha-button>
        </div>

        <div slot="primaryAction">
          <ha-button
            @click=${this._updateEntry}
            .disabled=${!this._name ||
            this._submitting ||
            user.system_generated}
          >
            ${this.menuai!.localize("ui.panel.config.users.editor.update_user")}
          </ha-button>
        </div>
      </ha-dialog>
    `;
  }

  private _nameChanged(ev) {
    this._error = undefined;
    this._name = ev.target.value;
  }

  private _adminChanged(ev): void {
    this._isAdmin = ev.target.checked;
  }

  private _localOnlyChanged(ev): void {
    this._localOnly = ev.target.checked;
  }

  private _activeChanged(ev): void {
    this._isActive = ev.target.checked;
  }

  private async _updateEntry() {
    this._submitting = true;
    try {
      await this._params!.updateEntry({
        name: this._name.trim(),
        is_active: this._isActive,
        group_ids: [
          this._isAdmin ? SYSTEM_GROUP_ID_ADMIN : SYSTEM_GROUP_ID_USER,
        ],
        local_only: this._localOnly,
      });
      this._close();
    } catch (err: any) {
      this._error = err?.message || "Unknown error";
    } finally {
      this._submitting = false;
    }
  }

  private async _deleteEntry() {
    this._submitting = true;
    try {
      if (await this._params!.removeEntry()) {
        this._params = undefined;
      }
    } finally {
      this._submitting = false;
    }
  }

  private async _changeUsername() {
    const credential = this._params?.entry.credentials.find(
      (cred) => cred.type === "menuai"
    );
    if (!credential) {
      showAlertDialog(this, {
        title: "No MenuAI credentials found.",
      });
      return;
    }
    const newUsername = await showPromptDialog(this, {
      inputLabel: this.menuai.localize(
        "ui.panel.config.users.change_username.new_username"
      ),
      confirmText: this.menuai.localize(
        "ui.panel.config.users.change_username.change"
      ),
      title: this.menuai.localize(
        "ui.panel.config.users.change_username.caption"
      ),
      defaultValue: this._params!.entry.username!,
    });
    if (newUsername) {
      try {
        await adminChangeUsername(
          this.menuai,
          this._params!.entry.id,
          newUsername
        );
        this._params = {
          ...this._params!,
          entry: { ...this._params!.entry, username: newUsername },
        };
        this._params.replaceEntry(this._params.entry);
        showAlertDialog(this, {
          text: this.menuai.localize(
            "ui.panel.config.users.change_username.username_changed"
          ),
        });
      } catch (err: any) {
        showAlertDialog(this, {
          title: this.menuai.localize(
            "ui.panel.config.users.change_username.failed"
          ),
          text: err.message,
        });
      }
    }
  }

  private async _changePassword() {
    const credential = this._params?.entry.credentials.find(
      (cred) => cred.type === "menuai"
    );
    if (!credential) {
      showAlertDialog(this, {
        title: "No MenuAI credentials found.",
      });
      return;
    }

    showAdminChangePasswordDialog(this, { userId: this._params!.entry.id });
  }

  private _close(): void {
    this._params = undefined;
  }

  static get styles(): CSSResultGroup {
    return [
      haStyleDialog,
      css`
        ha-dialog {
          --mdc-dialog-max-width: 500px;
        }
        .form {
          padding-top: 16px;
        }
        .secondary {
          color: var(--secondary-text-color);
        }
        ha-textfield {
          display: block;
        }
        .badge-container {
          margin-top: 4px;
        }
        .badge-container > * {
          margin-top: 4px;
          margin-bottom: 4px;
          margin-right: 4px;
          margin-left: 0;
          margin-inline-end: 4px;
          margin-inline-start: 0;
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
    "dialog-user-detail": DialogUserDetail;
  }
}
