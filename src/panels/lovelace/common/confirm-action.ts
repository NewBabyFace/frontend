import type { ConfirmationRestrictionConfig } from "../../../data/lovelace/config/action";
import { showConfirmationDialog } from "../../../dialogs/generic/show-dialog-box";
import type { menuai } from "../../../types";

export const confirmAction = async (
  node: HTMLElement,
  menuai: menuai,
  config: ConfirmationRestrictionConfig,
  action: string
): Promise<boolean> => {
  if (
    config.exemptions &&
    config.exemptions.some((e) => e.user === menuai!.user?.id)
  ) {
    return true;
  }

  return showConfirmationDialog(node, {
    text:
      config.text ||
      menuai.localize("ui.panel.lovelace.cards.actions.action_confirmation", {
        action,
      }),
  });
};
