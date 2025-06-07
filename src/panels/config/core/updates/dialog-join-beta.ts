import "@material/mwc-button/mwc-button";
import { mdiOpenInNew } from "@mdi/js";
import type { CSSResultGroup } from "lit";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators";
import { fireEvent } from "../../../../common/dom/fire_event";
import "../../../../components/ha-alert";
import { createCloseHeading } from "../../../../components/ha-dialog";
import type { menuaiDialog } from "../../../../dialogs/make-dialog-manager";
import { haStyleDialog } from "../../../../resources/styles";
import type { menuai } from "../../../../types";
import { documentationUrl } from "../../../../util/documentation-url";
import type { JoinBetaDialogParams } from "./show-dialog-join-beta";

@customElement("dialog-join-beta")
export class DialogJoinBeta
  extends LitElement
  implements menuaiDialog<JoinBetaDialogParams>
{
  @property({ attribute: false }) public menuai!: menuai;

  @state() private _dialogParams?: JoinBetaDialogParams;

  public showDialog(dialogParams: JoinBetaDialogParams): void {
    this._dialogParams = dialogParams;
  }

  public closeDialog() {
    this._dialogParams = undefined;
    fireEvent(this, "dialog-closed", { dialog: this.localName });
    return true;
  }

  protected render() {
    if (!this._dialogParams) {
      return nothing;
    }

    return html`
      <ha-dialog
        open
        @closed=${this.closeDialog}
        .heading=${createCloseHeading(
          this.menuai,
          this.menuai.localize("ui.dialogs.join_beta_channel.title")
        )}
      >
        <ha-alert alert-type="warning">
          ${this.menuai.localize("ui.dialogs.join_beta_channel.backup")}
        </ha-alert>
        <p>
          ${this.menuai.localize("ui.dialogs.join_beta_channel.warning")}.<br />
          ${this.menuai.localize("ui.dialogs.join_beta_channel.release_items")}
        </p>
        <ul>
          <li>MenuAI Core</li>
          <li>MenuAI Supervisor</li>
          <li>MenuAI Operating System</li>
        </ul>
        <a
          href=${documentationUrl(this.menuai!, "/faq/release/")}
          target="_blank"
          rel="noreferrer"
        >
          ${this.menuai!.localize(
            "ui.dialogs.join_beta_channel.view_documentation"
          )}
          <ha-svg-icon .path=${mdiOpenInNew}></ha-svg-icon>
        </a>
        <mwc-button slot="primaryAction" @click=${this._cancel}>
          ${this.menuai.localize("ui.common.cancel")}
        </mwc-button>
        <mwc-button slot="primaryAction" @click=${this._join}>
          ${this.menuai.localize("ui.dialogs.join_beta_channel.join")}
        </mwc-button>
      </ha-dialog>
    `;
  }

  private _cancel() {
    this._dialogParams?.cancel?.();
    this.closeDialog();
  }

  private _join() {
    this._dialogParams?.join?.();
    this.closeDialog();
  }

  static get styles(): CSSResultGroup {
    return [
      haStyleDialog,
      css`
        a {
          text-decoration: none;
        }
        a ha-svg-icon {
          --mdc-icon-size: 16px;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dialog-join-beta": DialogJoinBeta;
  }
}
