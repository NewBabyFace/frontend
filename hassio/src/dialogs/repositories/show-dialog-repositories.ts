import { fireEvent } from "../../../../src/common/dom/fire_event";
import type { Supervisor } from "../../../../src/data/supervisor/supervisor";
import "./dialog-menuaiio-repositories";

export interface menuaiioRepositoryDialogParams {
  supervisor: Supervisor;
  url?: string;
}

export const showRepositoriesDialog = (
  element: HTMLElement,
  dialogParams: menuaiioRepositoryDialogParams
): void => {
  fireEvent(element, "show-dialog", {
    dialogTag: "dialog-menuaiio-repositories",
    dialogImport: () => import("./dialog-menuaiio-repositories"),
    dialogParams,
  });
};
