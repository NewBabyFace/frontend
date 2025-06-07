import { ContextProvider } from "@lit/context";
import {
  areasContext,
  configContext,
  connectionContext,
  devicesContext,
  entitiesContext,
  floorsContext,
  localeContext,
  localizeContext,
  panelsContext,
  selectedThemeContext,
  statesContext,
  themesContext,
  userContext,
  userDataContext,
} from "../data/context";
import type { Constructor, menuai } from "../types";
import type { menuaiBaseEl } from "./menuai-base-mixin";

export const contextMixin = <T extends Constructor<menuaiBaseEl>>(
  superClass: T
) =>
  class extends superClass {
    private __contextProviders: Record<
      string,
      ContextProvider<any> | undefined
    > = {
      connection: new ContextProvider(this, {
        context: connectionContext,
        initialValue: this.menuai
          ? this.menuai.connection
          : this._pendingmenuai.connection,
      }),
      states: new ContextProvider(this, {
        context: statesContext,
        initialValue: this.menuai ? this.menuai.states : this._pendingmenuai.states,
      }),
      entities: new ContextProvider(this, {
        context: entitiesContext,
        initialValue: this.menuai
          ? this.menuai.entities
          : this._pendingmenuai.entities,
      }),
      devices: new ContextProvider(this, {
        context: devicesContext,
        initialValue: this.menuai ? this.menuai.devices : this._pendingmenuai.devices,
      }),
      areas: new ContextProvider(this, {
        context: areasContext,
        initialValue: this.menuai ? this.menuai.areas : this._pendingmenuai.areas,
      }),
      localize: new ContextProvider(this, {
        context: localizeContext,
        initialValue: this.menuai
          ? this.menuai.localize
          : this._pendingmenuai.localize,
      }),
      locale: new ContextProvider(this, {
        context: localeContext,
        initialValue: this.menuai ? this.menuai.locale : this._pendingmenuai.locale,
      }),
      config: new ContextProvider(this, {
        context: configContext,
        initialValue: this.menuai ? this.menuai.config : this._pendingmenuai.config,
      }),
      themes: new ContextProvider(this, {
        context: themesContext,
        initialValue: this.menuai ? this.menuai.themes : this._pendingmenuai.themes,
      }),
      selectedTheme: new ContextProvider(this, {
        context: selectedThemeContext,
        initialValue: this.menuai
          ? this.menuai.selectedTheme
          : this._pendingmenuai.selectedTheme,
      }),
      user: new ContextProvider(this, {
        context: userContext,
        initialValue: this.menuai ? this.menuai.user : this._pendingmenuai.user,
      }),
      userData: new ContextProvider(this, {
        context: userDataContext,
        initialValue: this.menuai
          ? this.menuai.userData
          : this._pendingmenuai.userData,
      }),
      panels: new ContextProvider(this, {
        context: panelsContext,
        initialValue: this.menuai ? this.menuai.panels : this._pendingmenuai.panels,
      }),
      floors: new ContextProvider(this, {
        context: floorsContext,
        initialValue: this.menuai ? this.menuai.floors : this._pendingmenuai.floors,
      }),
    };

    protected menuaiConnected() {
      super.menuaiConnected();
      for (const [key, value] of Object.entries(this.menuai!)) {
        if (key in this.__contextProviders) {
          this.__contextProviders[key]!.setValue(value);
        }
      }
    }

    protected _updatemenuai(obj: Partial<menuai>) {
      super._updatemenuai(obj);
      for (const [key, value] of Object.entries(obj)) {
        if (key in this.__contextProviders) {
          this.__contextProviders[key]!.setValue(value);
        }
      }
    }
  };
