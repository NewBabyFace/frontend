import type { TemplateResult } from "lit";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators";
import "./cloud-forgot-password-card";
import "../../../../layouts/menuai-subpage";
import { haStyle } from "../../../../resources/styles";
import type { menuai } from "../../../../types";

@customElement("cloud-forgot-password")
export class CloudForgotPassword extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ type: Boolean }) public narrow = false;

  @property() public email?: string;

  @state() public _requestInProgress = false;

  protected render(): TemplateResult {
    return html`
      <menuai-subpage
        .menuai=${this.menuai}
        .narrow=${this.narrow}
        .header=${this.menuai.localize(
          "ui.panel.config.cloud.forgot_password.title"
        )}
      >
        <div class="content">
          <cloud-forgot-password-card
            .menuai=${this.menuai}
            .localize=${this.menuai.localize}
            .email=${this.email}
          ></cloud-forgot-password-card>
        </div>
      </menuai-subpage>
    `;
  }

  static get styles() {
    return [
      haStyle,
      css`
        .content {
          padding-bottom: 24px;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "cloud-forgot-password": CloudForgotPassword;
  }
}
