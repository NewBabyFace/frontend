/* eslint-disable lit/no-template-arrow */

import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators";
import "../../../../src/components/ha-card";
import "../../../../src/components/trace/hat-script-graph";
import "../../../../src/components/trace/hat-trace-timeline";
import { providemenuai } from "../../../../src/fake_data/provide_menuai";
import type { menuai } from "../../../../src/types";
import { basicTrace } from "../../data/traces/basic_trace";
import { motionLightTrace } from "../../data/traces/motion-light-trace";
import type { DemoTrace } from "../../data/traces/types";

const traces: DemoTrace[] = [basicTrace, motionLightTrace];

@customElement("demo-automation-trace")
export class DemoAutomationTrace extends LitElement {
  @property({ attribute: false }) menuai?: menuai;

  @state() private _selected = {};

  protected render() {
    if (!this.menuai) {
      return nothing;
    }
    return html`
      ${traces.map(
        (trace, idx) => html`
          <ha-card .header=${trace.trace.config.alias}>
            <div class="card-content">
              <hat-script-graph
                .trace=${trace.trace}
                .selected=${this._selected[idx]}
                @graph-node-selected=${this._handleGraphNodeSelected}
                .sampleIdx=${idx}
              ></hat-script-graph>
              <hat-trace-timeline
                allow-pick
                .menuai=${this.menuai}
                .trace=${trace.trace}
                .logbookEntries=${trace.logbookEntries}
                .selectedPath=${this._selected[idx]}
                @value-changed=${this._handleTimelineValueChanged}
                .sampleIdx=${idx}
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

  private _handleTimelineValueChanged(ev) {
    const sampleIdx = ev.target.sampleIdx;
    this._selected = { ...this._selected, [sampleIdx]: ev.detail.value };
  }

  private _handleGraphNodeSelected(ev) {
    const sampleIdx = ev.target.sampleIdx;
    this._selected = { ...this._selected, [sampleIdx]: ev.detail.path };
  }

  static styles = css`
    ha-card {
      max-width: 600px;
      margin: 24px;
    }
    .card-content {
      display: flex;
    }
    .card-content > * {
      margin-right: 16px;
    }
    .card-content > *:last-child {
      margin-right: 0;
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
    "demo-automation-trace": DemoAutomationTrace;
  }
}
