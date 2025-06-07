import { fireEvent } from "../../../common/dom/fire_event";
import type { menuaiioHostInfo } from "../../../data/menuaiio/host";

export interface MoveDatadiskDialogParams {
  hostInfo: menuaiioHostInfo;
}

export const showMoveDatadiskDialog = (
  element: HTMLElement,
  dialogParams: MoveDatadiskDialogParams
): void => {
  fireEvent(element, "show-dialog", {
    dialogTag: "dialog-move-datadisk",
    dialogImport: () => import("./dialog-move-datadisk"),
    dialogParams,
  });
};
