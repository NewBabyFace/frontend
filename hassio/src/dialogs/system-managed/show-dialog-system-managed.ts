import { fireEvent } from "../../../../src/common/dom/fire_event";
import type { menuaiioAddonDetails } from "../../../../src/data/menuaiio/addon";
import type { Supervisor } from "../../../../src/data/supervisor/supervisor";

export interface SystemManagedDialogParams {
  addon: menuaiioAddonDetails;
  supervisor: Supervisor;
}

export const showSystemManagedDialog = (
  element: HTMLElement,
  dialogParams: SystemManagedDialogParams
): void => {
  fireEvent(element, "show-dialog", {
    dialogTag: "dialog-system-managed",
    dialogImport: () => import("./dialog-system-managed"),
    dialogParams,
  });
};
