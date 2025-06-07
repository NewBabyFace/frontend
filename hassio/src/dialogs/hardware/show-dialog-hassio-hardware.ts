import { fireEvent } from "../../../../src/common/dom/fire_event";
import type { menuaiioHardwareInfo } from "../../../../src/data/menuaiio/hardware";
import type { Supervisor } from "../../../../src/data/supervisor/supervisor";

export interface menuaiioHardwareDialogParams {
  supervisor: Supervisor;
  hardware: menuaiioHardwareInfo;
}

export const showmenuaiioHardwareDialog = (
  element: HTMLElement,
  dialogParams: menuaiioHardwareDialogParams
): void => {
  fireEvent(element, "show-dialog", {
    dialogTag: "dialog-menuaiio-hardware",
    dialogImport: () => import("./dialog-menuaiio-hardware"),
    dialogParams,
  });
};
