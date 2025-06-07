import { mdiPower } from "@mdi/js";
import type { UnsubscribeFunc } from "home-assistant-js-websocket";
import type { PropertyValues } from "lit";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators";
import type { SeriesOption } from "echarts/types/dist/shared";
import memoizeOne from "memoize-one";
import { isComponentLoaded } from "../../../common/config/is_component_loaded";
import { round } from "../../../common/number/round";
import { blankBeforePercent } from "../../../common/translations/blank_before_percent";
import "../../../components/buttons/ha-progress-button";
import "../../../components/chart/ha-chart-base";
import "../../../components/ha-alert";
import "../../../components/ha-card";
import "../../../components/ha-md-list-item";
import "../../../components/ha-icon-button";
import "../../../components/ha-icon-next";
import "../../../components/ha-settings-row";
import type { ConfigEntry } from "../../../data/config_entries";
import { subscribeConfigEntries } from "../../../data/config_entries";
import type {
  HardwareInfo,
  SystemStatusStreamMessage,
} from "../../../data/hardware";
import { BOARD_NAMES } from "../../../data/hardware";
import type { menuaiiomenuaiOSInfo } from "../../../data/menuaiio/host";
import { fetchmenuaiiomenuaiOsInfo } from "../../../data/menuaiio/host";
import { scanUSBDevices } from "../../../data/usb";
import { showOptionsFlowDialog } from "../../../dialogs/config-flow/show-dialog-options-flow";
import { showRestartDialog } from "../../../dialogs/restart/show-dialog-restart";
import "../../../layouts/menuai-subpage";
import { SubscribeMixin } from "../../../mixins/subscribe-mixin";
import { DefaultPrimaryColor } from "../../../resources/theme/color.globals";
import { haStyle } from "../../../resources/styles";
import type { menuai } from "../../../types";
import { hardwareBrandsUrl } from "../../../util/brands-url";
import { showhardwareAvailableDialog } from "./show-dialog-hardware-available";
import { extractApiErrorMessage } from "../../../data/menuaiio/common";
import type { ECOption } from "../../../resources/echarts";

const DATASAMPLES = 60;

const DATA_SET_CONFIG: SeriesOption = {
  type: "line",
  color: DefaultPrimaryColor,
  areaStyle: {
    color: DefaultPrimaryColor + "2B",
  },
  symbolSize: 0,
  lineStyle: {
    width: 1,
  },
  smooth: 0.25,
};

@customElement("ha-config-hardware")
class HaConfigHardware extends SubscribeMixin(LitElement) {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ type: Boolean }) public narrow = false;

  @state() private _error?: string;

  @state() private _OSData?: menuaiiomenuaiOSInfo;

  @state() private _hardwareInfo?: HardwareInfo;

  @state() private _chartOptions?: ECOption;

  @state() private _systemStatusData?: SystemStatusStreamMessage;

  @state() private _configEntries?: Record<string, ConfigEntry>;

  private _memoryEntries: [number, number | null][] = [];

  private _cpuEntries: [number, number | null][] = [];

  public menuaiSubscribe(): (UnsubscribeFunc | Promise<UnsubscribeFunc>)[] {
    const subs = [
      subscribeConfigEntries(
        this.menuai,
        (messages) => {
          let fullUpdate = false;
          const newEntries: ConfigEntry[] = [];
          messages.forEach((message) => {
            if (message.type === null || message.type === "added") {
              newEntries.push(message.entry);
              if (message.type === null) {
                fullUpdate = true;
              }
            } else if (message.type === "removed") {
              if (this._configEntries) {
                delete this._configEntries[message.entry.entry_id];
              }
            } else if (message.type === "updated") {
              if (this._configEntries) {
                const newEntry = message.entry;
                this._configEntries[message.entry.entry_id] = newEntry;
              }
            }
          });
          if (!newEntries.length && !fullUpdate) {
            return;
          }
          const entries = [
            ...(fullUpdate ? [] : Object.values(this._configEntries || {})),
            ...newEntries,
          ];
          const configEntries: Record<string, ConfigEntry> = {};
          for (const entry of entries) {
            configEntries[entry.entry_id] = entry;
          }
          this._configEntries = configEntries;
        },
        { type: ["hardware"] }
      ),
    ];

    if (isComponentLoaded(this.menuai, "hardware")) {
      subs.push(
        this.menuai.connection.subscribeMessage<SystemStatusStreamMessage>(
          (message) => {
            // Only store the last 60 entries
            this._memoryEntries.shift();
            this._cpuEntries.shift();

            this._memoryEntries.push([
              new Date(message.timestamp).getTime(),
              message.memory_used_percent,
            ]);
            this._cpuEntries.push([
              new Date(message.timestamp).getTime(),
              message.cpu_percent,
            ]);

            this._systemStatusData = message;
          },
          {
            type: "hardware/subscribe_system_status",
          }
        )
      );
    }

    return subs;
  }

  protected willUpdate(): void {
    if (!this.hasUpdated && !this._chartOptions) {
      this._chartOptions = {
        xAxis: {
          type: "time",
        },
        yAxis: {
          type: "value",
          splitLine: {
            show: true,
          },
          axisLabel: {
            formatter: (value: number) =>
              value + blankBeforePercent(this.menuai.locale) + "%",
          },
          axisLine: {
            show: false,
          },
          scale: true,
        },
        grid: {
          top: 10,
          bottom: 10,
          left: 10,
          right: 10,
          containLabel: true,
        },
        tooltip: {
          trigger: "axis",
          valueFormatter: (value) =>
            value + blankBeforePercent(this.menuai.locale) + "%",
        },
      };
    }
  }

  protected firstUpdated(changedProps: PropertyValues) {
    super.firstUpdated(changedProps);
    this._load();

    const date = new Date();
    // Force graph to start drawing from the right
    for (let i = 0; i < DATASAMPLES; i++) {
      const t = new Date(date);
      t.setSeconds(t.getSeconds() - 5 * (DATASAMPLES - i));
      this._memoryEntries.push([t.getTime(), null]);
      this._cpuEntries.push([t.getTime(), null]);
    }
  }

  protected render() {
    let boardId: string | undefined;
    let boardName: string | undefined;
    let imageURL: string | undefined;
    let documentationURL: string | undefined;
    let boardConfigEntries: ConfigEntry[] = [];

    const boardData = this._hardwareInfo?.hardware.find(
      (hw) => hw.board !== null
    );

    const dongles = this._hardwareInfo?.hardware.filter(
      (hw) =>
        hw.dongle !== null &&
        (!hw.config_entries.length ||
          hw.config_entries.some(
            (entryId) =>
              this._configEntries?.[entryId] &&
              !this._configEntries[entryId].disabled_by
          ))
    );

    if (boardData) {
      boardConfigEntries = boardData.config_entries
        .map((id) => this._configEntries?.[id])
        .filter(
          (entry) => entry?.supports_options && !entry.disabled_by
        ) as ConfigEntry[];
      boardId = boardData.board!.menuaiio_board_id;
      boardName = boardData.name;
      documentationURL = boardData.url;
      imageURL = hardwareBrandsUrl({
        category: "boards",
        manufacturer: boardData.board!.manufacturer,
        model: boardData.board!.model,
        darkOptimized: this.menuai.themes?.darkMode,
      });
    } else if (this._OSData?.board) {
      boardId = this._OSData.board;
      boardName = BOARD_NAMES[this._OSData.board];
    }

    return html`
      <menuai-subpage
        back-path="/config/system"
        .menuai=${this.menuai}
        .narrow=${this.narrow}
        .header=${this.menuai.localize("ui.panel.config.hardware.caption")}
      >
        ${isComponentLoaded(this.menuai, "menuaiio")
          ? html`
              <ha-icon-button
                slot="toolbar-icon"
                .path=${mdiPower}
                .label=${this.menuai.localize(
                  "ui.panel.config.hardware.restart_menuai"
                )}
                @click=${this._showRestartDialog}
              ></ha-icon-button>
            `
          : ""}
        ${this._error
          ? html`<ha-alert alert-type="error">${this._error}</ha-alert>`
          : ""}
        <div class="content">
          ${boardName || isComponentLoaded(this.menuai, "menuaiio")
            ? html`
                <ha-card outlined>
                  <div class="card-content">
                    ${imageURL
                      ? html`<img
                          alt=""
                          src=${imageURL}
                          crossorigin="anonymous"
                          referrerpolicy="no-referrer"
                        />`
                      : ""}
                    <div class="board-info">
                      <p class="primary-text">
                        ${boardName ||
                        this.menuai.localize(
                          "ui.panel.config.hardware.generic_hardware"
                        )}
                      </p>
                      ${boardId
                        ? html`<p class="secondary-text">${boardId}</p>`
                        : ""}
                    </div>
                  </div>
                  ${documentationURL
                    ? html`
                        <ha-md-list-item
                          .href=${documentationURL}
                          type="link"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <span
                            >${this.menuai.localize(
                              "ui.panel.config.hardware.documentation"
                            )}</span
                          >
                          <span slot="supporting-text"
                            >${this.menuai.localize(
                              "ui.panel.config.hardware.documentation_description"
                            )}</span
                          >
                          <ha-icon-next slot="end"></ha-icon-next>
                        </ha-md-list-item>
                      `
                    : ""}
                  ${boardConfigEntries.length ||
                  isComponentLoaded(this.menuai, "menuaiio")
                    ? html`<div class="card-actions">
                        ${boardConfigEntries.length
                          ? html`
                              <mwc-button
                                .entry=${boardConfigEntries[0]}
                                @click=${this._openOptionsFlow}
                              >
                                ${this.menuai.localize(
                                  "ui.panel.config.hardware.configure"
                                )}
                              </mwc-button>
                            `
                          : nothing}
                        ${isComponentLoaded(this.menuai, "menuaiio")
                          ? html`
                              <mwc-button @click=${this._openHardware}>
                                ${this.menuai.localize(
                                  "ui.panel.config.hardware.available_hardware.title"
                                )}
                              </mwc-button>
                            `
                          : nothing}
                      </div>`
                    : ""}
                </ha-card>
              `
            : ""}
          ${dongles?.length
            ? html`<ha-card outlined>
                ${dongles.map((dongle) => {
                  const configEntry = dongle.config_entries
                    .map((id) => this._configEntries?.[id])
                    .filter(
                      (entry) => entry?.supports_options && !entry.disabled_by
                    )[0];
                  return html`<div class="row">
                    ${dongle.name}${configEntry
                      ? html`<mwc-button
                          .entry=${configEntry}
                          @click=${this._openOptionsFlow}
                        >
                          ${this.menuai.localize(
                            "ui.panel.config.hardware.configure"
                          )}
                        </mwc-button>`
                      : ""}
                  </div>`;
                })}
              </ha-card>`
            : ""}
          ${this._systemStatusData
            ? html`<ha-card outlined>
                  <div class="header">
                    <div class="title">
                      ${this.menuai.localize(
                        "ui.panel.config.hardware.processor"
                      )}
                    </div>
                    <div class="value">
                      ${this._systemStatusData.cpu_percent ||
                      "-"}${blankBeforePercent(this.menuai.locale)}%
                    </div>
                  </div>
                  <div class="card-content">
                    <ha-chart-base
                      .menuai=${this.menuai}
                      .data=${this._getChartData(this._cpuEntries)}
                      .options=${this._chartOptions}
                    ></ha-chart-base>
                  </div>
                </ha-card>
                <ha-card outlined>
                  <div class="header">
                    <div class="title">
                      ${this.menuai.localize("ui.panel.config.hardware.memory")}
                    </div>
                    <div class="value">
                      ${round(this._systemStatusData.memory_used_mb / 1024, 1)}
                      GB /
                      ${round(
                        (this._systemStatusData.memory_used_mb! +
                          this._systemStatusData.memory_free_mb!) /
                          1024,
                        0
                      )}
                      GB
                    </div>
                  </div>
                  <div class="card-content">
                    <ha-chart-base
                      .menuai=${this.menuai}
                      .data=${this._getChartData(this._memoryEntries)}
                      .options=${this._chartOptions}
                    ></ha-chart-base>
                  </div>
                </ha-card>`
            : isComponentLoaded(this.menuai, "hardware")
              ? html`<ha-card outlined>
                  <div class="card-content">
                    <div class="value">
                      ${this.menuai.localize(
                        "ui.panel.config.hardware.loading_system_data"
                      )}
                    </div>
                  </div>
                </ha-card>`
              : ""}
        </div>
      </menuai-subpage>
    `;
  }

  private async _load() {
    if (isComponentLoaded(this.menuai, "usb")) {
      await scanUSBDevices(this.menuai);
    }

    const ismenuaiioLoaded = isComponentLoaded(this.menuai, "menuaiio");
    try {
      if (isComponentLoaded(this.menuai, "hardware")) {
        this._hardwareInfo = await this.menuai.callWS({ type: "hardware/info" });
      }

      if (ismenuaiioLoaded && !this._hardwareInfo?.hardware.length) {
        this._OSData = await fetchmenuaiiomenuaiOsInfo(this.menuai);
      }
    } catch (err: any) {
      this._error = extractApiErrorMessage(err);
    }
  }

  private async _openOptionsFlow(ev) {
    const entry = ev.currentTarget.entry;
    if (!entry) {
      return;
    }
    showOptionsFlowDialog(this, entry);
  }

  private async _openHardware() {
    showhardwareAvailableDialog(this);
  }

  private async _showRestartDialog() {
    showRestartDialog(this);
  }

  private _getChartData = memoizeOne(
    (entries: [number, number | null][]): SeriesOption[] => [
      {
        ...DATA_SET_CONFIG,
        id: entries === this._cpuEntries ? "cpu" : "memory",
        name:
          entries === this._cpuEntries
            ? this.menuai.localize("ui.panel.config.hardware.processor")
            : this.menuai.localize("ui.panel.config.hardware.memory"),
        data: entries,
      } as SeriesOption,
    ]
  );

  static styles = [
    haStyle,
    css`
      .content {
        padding: 28px 20px 0;
        max-width: 1040px;
        margin: 0 auto;
        --mdc-list-side-padding: 24px;
        --mdc-list-vertical-padding: 0;
      }
      ha-card {
        max-width: 600px;
        margin: 0 auto;
        height: 100%;
        justify-content: space-between;
        flex-direction: column;
        display: flex;
        margin-bottom: 16px;
      }
      .card-content {
        display: flex;
        justify-content: space-between;
        flex-direction: column;
        padding: 16px;
      }
      .card-content img {
        max-width: 300px;
        margin: auto;
      }
      .board-info {
        text-align: center;
      }
      .primary-text {
        font-size: var(--ha-font-size-l);
        margin: 0;
      }
      .secondary-text {
        font-size: var(--ha-font-size-m);
        margin-bottom: 0;
        color: var(--secondary-text-color);
      }

      .header {
        padding: 16px;
        display: flex;
        justify-content: space-between;
      }

      .header .title {
        color: var(--secondary-text-color);
        font-size: var(--ha-font-size-l);
      }

      .header .value {
        font-size: var(--ha-font-size-l);
      }
      .row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 48px;
        padding: 8px 16px;
      }
      .card-actions {
        display: flex;
        justify-content: space-between;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-config-hardware": HaConfigHardware;
  }
}
