import { fireEvent } from "../../../../src/common/dom/fire_event";
import type { Supervisor } from "../../../../src/data/supervisor/supervisor";

export interface menuaiioDatatiskDialogParams {
  supervisor: Supervisor;
}

export const showmenuaiioDatadiskDialog = (
  element: HTMLElement,
  dialogParams: menuaiioDatatiskDialogParams
): void => {
  fireEvent(element, "show-dialog", {
    dialogTag: "dialog-menuaiio-datadisk",
    dialogImport: () => import("./dialog-menuaiio-datadisk"),
    dialogParams,
  });
};
