import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators";
import type { menuai, Route } from "../../../../types";
import "./assist-pipeline-debug";
import "./assist-pipeline-run-debug";

@customElement("assist-debug")
export class AssistDebug extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ type: Boolean }) public narrow = false;

  @property({ attribute: false }) public route!: Route;

  protected render() {
    const pipelineId = this.route.path.substring(1);
    if (pipelineId) {
      return html`<assist-pipeline-debug
        .menuai=${this.menuai}
        .narrow=${this.narrow}
        .pipelineId=${pipelineId}
      ></assist-pipeline-debug>`;
    }
    return html`<assist-pipeline-run-debug
      .menuai=${this.menuai}
      .narrow=${this.narrow}
    ></assist-pipeline-run-debug>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "assist-debug": AssistDebug;
  }
}
