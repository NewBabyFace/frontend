import type { CSSResultGroup } from "lit";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators";
import { createCloseHeading } from "../../../../src/components/ha-dialog";
import "../../../../src/components/ha-markdown";
import { haStyleDialog } from "../../../../src/resources/styles";
import type { menuai } from "../../../../src/types";
import { menuaiioStyle } from "../../resources/menuaiio-style";
import type { menuaiioMarkdownDialogParams } from "./show-dialog-menuaiio-markdown";

@customElement("dialog-menuaiio-markdown")
class menuaiioMarkdownDialog extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  // eslint-disable-next-line lit/no-native-attributes
  @property() public title!: string;

  @property() public content!: string;

  @state() private _opened = false;

  public showDialog(params: menuaiioMarkdownDialogParams) {
    this.title = params.title;
    this.content = params.content;
    this._opened = true;
  }

  public closeDialog() {
    this._opened = false;
  }

  protected render() {
    if (!this._opened) {
      return nothing;
    }
    return html`
      <ha-dialog
        open
        @closed=${this.closeDialog}
        .heading=${createCloseHeading(this.menuai, this.title)}
        hideactions
      >
        <ha-markdown
          .content=${this.content || ""}
          dialogInitialFocus
        ></ha-markdown>
      </ha-dialog>
    `;
  }

  static get styles(): CSSResultGroup {
    return [
      haStyleDialog,
      menuaiioStyle,
      css`
        @media all and (max-width: 450px), all and (max-height: 500px) {
          ha-markdown {
            padding: 16px;
          }
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dialog-menuaiio-markdown": menuaiioMarkdownDialog;
  }
}
