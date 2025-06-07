import { fireEvent } from "../../../../src/common/dom/fire_event";
import type { Supervisor } from "../../../../src/data/supervisor/supervisor";
import "./dialog-menuaiio-registries";

export interface RegistriesDialogParams {
  supervisor: Supervisor;
}

export const showRegistriesDialog = (
  element: HTMLElement,
  dialogParams: RegistriesDialogParams
): void => {
  fireEvent(element, "show-dialog", {
    dialogTag: "dialog-menuaiio-registries",
    dialogImport: () => import("./dialog-menuaiio-registries"),
    dialogParams,
  });
};
