import { fireEvent } from "../../../../src/common/dom/fire_event";

export interface menuaiioMarkdownDialogParams {
  title: string;
  content: string;
}

export const showmenuaiioMarkdownDialog = (
  element: HTMLElement,
  dialogParams: menuaiioMarkdownDialogParams
): void => {
  fireEvent(element, "show-dialog", {
    dialogTag: "dialog-menuaiio-markdown",
    dialogImport: () => import("./dialog-menuaiio-markdown"),
    dialogParams,
  });
};
