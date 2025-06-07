import { fireEvent } from "../../../../src/common/dom/fire_event";
import type { Supervisor } from "../../../../src/data/supervisor/supervisor";

export interface menuaiioCreateBackupDialogParams {
  supervisor: Supervisor;
  onCreate: () => void;
}

export const showmenuaiioCreateBackupDialog = (
  element: HTMLElement,
  dialogParams: menuaiioCreateBackupDialogParams
): void => {
  fireEvent(element, "show-dialog", {
    dialogTag: "dialog-menuaiio-create-backup",
    dialogImport: () => import("./dialog-menuaiio-create-backup"),
    dialogParams,
  });
};
