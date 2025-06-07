import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators";
import { isComponentLoaded } from "../../../common/config/is_component_loaded";
import type { CloudStatus } from "../../../data/cloud";
import type { ExposeEntitySettings } from "../../../data/expose";

import "../../../layouts/menuai-loading-screen";
import "../../../layouts/menuai-tabs-subpage";
import type { menuai, Route } from "../../../types";
import "./assist-pref";
import "./cloud-alexa-pref";
import "./cloud-discover";
import "./cloud-google-pref";
import { voiceAssistantTabs } from "./ha-config-voice-assistants";

@customElement("ha-config-voice-assistants-assistants")
export class HaConfigVoiceAssistantsAssistants extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: false }) public cloudStatus?: CloudStatus;

  @property({ attribute: false }) public exposedEntities?: Record<
    string,
    ExposeEntitySettings
  >;

  @property({ attribute: "is-wide", type: Boolean }) public isWide = false;

  @property({ type: Boolean }) public narrow = false;

  @property({ attribute: false }) public route!: Route;

  protected render() {
    if (!this.menuai) {
      return html`<menuai-loading-screen></menuai-loading-screen>`;
    }

    return html`
      <menuai-tabs-subpage
        .menuai=${this.menuai}
        .narrow=${this.narrow}
        back-path="/config"
        .route=${this.route}
        .tabs=${voiceAssistantTabs}
      >
        <div class="content">
          ${isComponentLoaded(this.menuai, "assist_pipeline")
            ? html`
                <assist-pref
                  .menuai=${this.menuai}
                  .cloudStatus=${this.cloudStatus}
                  .exposedEntities=${this.exposedEntities}
                ></assist-pref>
              `
            : nothing}
          ${this.cloudStatus?.logged_in
            ? html`
                <cloud-alexa-pref
                  .menuai=${this.menuai}
                  .exposedEntities=${this.exposedEntities}
                  .cloudStatus=${this.cloudStatus}
                ></cloud-alexa-pref>
                <cloud-google-pref
                  .menuai=${this.menuai}
                  .exposedEntities=${this.exposedEntities}
                  .cloudStatus=${this.cloudStatus}
                ></cloud-google-pref>
              `
            : html`<cloud-discover .menuai=${this.menuai}></cloud-discover>`}
        </div>
      </menuai-tabs-subpage>
    `;
  }

  static styles = css`
    .content {
      padding: 28px 20px 0;
      max-width: 1040px;
      margin: 0 auto;
    }
    .content > * {
      display: block;
      margin: auto;
      max-width: 800px;
      margin-bottom: 24px;
    }
    a {
      text-decoration: none;
      color: inherit;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-config-voice-assistants-assistants": HaConfigVoiceAssistantsAssistants;
  }
}
