import type { menuai } from "../types";
import { showToast } from "./toast";

export const showSaveSuccessToast = (el: HTMLElement, menuai: menuai) =>
  showToast(el, {
    message: menuai!.localize("ui.common.successfully_saved"),
  });
