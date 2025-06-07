import { mdiCheckCircle, mdiCloseCircleOutline, mdiDelete } from "@mdi/js";
import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators";
import memoizeOne from "memoize-one";
import type { DataTableColumnContainer } from "../../../../../components/data-table/ha-data-table";
import type { ZwaveJSProvisioningEntry } from "../../../../../data/zwave_js";
import {
  fetchZwaveProvisioningEntries,
  SecurityClass,
  unprovisionZwaveSmartStartNode,
} from "../../../../../data/zwave_js";
import type { LocalizeFunc } from "../../../../../common/translations/localize";
import { showConfirmationDialog } from "../../../../../dialogs/generic/show-dialog-box";
import "../../../../../layouts/menuai-tabs-subpage-data-table";
import type { menuai, Route } from "../../../../../types";
import { configTabs } from "./zwave_js-config-router";

@customElement("zwave_js-provisioned")
class ZWaveJSProvisioned extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: false }) public route!: Route;

  @property({ type: Boolean }) public narrow = false;

  @property({ attribute: false }) public configEntryId!: string;

  @state() private _provisioningEntries: ZwaveJSProvisioningEntry[] = [];

  protected render() {
    return html`
      <menuai-tabs-subpage-data-table
        .menuai=${this.menuai}
        .narrow=${this.narrow}
        .route=${this.route}
        .tabs=${configTabs}
        .columns=${this._columns(this.menuai.localize)}
        .data=${this._provisioningEntries}
      >
      </menuai-tabs-subpage-data-table>
    `;
  }

  private _columns = memoizeOne(
    (
      localize: LocalizeFunc
    ): DataTableColumnContainer<ZwaveJSProvisioningEntry> => ({
      included: {
        showNarrow: true,
        title: localize("ui.panel.config.zwave_js.provisioned.included"),
        type: "icon",
        template: (entry) =>
          entry.nodeId
            ? html`
                <ha-svg-icon
                  .label=${this.menuai.localize(
                    "ui.panel.config.zwave_js.provisioned.included"
                  )}
                  .path=${mdiCheckCircle}
                ></ha-svg-icon>
              `
            : html`
                <ha-svg-icon
                  .label=${this.menuai.localize(
                    "ui.panel.config.zwave_js.provisioned.not_included"
                  )}
                  .path=${mdiCloseCircleOutline}
                ></ha-svg-icon>
              `,
      },
      dsk: {
        main: true,
        title: localize("ui.panel.config.zwave_js.provisioned.dsk"),
        sortable: true,
        filterable: true,
        flex: 2,
      },
      security_classes: {
        title: localize(
          "ui.panel.config.zwave_js.provisioned.security_classes"
        ),
        filterable: true,
        sortable: true,
        template: (entry) => {
          const securityClasses = entry.securityClasses;
          return securityClasses
            .map((secClass) =>
              this.menuai.localize(
                `ui.panel.config.zwave_js.security_classes.${SecurityClass[secClass]}.title`
              )
            )
            .join(", ");
        },
      },
      unprovision: {
        showNarrow: true,
        title: localize("ui.panel.config.zwave_js.provisioned.unprovision"),
        type: "icon-button",
        template: (entry) => html`
          <ha-icon-button
            .label=${this.menuai.localize(
              "ui.panel.config.zwave_js.provisioned.unprovision"
            )}
            .path=${mdiDelete}
            .provisioningEntry=${entry}
            @click=${this._unprovision}
          ></ha-icon-button>
        `,
      },
    })
  );

  protected firstUpdated(changedProps) {
    super.firstUpdated(changedProps);
    this._fetchData();
  }

  private async _fetchData() {
    this._provisioningEntries = await fetchZwaveProvisioningEntries(
      this.menuai!,
      this.configEntryId
    );
  }

  private _unprovision = async (ev) => {
    const dsk = ev.currentTarget.provisioningEntry.dsk;

    const confirm = await showConfirmationDialog(this, {
      title: this.menuai.localize(
        "ui.panel.config.zwave_js.provisioned.confirm_unprovision_title"
      ),
      text: this.menuai.localize(
        "ui.panel.config.zwave_js.provisioned.confirm_unprovision_text"
      ),
      confirmText: this.menuai.localize(
        "ui.panel.config.zwave_js.provisioned.unprovison"
      ),
    });

    if (!confirm) {
      return;
    }

    await unprovisionZwaveSmartStartNode(this.menuai, this.configEntryId, dsk);
    this._fetchData();
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "zwave_js-provisioned": ZWaveJSProvisioned;
  }
}
