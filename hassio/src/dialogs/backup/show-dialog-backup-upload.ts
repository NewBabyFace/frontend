import { fireEvent } from "../../../../src/common/dom/fire_event";
import "./dialog-menuaiio-backup-upload";

export interface menuaiioBackupUploadDialogParams {
  showBackup: (slug: string) => void;
  reloadBackup?: () => Promise<void>;
  onboarding?: boolean;
}

export const showBackupUploadDialog = (
  element: HTMLElement,
  dialogParams: menuaiioBackupUploadDialogParams
): void => {
  fireEvent(element, "show-dialog", {
    dialogTag: "dialog-menuaiio-backup-upload",
    dialogImport: () => import("./dialog-menuaiio-backup-upload"),
    dialogParams,
  });
};
