/* eslint-disable lit/no-template-arrow */

import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators";
import "../../../../src/components/ha-card";
import "../../../../src/components/trace/hat-trace-timeline";
import { providemenuai } from "../../../../src/fake_data/provide_menuai";
import type { menuai } from "../../../../src/types";
import { mockDemoTrace } from "../../data/traces/mock-demo-trace";
import type { DemoTrace } from "../../data/traces/types";

const traces: DemoTrace[] = [
  mockDemoTrace({ state: "running" }),
  mockDemoTrace({ state: "debugged" }),
  mockDemoTrace({ state: "stopped", script_execution: "failed_conditions" }),
  mockDemoTrace({ state: "stopped", script_execution: "failed_single" }),
  mockDemoTrace({ state: "stopped", script_execution: "failed_max_runs" }),
  mockDemoTrace({ state: "stopped", script_execution: "finished" }),
  mockDemoTrace({ state: "stopped", script_execution: "aborted" }),
  mockDemoTrace({
    state: "stopped",
    script_execution: "error",
    error: 'Variable "beer" cannot be None',
  }),
  mockDemoTrace({ state: "stopped", script_execution: "cancelled" }),
];

@customElement("demo-automation-trace-timeline")
export class DemoAutomationTraceTimeline extends LitElement {
  @property({ attribute: false }) menuai?: menuai;

  protected render() {
    if (!this.menuai) {
      return nothing;
    }
    return html`
      ${traces.map(
        (trace) => html`
          <ha-card .header=${trace.trace.config.alias}>
            <div class="card-content">
              <hat-trace-timeline
                .menuai=${this.menuai}
                .trace=${trace.trace}
                .logbookEntries=${trace.logbookEntries}
              ></hat-trace-timeline>
              <button @click=${() => console.log(trace)}>Log trace</button>
            </div>
          </ha-card>
        `
      )}
    `;
  }

  protected firstUpdated(changedProps) {
    super.firstUpdated(changedProps);
    const menuai = providemenuai(this);
    menuai.updateTranslations(null, "en");
    menuai.updateTranslations("config", "en");
  }

  static styles = css`
    ha-card {
      max-width: 600px;
      margin: 24px;
    }
    .card-content {
      display: flex;
    }
    button {
      position: absolute;
      top: 0;
      right: 0;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "demo-automation-trace-timeline": DemoAutomationTraceTimeline;
  }
}
