import { customElement, property, state } from "lit/decorators";
import { css, type CSSResultGroup, html, LitElement, nothing } from "lit";
import type { menuaiDialog } from "../../../../dialogs/make-dialog-manager";
import type { menuai } from "../../../../types";
import { fireEvent } from "../../../../common/dom/fire_event";
import { haStyle, haStyleDialog } from "../../../../resources/styles";
import { createCloseHeading } from "../../../../components/ha-dialog";
import "../trigger/ha-automation-trigger-row";
import type { PasteReplaceDialogParams } from "./show-dialog-paste-replace";

@customElement("ha-dialog-paste-replace")
class DialogPasteReplace extends LitElement implements menuaiDialog {
  @property({ attribute: false }) public menuai!: menuai;

  @state() private _opened = false;

  @state() private _params!: PasteReplaceDialogParams;

  public showDialog(params: PasteReplaceDialogParams): void {
    this._opened = true;
    this._params = params;
  }

  public closeDialog() {
    if (this._opened) {
      fireEvent(this, "dialog-closed", { dialog: this.localName });
    }
    this._opened = false;
    return true;
  }

  public render() {
    if (!this._opened) {
      return nothing;
    }

    return html`
      <ha-dialog
        open
        @closed=${this.closeDialog}
        .heading=${createCloseHeading(
          this.menuai,
          this.menuai.localize(
            `ui.panel.config.${this._params.domain}.editor.paste_confirm.title`
          )
        )}
      >
        <p>
          ${this.menuai.localize(
            `ui.panel.config.${this._params.domain}.editor.paste_confirm.text`
          )}
        </p>

        <ha-yaml-editor
          .menuai=${this.menuai}
          .defaultValue=${this._params?.pastedConfig}
          read-only
        ></ha-yaml-editor>

        <div slot="primaryAction">
          <ha-button @click=${this._handleAppend}>
            ${this.menuai.localize("ui.common.append")}
          </ha-button>
          <ha-button @click=${this._handleReplace}>
            ${this.menuai.localize("ui.common.replace")}
          </ha-button>
        </div>
      </ha-dialog>
    `;
  }

  private _handleReplace() {
    this._params?.onReplace();
    this.closeDialog();
  }

  private _handleAppend() {
    this._params?.onAppend();
    this.closeDialog();
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      haStyleDialog,
      css`
        h3 {
          margin: 0;
          font-size: inherit;
          font-weight: inherit;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-dialog-paste-replace": DialogPasteReplace;
  }
}
