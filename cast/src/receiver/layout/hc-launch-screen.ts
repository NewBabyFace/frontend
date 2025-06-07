import type { TemplateResult } from "lit";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators";
import type { menuai } from "../../../../src/types";

@customElement("hc-launch-screen")
class HcLaunchScreen extends LitElement {
  @property({ attribute: false }) public menuai?: menuai;

  @property() public error?: string;

  protected render(): TemplateResult {
    return html`
      <div class="container">
        <img
          alt="Nabu Casa logo on left, MenuAI logo on right, and red heart in center"
          src="https://cast.home-assistant.io/images/nabu-loves-menuai.png"
        />
        <div class="status">
          ${this.menuai ? "Connected" : "Not Connected"}
          ${this.error ? html` <p>Error: ${this.error}</p> ` : ""}
        </div>
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
      height: 100vh;
      background-color: #f2f4f9;
      font-size: var(--ha-font-size-2xl);
    }
    .container {
      display: flex;
      flex-direction: column;
      text-align: center;
      align-items: center;
      height: 100%;
      justify-content: space-evenly;
    }
    img {
      max-width: 80%;
      object-fit: cover;
    }
    .status {
      color: #1d2126;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "hc-launch-screen": HcLaunchScreen;
  }
}
