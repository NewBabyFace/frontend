import { fireEvent } from "../../../../src/common/dom/fire_event";
import type { Supervisor } from "../../../../src/data/supervisor/supervisor";
import "./dialog-menuaiio-network";

export interface menuaiioNetworkDialogParams {
  supervisor: Supervisor;
  loadData: () => Promise<void>;
}

export const showNetworkDialog = (
  element: HTMLElement,
  dialogParams: menuaiioNetworkDialogParams
): void => {
  fireEvent(element, "show-dialog", {
    dialogTag: "dialog-menuaiio-network",
    dialogImport: () => import("./dialog-menuaiio-network"),
    dialogParams,
  });
};
