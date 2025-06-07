import { fireEvent } from "../../../../src/common/dom/fire_event";
import type { Supervisor } from "../../../../src/data/supervisor/supervisor";

export interface menuaiioBackupLocationDialogParams {
  supervisor: Supervisor;
}

export const showmenuaiioBackupLocationDialog = (
  element: HTMLElement,
  dialogParams: menuaiioBackupLocationDialogParams
): void => {
  fireEvent(element, "show-dialog", {
    dialogTag: "dialog-menuaiio-backup-location",
    dialogImport: () => import("./dialog-menuaiio-backup-location"),
    dialogParams,
  });
};
