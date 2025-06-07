import { css, LitElement } from "lit";
import { customElement, property } from "lit/decorators";
import type { menuai } from "../../types";

@customElement("hat-logbook-note")
class HatLogbookNote extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property() public domain: "automation" | "script" = "automation";

  render() {
    if (this.domain === "script") {
      return this.menuai.localize(
        "ui.panel.config.automation.trace.messages.not_all_entries_are_related_script_note"
      );
    }
    return this.menuai.localize(
      "ui.panel.config.automation.trace.messages.not_all_entries_are_related_automation_note"
    );
  }

  static styles = css`
    :host {
      display: block;
      text-align: center;
      font-style: italic;
      padding: 16px;
      margin-top: 8px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "hat-logbook-note": HatLogbookNote;
  }
}
