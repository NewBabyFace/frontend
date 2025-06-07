import { fireEvent } from "../../../../src/common/dom/fire_event";
import type { Supervisor } from "../../../../src/data/supervisor/supervisor";

export interface menuaiioBackupDialogParams {
  slug: string;
  onDelete?: () => void;
  onRestoring?: () => void;
  onboarding?: boolean;
  supervisor?: Supervisor;
}

export const showmenuaiioBackupDialog = (
  element: HTMLElement,
  dialogParams: menuaiioBackupDialogParams
): void => {
  fireEvent(element, "show-dialog", {
    dialogTag: "dialog-menuaiio-backup",
    dialogImport: () => import("./dialog-menuaiio-backup"),
    dialogParams,
  });
};
