/* eslint-disable lit/lifecycle-super */
import { customElement } from "lit/decorators";
import { navigate } from "../../../../../../common/navigate";
import type { menuai } from "../../../../../../types";
import { showZWaveJSAddNodeDialog } from "./show-dialog-zwave_js-add-node";

@customElement("zwave_js-add-node")
export class DialogZWaveJSAddNode extends HTMLElement {
  public menuai!: menuai;

  public configEntryId!: string;

  connectedCallback() {
    this._openDialog();
  }

  private async _openDialog() {
    await navigate(
      `/config/devices/dashboard?config_entry=${this.configEntryId}`,
      {
        replace: true,
      }
    );

    showZWaveJSAddNodeDialog(this, {
      entry_id: this.configEntryId,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "zwave_js-add-node": DialogZWaveJSAddNode;
  }
}
