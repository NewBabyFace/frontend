import type { menuaiEvent } from "home-assistant-js-websocket";
import type { TemplateResult } from "lit";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators";
import { repeat } from "lit/directives/repeat";
import { formatTime } from "../../../common/datetime/format_time";
import "../../../components/ha-card";
import "../../../components/ha-textfield";
import "../../../components/ha-yaml-editor";
import "../../../components/ha-button";
import "../../../components/ha-alert";
import type { menuai } from "../../../types";

@customElement("event-subscribe-card")
class EventSubscribeCard extends LitElement {
  @property({ attribute: false }) public menuai?: menuai;

  @state() private _eventType = "";

  @state() private _subscribed?: () => void;

  @state() private _events: {
    id: number;
    event: menuaiEvent;
  }[] = [];

  @state() private _error?: string;

  private _eventCount = 0;

  public disconnectedCallback() {
    super.disconnectedCallback();
    if (this._subscribed) {
      this._subscribed();
      this._subscribed = undefined;
    }
  }

  protected render(): TemplateResult {
    return html`
      <ha-card
        header=${this.menuai!.localize(
          "ui.panel.developer-tools.tabs.events.listen_to_events"
        )}
      >
        <div class="card-content">
          <ha-textfield
            .label=${this._subscribed
              ? this.menuai!.localize(
                  "ui.panel.developer-tools.tabs.events.listening_to"
                )
              : this.menuai!.localize(
                  "ui.panel.developer-tools.tabs.events.subscribe_to"
                )}
            .disabled=${this._subscribed !== undefined}
            .value=${this._eventType}
            @input=${this._valueChanged}
          ></ha-textfield>
          ${this._error
            ? html`<ha-alert alert-type="error">${this._error}</ha-alert>`
            : ""}
        </div>
        <div class="card-actions">
          <ha-button
            raised
            .disabled=${this._eventType === ""}
            @click=${this._startOrStopListening}
          >
            ${this._subscribed
              ? this.menuai!.localize(
                  "ui.panel.developer-tools.tabs.events.stop_listening"
                )
              : this.menuai!.localize(
                  "ui.panel.developer-tools.tabs.events.start_listening"
                )}
          </ha-button>
          <ha-button
            raised
            .disabled=${this._eventType === ""}
            @click=${this._clearEvents}
          >
            ${this.menuai!.localize(
              "ui.panel.developer-tools.tabs.events.clear_events"
            )}
          </ha-button>
        </div>
      </ha-card>
      <ha-card>
        <div class="card-content">
          <div class="events">
            ${repeat(
              this._events,
              (event) => event.id,
              (event) => html`
                <div class="event">
                  ${this.menuai!.localize(
                    "ui.panel.developer-tools.tabs.events.event_fired",
                    { name: event.id }
                  )}
                  ${formatTime(
                    new Date(event.event.time_fired),
                    this.menuai!.locale,
                    this.menuai!.config
                  )}:
                  <ha-yaml-editor
                    .defaultValue=${event.event}
                    read-only
                  ></ha-yaml-editor>
                </div>
              `
            )}
          </div>
        </div>
      </ha-card>
    `;
  }

  private _valueChanged(ev): void {
    this._eventType = ev.target.value;
    this._error = undefined;
  }

  private async _startOrStopListening(): Promise<void> {
    if (this._subscribed) {
      this._subscribed();
      this._subscribed = undefined;
      this._error = undefined;
    } else {
      try {
        this._subscribed =
          await this.menuai!.connection.subscribeEvents<menuaiEvent>((event) => {
            const tail =
              this._events.length > 30
                ? this._events.slice(0, 29)
                : this._events;
            this._events = [
              {
                event,
                id: this._eventCount++,
              },
              ...tail,
            ];
          }, this._eventType);
      } catch (error: any) {
        this._error = this.menuai!.localize(
          "ui.panel.developer-tools.tabs.events.subscribe_failed",
          { error: error.message || "Unknown error" }
        );
      }
    }
  }

  private _clearEvents(): void {
    this._events = [];
    this._eventCount = 0;
    this._error = undefined;
  }

  static styles = css`
    ha-textfield {
      display: block;
      margin-bottom: 16px;
    }
    .error-message {
      margin-top: 8px;
    }
    .event {
      border-top: 1px solid var(--divider-color);
      padding-top: 8px;
      padding-bottom: 8px;
      margin: 16px 0;
    }
    .event:last-child {
      border-bottom: 0;
      margin-bottom: 0;
    }
    pre {
      font-family: var(--ha-font-family-code);
    }
    ha-card {
      margin-bottom: 5px;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "event-subscribe-card": EventSubscribeCard;
  }
}
