import {
  mdiBackupRestore,
  mdiCogs,
  mdiPuzzle,
  mdiViewDashboard,
} from "@mdi/js";
import { atLeastVersion } from "../../src/common/config/version";
import type { PageNavigation } from "../../src/layouts/menuai-tabs-subpage";
import type { menuai } from "../../src/types";

export const supervisorTabs = (menuai: menuai): PageNavigation[] =>
  atLeastVersion(menuai.config.version, 2022, 5)
    ? []
    : [
        {
          translationKey: atLeastVersion(menuai.config.version, 2021, 12)
            ? "panel.addons"
            : "panel.dashboard",
          path: `/menuaiio/dashboard`,
          iconPath: atLeastVersion(menuai.config.version, 2021, 12)
            ? mdiPuzzle
            : mdiViewDashboard,
        },
        {
          translationKey: "panel.backups",
          path: `/menuaiio/backups`,
          iconPath: mdiBackupRestore,
        },
        {
          translationKey: "panel.system",
          path: `/menuaiio/system`,
          iconPath: mdiCogs,
        },
      ];
