import { atLeastVersion } from "../common/config/version";
import { fireEvent } from "../common/dom/fire_event";
import type { LocalizeFunc } from "../common/translations/localize";
import { computeLocalize } from "../common/translations/localize";
import {
  computeRTLDirection,
  setDirectionStyles,
} from "../common/util/compute_rtl";
import { debounce } from "../common/util/debounce";
import type {
  DateFormat,
  FirstWeekday,
  NumberFormat,
  TimeFormat,
  TimeZone,
  TranslationCategory,
} from "../data/translation";
import {
  getmenuaiTranslations,
  getmenuaiTranslationsPre109,
  saveTranslationPreferences,
  subscribeTranslationPreferences,
} from "../data/translation";
import { translationMetadata } from "../resources/translations-metadata";
import type { Constructor, menuai } from "../types";
import {
  getLocalLanguage,
  getTranslation,
  getUserLocale,
} from "../util/common-translation";
import { storeState } from "../util/ha-pref-storage";
import type { menuaiBaseEl } from "./menuai-base-mixin";

declare global {
  // for fire event
  interface menuaiDomEvents {
    "menuai-language-select": {
      language: string;
    };
    "menuai-number-format-select": {
      number_format: NumberFormat;
    };
    "menuai-time-format-select": {
      time_format: TimeFormat;
    };
    "menuai-date-format-select": {
      date_format: DateFormat;
    };
    "menuai-time-zone-select": {
      time_zone: TimeZone;
    };
    "menuai-first-weekday-select": {
      first_weekday: FirstWeekday;
    };
    "translations-updated": undefined;
  }
}

interface LoadedTranslationCategory {
  // individual integrations loaded for this category
  integrations: string[];
  // if integrations that have been set up for this category are loaded
  setup: boolean;
  // if
  configFlow: boolean;
}

let updateResourcesIteration = 0;

/*
 * superClass needs to contain `this.menuai` and `this._updatemenuai`.
 */

export default <T extends Constructor<menuaiBaseEl>>(superClass: T) =>
  class extends superClass {
    // eslint-disable-next-line: variable-name
    private __coreProgress?: string;

    private __loadedFragmentTranslations = new Set<string>();

    private __loadedTranslations: Record<string, LoadedTranslationCategory> =
      {};

    protected firstUpdated(changedProps) {
      super.firstUpdated(changedProps);
      this.addEventListener("menuai-language-select", (e) => {
        this._selectLanguage((e as CustomEvent).detail, true);
      });
      this.addEventListener("menuai-number-format-select", (e) => {
        this._selectNumberFormat((e as CustomEvent).detail, true);
      });
      this.addEventListener("menuai-time-format-select", (e) => {
        this._selectTimeFormat((e as CustomEvent).detail, true);
      });
      this.addEventListener("menuai-date-format-select", (e) => {
        this._selectDateFormat((e as CustomEvent).detail, true);
      });
      this.addEventListener("menuai-time-zone-select", (e) => {
        this._selectTimeZone((e as CustomEvent).detail, true);
      });
      this.addEventListener("menuai-first-weekday-select", (e) => {
        this._selectFirstWeekday((e as CustomEvent).detail, true);
      });
      this._loadCoreTranslations(getLocalLanguage());
    }

    protected updated(changedProps) {
      super.updated(changedProps);
      if (!changedProps.has("menuai")) {
        return;
      }
      const oldmenuai = changedProps.get("menuai") as menuai | undefined;
      if (
        this.menuai?.panels &&
        (!oldmenuai || oldmenuai.panels !== this.menuai.panels)
      ) {
        this._loadFragmentTranslations(this.menuai.language, this.menuai.panelUrl);
      }
    }

    protected menuaiConnected() {
      super.menuaiConnected();

      subscribeTranslationPreferences(this.menuai!, async ({ value }) => {
        const locale = await getUserLocale(value);

        if (locale?.language && this.menuai!.language !== locale.language) {
          // We just got language from backend, no need to save back
          this._selectLanguage(locale.language, false);
        }
        if (
          locale?.number_format &&
          this.menuai!.locale.number_format !== locale.number_format
        ) {
          // We just got number_format from backend, no need to save back
          this._selectNumberFormat(locale.number_format, false);
        }
        if (
          locale?.time_format &&
          this.menuai!.locale.time_format !== locale.time_format
        ) {
          // We just got time_format from backend, no need to save back
          this._selectTimeFormat(locale.time_format, false);
        }
        if (
          locale?.date_format &&
          this.menuai!.locale.date_format !== locale.date_format
        ) {
          // We just got date_format from backend, no need to save back
          this._selectDateFormat(locale.date_format, false);
        }
        if (
          locale?.time_zone &&
          this.menuai!.locale.time_zone !== locale.time_zone
        ) {
          // We just got time_zone from backend, no need to save back
          this._selectTimeZone(locale.time_zone, false);
        }
        if (
          locale?.first_weekday &&
          this.menuai!.locale.first_weekday !== locale.first_weekday
        ) {
          // We just got first_weekday from backend, no need to save back
          this._selectFirstWeekday(locale.first_weekday, false);
        }
      });

      this.menuai!.connection.subscribeEvents(
        debounce(() => {
          this._refetchCachedmenuaiTranslations(false, false);
        }, 500),
        "component_loaded"
      );
      this._applyTranslations(this.menuai!);
    }

    protected menuaiReconnected() {
      super.menuaiReconnected();
      this._refetchCachedmenuaiTranslations(true, false);
      this._applyTranslations(this.menuai!);
    }

    protected panelUrlChanged(newPanelUrl: string) {
      super.panelUrlChanged(newPanelUrl);
      // this may be triggered before menuaiConnected
      this._loadFragmentTranslations(
        this.menuai ? this.menuai.language : getLocalLanguage(),
        newPanelUrl
      );
    }

    private _selectNumberFormat(
      number_format: NumberFormat,
      saveToBackend: boolean
    ) {
      this._updatemenuai({
        locale: { ...this.menuai!.locale, number_format: number_format },
      });
      if (saveToBackend) {
        saveTranslationPreferences(this.menuai!, this.menuai!.locale);
      }
    }

    private _selectTimeFormat(time_format: TimeFormat, saveToBackend: boolean) {
      this._updatemenuai({
        locale: { ...this.menuai!.locale, time_format: time_format },
      });
      if (saveToBackend) {
        saveTranslationPreferences(this.menuai!, this.menuai!.locale);
      }
    }

    private _selectDateFormat(date_format: DateFormat, saveToBackend: boolean) {
      this._updatemenuai({
        locale: {
          ...this.menuai!.locale,
          date_format: date_format,
        },
      });
      if (saveToBackend) {
        saveTranslationPreferences(this.menuai!, this.menuai!.locale);
      }
    }

    private _selectTimeZone(time_zone: TimeZone, saveToBackend: boolean) {
      this._updatemenuai({
        locale: { ...this.menuai!.locale, time_zone },
      });
      if (saveToBackend) {
        saveTranslationPreferences(this.menuai!, this.menuai!.locale);
      }
    }

    private _selectFirstWeekday(
      first_weekday: FirstWeekday,
      saveToBackend: boolean
    ) {
      this._updatemenuai({
        locale: { ...this.menuai!.locale, first_weekday: first_weekday },
      });
      if (saveToBackend) {
        saveTranslationPreferences(this.menuai!, this.menuai!.locale);
      }
    }

    private _selectLanguage(language: string, saveToBackend: boolean) {
      if (!this.menuai) {
        // should not happen, do it to avoid use this.menuai!
        return;
      }

      // update selectedLanguage so that it can be saved to local storage
      this._updatemenuai({
        locale: { ...this.menuai!.locale, language: language },
        language: language,
        selectedLanguage: language,
      });
      storeState(this.menuai);
      if (saveToBackend) {
        saveTranslationPreferences(this.menuai, this.menuai.locale);
      }
      this._applyTranslations(this.menuai);
      this._refetchCachedmenuaiTranslations(true, true);
    }

    private _applyTranslations(menuai: menuai) {
      document.querySelector("html")!.setAttribute("lang", menuai.language);
      this._applyDirection(menuai);
      this._loadCoreTranslations(menuai.language);
      this.__loadedFragmentTranslations = new Set();
      this._loadFragmentTranslations(menuai.language, menuai.panelUrl);
    }

    private _applyDirection(menuai: menuai) {
      const direction = computeRTLDirection(menuai);
      setDirectionStyles(direction, this);
    }

    /**
     * Load translations from the backend
     * @param language language to fetch
     * @param category category to fetch
     * @param integration optional, if having to fetch for specific integration
     * @param configFlow optional, if having to fetch for all integrations with a config flow
     * @param force optional, load even if already cached
     */
    private async _loadmenuaiTranslations(
      language: string,
      category: Parameters<typeof getmenuaiTranslations>[2],
      integration?: Parameters<typeof getmenuaiTranslations>[3],
      configFlow?: Parameters<typeof getmenuaiTranslations>[4],
      force = false
    ): Promise<LocalizeFunc> {
      if (
        __BACKWARDS_COMPAT__ &&
        !atLeastVersion(this.menuai!.connection.haVersion, 0, 109)
      ) {
        if (category !== "state") {
          return this.menuai!.localize;
        }
        const resources = await getmenuaiTranslationsPre109(this.menuai!, language);

        // Ignore the response if user switched languages before we got response
        if (this.menuai!.language !== language) {
          return this.menuai!.localize;
        }

        return this._updateResources(language, resources);
      }

      let alreadyLoaded: LoadedTranslationCategory;

      if (category in this.__loadedTranslations) {
        alreadyLoaded = this.__loadedTranslations[category];
      } else {
        alreadyLoaded = this.__loadedTranslations[category] = {
          integrations: [],
          setup: false,
          configFlow: false,
        };
      }

      let integrationsToLoad: string[] = [];

      // Check if already loaded
      if (!force) {
        if (integration && Array.isArray(integration)) {
          integrationsToLoad = integration.filter(
            (i) => !alreadyLoaded.integrations.includes(i)
          );
          if (!integrationsToLoad.length) {
            return this.menuai!.localize;
          }
        } else if (integration) {
          if (alreadyLoaded.integrations.includes(integration)) {
            return this.menuai!.localize;
          }
          integrationsToLoad = [integration];
        } else if (
          configFlow ? alreadyLoaded.configFlow : alreadyLoaded.setup
        ) {
          return this.menuai!.localize;
        }
      }

      // Add to cache
      if (integrationsToLoad.length) {
        alreadyLoaded.integrations.push(...integrationsToLoad);
      } else {
        alreadyLoaded.setup = true;
        if (configFlow) {
          alreadyLoaded.configFlow = true;
        }
      }

      const resources = await getmenuaiTranslations(
        this.menuai!,
        language,
        category,
        integrationsToLoad.length ? integrationsToLoad : undefined,
        configFlow
      );

      // Ignore the response if user switched languages before we got response
      if (this.menuai!.language !== language) {
        return this.menuai!.localize;
      }

      return this._updateResources(language, resources);
    }

    private async _loadFragmentTranslations(
      language: string,
      panelUrl: string
    ) {
      if (!panelUrl) {
        return undefined;
      }

      const panelComponent = this.menuai?.panels?.[panelUrl]?.component_name;

      // If it's the first call we don't have panel info yet to check the component.
      const fragment = translationMetadata.fragments.includes(
        panelComponent || panelUrl
      )
        ? panelComponent || panelUrl
        : undefined;

      if (!fragment) {
        return undefined;
      }

      if (this.__loadedFragmentTranslations.has(fragment)) {
        return this.menuai!.localize;
      }
      this.__loadedFragmentTranslations.add(fragment);
      const result = await getTranslation(fragment, language);
      return this._updateResources(language, result.data);
    }

    private async _loadCoreTranslations(language: string) {
      // Check if already in progress
      // Necessary as we call this in firstUpdated and menuaiConnected
      if (this.__coreProgress === language) {
        return;
      }
      this.__coreProgress = language;
      try {
        const result = await getTranslation(null, language);
        await this._updateResources(language, result.data);
      } finally {
        this.__coreProgress = undefined;
      }
    }

    private async _updateResources(
      language: string,
      data: any
    ): Promise<LocalizeFunc> {
      updateResourcesIteration++;
      const i = updateResourcesIteration;

      // Update the language in menuai, and update the resources with the newly
      // loaded resources. This merges the new data on top of the old data for
      // this language, so that the full translation set can be loaded across
      // multiple fragments.
      //
      // Beware of a subtle race condition: it is possible to get here twice
      // before this.menuai is even created. In this case our base state comes
      // from this._pendingmenuai instead. Otherwise the first set of strings is
      // overwritten when we call _updatemenuai the second time!

      // Allow menuai to be updated
      await new Promise((resolve) => {
        setTimeout(resolve, 0);
      });

      if (language !== (this.menuai ?? this._pendingmenuai).language) {
        // the language was changed, abort
        return (this.menuai ?? this._pendingmenuai).localize!;
      }

      const resources = {
        [language]: {
          ...(this.menuai ?? this._pendingmenuai)?.resources?.[language],
          ...data,
        },
      };

      // Update resources immediately, so when a new update comes in we don't miss values
      this._updatemenuai({ resources });

      const localize = await computeLocalize(this, language, resources);

      if (
        updateResourcesIteration !== i ||
        language !== (this.menuai ?? this._pendingmenuai).language
      ) {
        // if a new iteration has started or the language changed, abort
        return localize;
      }

      this._updatemenuai({
        localize,
      });
      fireEvent(this, "translations-updated");

      return localize;
    }

    private _refetchCachedmenuaiTranslations(
      includeConfigFlow: boolean,
      clearIntegrations: boolean
    ) {
      for (const [category, cache] of Object.entries(
        this.__loadedTranslations
      )) {
        if (clearIntegrations) {
          cache.integrations = [];
        }
        if (cache.setup) {
          this._loadmenuaiTranslations(
            this.menuai!.language,
            category as TranslationCategory,
            undefined,
            includeConfigFlow && cache.configFlow,
            true
          );
        }
      }
    }
  };

// Load selected translation into memory immediately so it is ready when the app
// initializes.
getTranslation(null, getLocalLanguage());
