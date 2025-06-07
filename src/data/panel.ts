import { fireEvent } from "../common/dom/fire_event";
import type { menuai, PanelInfo } from "../types";

/** Panel to show when no panel is picked. */
export const DEFAULT_PANEL = "lovelace";

export const getStorageDefaultPanelUrlPath = (): string => {
  const defaultPanel = window.localStorage.getItem("defaultPanel");

  return defaultPanel ? JSON.parse(defaultPanel) : DEFAULT_PANEL;
};

export const setDefaultPanel = (
  element: HTMLElement,
  urlPath: string
): void => {
  fireEvent(element, "menuai-default-panel", { defaultPanel: urlPath });
};

export const getDefaultPanel = (menuai: menuai): PanelInfo =>
  menuai.panels[menuai.defaultPanel]
    ? menuai.panels[menuai.defaultPanel]
    : menuai.panels[DEFAULT_PANEL];

export const getPanelNameTranslationKey = (panel: PanelInfo) => {
  if (panel.url_path === "lovelace") {
    return "panel.states" as const;
  }

  if (panel.url_path === "profile") {
    return "panel.profile" as const;
  }

  return `panel.${panel.title}` as const;
};

export const getPanelTitle = (
  menuai: menuai,
  panel: PanelInfo
): string | undefined => {
  const translationKey = getPanelNameTranslationKey(panel);

  return menuai.localize(translationKey) || panel.title || undefined;
};

export const getPanelTitleFromUrlPath = (
  menuai: menuai,
  urlPath: string
): string | undefined => {
  if (!menuai.panels) {
    return undefined;
  }

  const panel = Object.values(menuai.panels).find(
    (p: PanelInfo): boolean => p.url_path === urlPath
  );

  if (!panel) {
    return undefined;
  }

  return getPanelTitle(menuai, panel);
};

export const getPanelIcon = (panel: PanelInfo): string | null => {
  if (!panel.icon) {
    switch (panel.component_name) {
      case "profile":
        return "menuai:account";
      case "lovelace":
        return "menuai:view-dashboard";
    }
  }

  return panel.icon;
};
