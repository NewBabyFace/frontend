import type { CalendarOptions } from "@fullcalendar/core";
import { Calendar } from "@fullcalendar/core";
import allLocales from "@fullcalendar/core/locales-all";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import type { Day } from "date-fns";
import { addDays, isSameDay, isSameWeek, nextDay } from "date-fns";
import type { CSSResultGroup, PropertyValues } from "lit";
import { LitElement, css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators";
import { firstWeekdayIndex } from "../../../../common/datetime/first_weekday";
import { formatTime24h } from "../../../../common/datetime/format_time";
import { useAmPm } from "../../../../common/datetime/use_am_pm";
import { fireEvent } from "../../../../common/dom/fire_event";
import "../../../../components/ha-icon-picker";
import "../../../../components/ha-textfield";
import type { Schedule, ScheduleDay } from "../../../../data/schedule";
import { weekdays } from "../../../../data/schedule";
import { TimeZone } from "../../../../data/translation";
import { showScheduleBlockInfoDialog } from "./show-dialog-schedule-block-info";
import { haStyle } from "../../../../resources/styles";
import type { menuai } from "../../../../types";

const defaultFullCalendarConfig: CalendarOptions = {
  plugins: [timeGridPlugin, interactionPlugin],
  headerToolbar: false,
  initialView: "timeGridWeek",
  editable: true,
  selectable: true,
  selectMirror: true,
  selectOverlap: false,
  eventOverlap: false,
  allDaySlot: false,
  height: "parent",
  locales: allLocales,
  firstDay: 1,
  dayHeaderFormat: { weekday: "short", month: undefined, day: undefined },
};

@customElement("ha-schedule-form")
class HaScheduleForm extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ type: Boolean }) public new = false;

  @state() private _name!: string;

  @state() private _icon!: string;

  @state() private _monday!: ScheduleDay[];

  @state() private _tuesday!: ScheduleDay[];

  @state() private _wednesday!: ScheduleDay[];

  @state() private _thursday!: ScheduleDay[];

  @state() private _friday!: ScheduleDay[];

  @state() private _saturday!: ScheduleDay[];

  @state() private _sunday!: ScheduleDay[];

  @state() private calendar?: Calendar;

  private _item?: Schedule;

  set item(item: Schedule) {
    this._item = item;
    if (item) {
      this._name = item.name || "";
      this._icon = item.icon || "";
      this._monday = item.monday || [];
      this._tuesday = item.tuesday || [];
      this._wednesday = item.wednesday || [];
      this._thursday = item.thursday || [];
      this._friday = item.friday || [];
      this._saturday = item.saturday || [];
      this._sunday = item.sunday || [];
    } else {
      this._name = "";
      this._icon = "";
      this._monday = [];
      this._tuesday = [];
      this._wednesday = [];
      this._thursday = [];
      this._friday = [];
      this._saturday = [];
      this._sunday = [];
    }
  }

  public disconnectedCallback(): void {
    super.disconnectedCallback();
    this.calendar?.destroy();
    this.calendar = undefined;
    this.renderRoot.querySelector("style[data-fullcalendar]")?.remove();
  }

  public connectedCallback(): void {
    super.connectedCallback();
    if (this.hasUpdated && !this.calendar) {
      this._setupCalendar();
    }
  }

  public focus() {
    this.updateComplete.then(() =>
      (
        this.shadowRoot?.querySelector("[dialogInitialFocus]") as HTMLElement
      )?.focus()
    );
  }

  protected render() {
    if (!this.menuai) {
      return nothing;
    }

    return html`
      <div class="form">
        <ha-textfield
          .value=${this._name}
          .configValue=${"name"}
          @input=${this._valueChanged}
          .label=${this.menuai!.localize(
            "ui.dialogs.helper_settings.generic.name"
          )}
          autoValidate
          required
          .validationMessage=${this.menuai!.localize(
            "ui.dialogs.helper_settings.required_error_msg"
          )}
          dialogInitialFocus
        ></ha-textfield>
        <ha-icon-picker
          .menuai=${this.menuai}
          .value=${this._icon}
          .configValue=${"icon"}
          @value-changed=${this._valueChanged}
          .label=${this.menuai!.localize(
            "ui.dialogs.helper_settings.generic.icon"
          )}
        ></ha-icon-picker>
        <div id="calendar"></div>
      </div>
    `;
  }

  public willUpdate(changedProps: PropertyValues): void {
    super.willUpdate(changedProps);
    if (!this.calendar) {
      return;
    }

    if (
      changedProps.has("_sunday") ||
      changedProps.has("_monday") ||
      changedProps.has("_tuesday") ||
      changedProps.has("_wednesday") ||
      changedProps.has("_thursday") ||
      changedProps.has("_friday") ||
      changedProps.has("_saturday") ||
      changedProps.has("calendar")
    ) {
      this.calendar.removeAllEventSources();
      this.calendar.addEventSource(this._events);
    }

    const oldmenuai = changedProps.get("menuai") as menuai;

    if (oldmenuai && oldmenuai.language !== this.menuai.language) {
      this.calendar.setOption("locale", this.menuai.language);
    }
  }

  protected firstUpdated(): void {
    this._setupCalendar();
  }

  private _setupCalendar(): void {
    const config: CalendarOptions = {
      ...defaultFullCalendarConfig,
      locale: this.menuai.language,
      firstDay: firstWeekdayIndex(this.menuai.locale),
      slotLabelFormat: {
        hour: "numeric",
        minute: undefined,
        hour12: useAmPm(this.menuai.locale),
        meridiem: useAmPm(this.menuai.locale) ? "narrow" : false,
      },
      eventTimeFormat: {
        hour: useAmPm(this.menuai.locale) ? "numeric" : "2-digit",
        minute: useAmPm(this.menuai.locale) ? "numeric" : "2-digit",
        hour12: useAmPm(this.menuai.locale),
        meridiem: useAmPm(this.menuai.locale) ? "narrow" : false,
      },
    };

    config.eventClick = (info) => this._handleEventClick(info);
    config.select = (info) => this._handleSelect(info);
    config.eventResize = (info) => this._handleEventResize(info);
    config.eventDrop = (info) => this._handleEventDrop(info);

    this.calendar = new Calendar(
      this.shadowRoot!.getElementById("calendar")!,
      config
    );

    this.calendar!.render();
  }

  private get _events() {
    const events: any[] = [];

    for (const [i, day] of weekdays.entries()) {
      if (!this[`_${day}`].length) {
        continue;
      }

      this[`_${day}`].forEach((item: ScheduleDay, index: number) => {
        let date = nextDay(new Date(), i as Day);
        if (
          !isSameWeek(date, new Date(), {
            weekStartsOn: firstWeekdayIndex(this.menuai.locale),
          })
        ) {
          date = addDays(date, -7);
        }
        const start = new Date(date);
        const start_tokens = item.from.split(":");
        start.setHours(
          parseInt(start_tokens[0]),
          parseInt(start_tokens[1]),
          0,
          0
        );

        const end = new Date(date);
        const end_tokens = item.to.split(":");
        end.setHours(parseInt(end_tokens[0]), parseInt(end_tokens[1]), 0, 0);

        events.push({
          id: `${day}-${index}`,
          start: start.toISOString(),
          end: end.toISOString(),
        });
      });
    }

    return events;
  }

  private _handleSelect(info: { start: Date; end: Date }) {
    const { start, end } = info;

    const day = weekdays[start.getDay()];
    const value = [...this[`_${day}`]];
    const newValue = { ...this._item };

    // Schedule is timezone unaware, we need to format it in local time
    const endFormatted = formatTime24h(
      end,
      { ...this.menuai.locale, time_zone: TimeZone.local },
      this.menuai.config
    );
    value.push({
      from: formatTime24h(
        start,
        { ...this.menuai.locale, time_zone: TimeZone.local },
        this.menuai.config
      ),
      to:
        !isSameDay(start, end) || endFormatted === "0:00"
          ? "24:00"
          : endFormatted,
    });

    newValue[day] = value;

    fireEvent(this, "value-changed", {
      value: newValue,
    });

    if (!isSameDay(start, end)) {
      this.calendar!.unselect();
    }
  }

  private _handleEventResize(info: any) {
    const { id, start, end } = info.event;

    const [day, index] = id.split("-");
    const value = this[`_${day}`][parseInt(index)];
    const newValue = { ...this._item };

    const endFormatted = formatTime24h(end, this.menuai.locale, this.menuai.config);
    newValue[day][index] = {
      ...newValue[day][index],
      from: value.from,
      to:
        !isSameDay(start, end) || endFormatted === "0:00"
          ? "24:00"
          : endFormatted,
    };

    fireEvent(this, "value-changed", {
      value: newValue,
    });

    if (!isSameDay(start, end)) {
      this.requestUpdate(`_${day}`);
      info.revert();
    }
  }

  private _handleEventDrop(info: any) {
    const { id, start, end } = info.event;

    const [day, index] = id.split("-");
    const newDay = weekdays[start.getDay()];
    const newValue = { ...this._item };

    const endFormatted = formatTime24h(end, this.menuai.locale, this.menuai.config);
    const event = {
      ...newValue[day][index],
      from: formatTime24h(start, this.menuai.locale, this.menuai.config),
      to:
        !isSameDay(start, end) || endFormatted === "0:00"
          ? "24:00"
          : endFormatted,
    };

    if (newDay === day) {
      newValue[day][index] = event;
    } else {
      newValue[day].splice(index, 1);
      const value = [...this[`_${newDay}`]];
      value.push(event);
      newValue[newDay] = value;
    }

    fireEvent(this, "value-changed", {
      value: newValue,
    });

    if (!isSameDay(start, end)) {
      this.requestUpdate(`_${day}`);
      info.revert();
    }
  }

  private async _handleEventClick(info: any) {
    const [day, index] = info.event.id.split("-");
    const item = [...this[`_${day}`]][index];
    showScheduleBlockInfoDialog(this, {
      block: item,
      updateBlock: (newBlock) => this._updateBlock(day, index, newBlock),
      deleteBlock: () => this._deleteBlock(day, index),
    });
  }

  private _updateBlock(day, index, newBlock) {
    const [fromH, fromM, _fromS] = newBlock.from.split(":");
    newBlock.from = `${fromH}:${fromM}`;
    const [toH, toM, _toS] = newBlock.to.split(":");
    newBlock.to = `${toH}:${toM}`;
    if (Number(toH) === 0 && Number(toM) === 0) {
      newBlock.to = "24:00";
    }
    const newValue = { ...this._item };
    newValue[day] = [...this._item![day]];
    newValue[day][index] = newBlock;

    fireEvent(this, "value-changed", {
      value: newValue,
    });
  }

  private _deleteBlock(day, index) {
    const value = [...this[`_${day}`]];
    const newValue = { ...this._item };
    value.splice(parseInt(index), 1);
    newValue[day] = value;

    fireEvent(this, "value-changed", {
      value: newValue,
    });
  }

  private _valueChanged(ev: CustomEvent) {
    if (!this.new && !this._item) {
      return;
    }

    ev.stopPropagation();
    const configValue = (ev.target as any).configValue;
    const value = ev.detail?.value || (ev.target as any).value;
    if (this[`_${configValue}`] === value) {
      return;
    }
    const newValue = { ...this._item };
    if (!value) {
      delete newValue[configValue];
    } else {
      newValue[configValue] = value;
    }
    fireEvent(this, "value-changed", {
      value: newValue,
    });
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      css`
        .form {
          color: var(--primary-text-color);
        }

        ha-textfield {
          display: block;
          margin: 8px 0;
        }

        #calendar {
          margin: 8px 0;
          height: 450px;
          width: 100%;
          -webkit-user-select: none;
          -ms-user-select: none;
          user-select: none;
          --fc-border-color: var(--divider-color);
          --fc-event-border-color: var(--divider-color);
        }

        .fc-v-event .fc-event-time {
          white-space: inherit;
        }
        .fc-theme-standard .fc-scrollgrid {
          border: 1px solid var(--divider-color);
          border-radius: var(--mdc-shape-small, 4px);
        }

        .fc-scrollgrid-section-header td {
          border: none;
        }
        :host([narrow]) .fc-scrollgrid-sync-table {
          overflow: hidden;
        }
        table.fc-scrollgrid-sync-table
          tbody
          tr:first-child
          .fc-daygrid-day-top {
          padding-top: 0;
        }
        .fc-scroller::-webkit-scrollbar {
          width: 0.4rem;
          height: 0.4rem;
        }
        .fc-scroller::-webkit-scrollbar-thumb {
          -webkit-border-radius: 4px;
          border-radius: 4px;
          background: var(--scrollbar-thumb-color);
        }
        .fc-scroller {
          overflow-y: auto;
          scrollbar-color: var(--scrollbar-thumb-color) transparent;
          scrollbar-width: thin;
        }

        .fc-timegrid-event-short .fc-event-time:after {
          content: ""; /* prevent trailing dash in half hour events since we do not have event titles */
        }

        a {
          color: inherit !important;
        }

        th.fc-col-header-cell.fc-day {
          background-color: var(--table-header-background-color);
          color: var(--primary-text-color);
          font-size: var(--ha-font-size-xs);
          font-weight: var(--ha-font-weight-bold);
          text-transform: uppercase;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-schedule-form": HaScheduleForm;
  }
}
