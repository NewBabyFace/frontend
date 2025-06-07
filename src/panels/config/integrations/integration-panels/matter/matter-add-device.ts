/* eslint-disable lit/lifecycle-super */
import { customElement } from "lit/decorators";
import { navigate } from "../../../../../common/navigate";
import type { menuai } from "../../../../../types";
import { showMatterAddDeviceDialog } from "./show-dialog-add-matter-device";

@customElement("matter-add-device")
export class MatterAddDevice extends HTMLElement {
  public menuai!: menuai;

  connectedCallback() {
    showMatterAddDeviceDialog(this);
    navigate(`/config/devices`, {
      replace: true,
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "matter-add-device": MatterAddDevice;
  }
}
