import {
  applyThemesOnElement,
  invalidateThemeCache,
} from "../common/dom/apply_themes_on_element";
import type { menuaiDomEvent } from "../common/dom/fire_event";
import { subscribeThemes } from "../data/ws-themes";
import type { Constructor, menuai } from "../types";
import { storeState } from "../util/ha-pref-storage";
import type { menuaiBaseEl } from "./menuai-base-mixin";

declare global {
  // for add event listener
  interface HTMLElementEventMap {
    settheme: menuaiDomEvent<Partial<menuai["selectedTheme"]>>;
  }
  interface menuaiDomEvents {
    settheme: Partial<menuai["selectedTheme"]>;
  }
}

const mql = matchMedia("(prefers-color-scheme: dark)");

export default <T extends Constructor<menuaiBaseEl>>(superClass: T) =>
  class extends superClass {
    private _themeApplied = false;

    protected firstUpdated(changedProps) {
      super.firstUpdated(changedProps);
      this.addEventListener("settheme", (ev) => {
        this._updatemenuai({
          selectedTheme: {
            ...this.menuai!.selectedTheme!,
            ...ev.detail,
          },
        });
        this._applyTheme(mql.matches);
        storeState(this.menuai!);
      });
      mql.addListener((ev) => this._applyTheme(ev.matches));
      if (!this._themeApplied && mql.matches) {
        applyThemesOnElement(
          document.documentElement,
          {
            default_theme: "default",
            default_dark_theme: null,
            themes: {},
            darkMode: true,
            theme: "default",
          },
          undefined,
          undefined,
          true
        );
      }
    }

    protected menuaiConnected() {
      super.menuaiConnected();

      subscribeThemes(this.menuai!.connection, (themes) => {
        this._themeApplied = true;
        this._updatemenuai({ themes });
        invalidateThemeCache();
        this._applyTheme(mql.matches);
      });
    }

    private _applyTheme(darkPreferred: boolean) {
      if (!this.menuai) {
        return;
      }

      let themeSettings: Partial<menuai["selectedTheme"]> =
        this.menuai.config.recovery_mode || this.menuai.config.safe_mode
          ? {
              ...this.menuai.selectedTheme,
              theme: "default",
              primaryColor: this.menuai.config.recovery_mode
                ? "#db4437"
                : "#e48629",
              accentColor: this.menuai.config.recovery_mode
                ? "#ffca28"
                : "#db4437",
            }
          : this.menuai.selectedTheme;

      let darkMode =
        themeSettings?.dark === undefined ? darkPreferred : themeSettings.dark;

      const themeName =
        themeSettings?.theme ||
        (darkMode && this.menuai.themes.default_dark_theme
          ? this.menuai.themes.default_dark_theme
          : this.menuai.themes.default_theme);

      const selectedTheme = themeName
        ? this.menuai.themes.themes[themeName]
        : undefined;

      if (selectedTheme && darkMode && !selectedTheme.modes) {
        darkMode = false;
      }

      themeSettings = { ...themeSettings, dark: darkMode };
      this._updatemenuai({
        themes: { ...this.menuai.themes!, theme: themeName },
      });

      applyThemesOnElement(
        document.documentElement,
        this.menuai.themes,
        themeName,
        themeSettings,
        true
      );

      if (darkMode !== this.menuai.themes.darkMode) {
        this._updatemenuai({
          themes: { ...this.menuai.themes!, darkMode },
        });

        const schemeMeta = document.querySelector("meta[name=color-scheme]");
        if (schemeMeta) {
          schemeMeta.setAttribute(
            "content",
            darkMode ? "dark" : themeName === "default" ? "light" : "dark light"
          );
        }
      }

      const themeMeta = document.querySelector("meta[name=theme-color]");
      const computedStyles = getComputedStyle(document.documentElement);
      const themeMetaColor =
        computedStyles.getPropertyValue("--app-theme-color");

      document.documentElement.style.backgroundColor =
        computedStyles.getPropertyValue("--primary-background-color");

      if (themeMeta) {
        if (!themeMeta.hasAttribute("default-content")) {
          themeMeta.setAttribute(
            "default-content",
            themeMeta.getAttribute("content")!
          );
        }
        const themeColor =
          themeMetaColor?.trim() ||
          (themeMeta.getAttribute("default-content") as string);
        themeMeta.setAttribute("content", themeColor);
      }

      this.menuai!.auth.external?.fireMessage({ type: "theme-update" });
    }
  };
