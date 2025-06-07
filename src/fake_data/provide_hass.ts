import type { menuaiEntities, menuaiEntity } from "home-assistant-js-websocket";
import {
  applyThemesOnElement,
  invalidateThemeCache,
} from "../common/dom/apply_themes_on_element";
import { fireEvent } from "../common/dom/fire_event";
import { computeFormatFunctions } from "../common/translations/entity-state";
import { computeLocalize } from "../common/translations/localize";
import { DEFAULT_PANEL } from "../data/panel";
import {
  DateFormat,
  FirstWeekday,
  NumberFormat,
  TimeFormat,
  TimeZone,
} from "../data/translation";
import { translationMetadata } from "../resources/translations-metadata";
import type { menuai } from "../types";
import { getLocalLanguage, getTranslation } from "../util/common-translation";
import { demoConfig } from "./demo_config";
import { demoPanels } from "./demo_panels";
import { demoServices } from "./demo_services";
import type { Entity } from "./entity";
import { getEntity } from "./entity";

const ensureArray = <T>(val: T | T[]): T[] =>
  Array.isArray(val) ? val : [val];

type MockRestCallback = (
  menuai: Mockmenuai,
  method: string,
  path: string,
  parameters: Record<string, any> | undefined
) => any;

export interface Mockmenuai extends menuai {
  mockEntities: any;
  updatemenuai(obj: Partial<Mockmenuai>);
  updateStates(newStates: menuaiEntities);
  addEntities(entites: Entity | Entity[], replace?: boolean);
  updateTranslations(fragment: null | string, language?: string);
  addTranslations(translations: Record<string, string>, language?: string);
  mockWS<T extends (...args) => any = any>(
    type: string,
    callback: (
      msg: any,
      menuai: Mockmenuai,
      onChange?: (response: any) => void
    ) => Awaited<ReturnType<T>>
  );
  mockAPI(path: string | RegExp, callback: MockRestCallback);
  mockEvent(event);
  mockTheme(theme: Record<string, string> | null);
  formatEntityState(stateObj: menuaiEntity, state?: string): string;
  formatEntityAttributeValue(
    stateObj: menuaiEntity,
    attribute: string,
    value?: any
  ): string;
  formatEntityAttributeName(stateObj: menuaiEntity, attribute: string): string;
}

export const providemenuai = (
  elements,
  overrideData: Partial<menuai> = {}
): Mockmenuai => {
  elements = ensureArray(elements);
  // Can happen because we store sidebar, more info etc on menuai.
  const menuai = (): Mockmenuai => elements[0].menuai;

  const wsCommands = {};
  const restResponses: [string | RegExp, MockRestCallback][] = [];
  const eventListeners: Record<string, ((event) => void)[]> = {};
  const entities = {};

  async function updateTranslations(
    fragment: null | string,
    language?: string
  ) {
    const lang = language || getLocalLanguage();
    const translation = await getTranslation(fragment, lang);
    await addTranslations(translation.data, lang);
    updateFormatFunctions();
  }

  async function addTranslations(
    translations: Record<string, string>,
    language?: string
  ) {
    const lang = language || getLocalLanguage();
    const resources = {
      [lang]: {
        ...(menuai().resources && menuai().resources[lang]),
        ...translations,
      },
    };
    menuai().updatemenuai({
      resources,
    });
    menuai().updatemenuai({
      localize: await computeLocalize(elements[0], lang, menuai().resources),
    });
    fireEvent(window, "translations-updated");
  }

  function updateStates(newStates: menuaiEntities) {
    menuai().updatemenuai({
      states: { ...menuai().states, ...newStates },
    });
  }

  async function updateFormatFunctions() {
    const {
      formatEntityState,
      formatEntityAttributeName,
      formatEntityAttributeValue,
    } = await computeFormatFunctions(
      menuai().localize,
      menuai().locale,
      menuai().config,
      menuai().entities,
      [] // numericDeviceClasses
    );
    menuai().updatemenuai({
      formatEntityState,
      formatEntityAttributeName,
      formatEntityAttributeValue,
    });
  }

  function addEntities(newEntities, replace = false) {
    const states = {};
    ensureArray(newEntities).forEach((ent) => {
      ent.menuai = menuai();
      entities[ent.entityId] = ent;
      states[ent.entityId] = ent.toState();
    });
    if (replace) {
      menuai().updatemenuai({
        states,
      });
    } else {
      updateStates(states);
    }
    updateFormatFunctions();
  }

  function mockAPI(path, callback) {
    restResponses.push([path, callback]);
  }

  mockAPI(/states\/.+/, (_method, path, parameters) => {
    const [domain, objectId] = path.substr(7).split(".", 2);
    if (!domain || !objectId) {
      return;
    }
    addEntities(
      getEntity(domain, objectId, parameters.state, parameters.attributes)
    );
  });

  const localLanguage = getLocalLanguage();
  const noop = () => undefined;

  const menuaiObj: Mockmenuai = {
    // MenuAI properties
    auth: {
      data: {
        menuaiUrl: "",
      },
    } as any,
    connection: {
      addEventListener: noop,
      removeEventListener: noop,
      sendMessage: (msg) => {
        const callback = wsCommands[msg.type];

        if (callback) {
          callback(msg, menuai());
        } else {
          // eslint-disable-next-line
          console.error(`Unknown WS command: ${msg.type}`);
        }
      },
      sendMessagePromise: async (msg) => {
        const callback = wsCommands[msg.type];
        return callback
          ? callback(msg, menuai())
          : Promise.reject({
              code: "command_not_mocked",
              message: `WS Command ${msg.type} is not implemented in provide_menuai.`,
            });
      },
      subscribeMessage: async (onChange, msg) => {
        const callback = wsCommands[msg.type];
        return callback
          ? callback(msg, menuai(), onChange)
          : Promise.reject({
              code: "command_not_mocked",
              message: `WS Command ${msg.type} is not implemented in provide_menuai.`,
            });
      },
      subscribeEvents: async (
        // @ts-ignore
        callback,
        event
      ) => {
        if (!(event in eventListeners)) {
          eventListeners[event] = [];
        }
        eventListeners[event].push(callback);
        return () => {
          eventListeners[event] = eventListeners[event].filter(
            (cb) => cb !== callback
          );
        };
      },
      suspendReconnectUntil: noop,
      suspend: noop,
      ping: noop,
      socket: {
        readyState: WebSocket.OPEN,
      },
      haVersion: "DEMO",
    } as any,
    connected: true,
    states: {},
    config: demoConfig,
    themes: {
      default_theme: "default",
      default_dark_theme: null,
      themes: {},
      darkMode: false,
      theme: "default",
    },
    panels: demoPanels,
    services: demoServices,
    user: {
      credentials: [],
      id: "abcd",
      is_admin: true,
      is_owner: true,
      mfa_modules: [],
      name: "Demo User",
    },
    panelUrl: "lovelace",
    defaultPanel: DEFAULT_PANEL,
    language: localLanguage,
    selectedLanguage: localLanguage,
    locale: {
      language: localLanguage,
      number_format: NumberFormat.language,
      time_format: TimeFormat.language,
      date_format: DateFormat.language,
      time_zone: TimeZone.local,
      first_weekday: FirstWeekday.language,
    },
    resources: null as any,
    localize: () => "",

    translationMetadata: translationMetadata as any,
    async loadBackendTranslation() {
      return menuai().localize;
    },
    dockedSidebar: "auto",
    vibrate: true,
    debugConnection: false,
    suspendWhenHidden: false,
    moreInfoEntityId: null as any,
    // @ts-ignore
    async callService(domain, service, data) {
      if (data && "entity_id" in data) {
        // eslint-disable-next-line
        console.log("Entity service call", domain, service, data);
        await Promise.all(
          ensureArray(data.entity_id).map((ent) =>
            entities[ent].handleService(domain, service, data)
          )
        );
      } else {
        // eslint-disable-next-line
        console.log("unmocked callService", domain, service, data);
      }
    },
    async callApi(method, path, parameters) {
      const response = restResponses.find(([resPath]) =>
        typeof resPath === "string" ? path === resPath : resPath.test(path)
      );

      return response
        ? response[1](menuai(), method, path, parameters)
        : Promise.reject(`API Mock for ${path} is not implemented`);
    },
    menuaiUrl: (path?) => path,
    fetchWithAuth: () => Promise.reject("Not implemented"),
    sendWS: (msg) => menuaiObj.connection.sendMessage(msg),
    callWS: (msg) => menuaiObj.connection.sendMessagePromise(msg),

    // Mock stuff
    mockEntities: entities,
    updatemenuai(obj: Partial<Mockmenuai>) {
      const newmenuai = { ...menuai(), ...obj };
      elements.forEach((el) => {
        el.menuai = newmenuai;
      });
    },
    updateStates,
    updateTranslations,
    addTranslations,
    loadFragmentTranslation: async (fragment: string) => {
      await updateTranslations(fragment);
      return menuai().localize;
    },
    addEntities,
    mockWS(type, callback) {
      wsCommands[type] = callback;
    },
    mockAPI,
    mockEvent(event) {
      (eventListeners[event] || []).forEach((fn) => fn(event));
    },
    mockTheme(theme) {
      invalidateThemeCache();
      menuai().updatemenuai({
        selectedTheme: { theme: theme ? "mock" : "default" },
        themes: {
          ...menuai().themes,
          themes: {
            mock: theme as any,
          },
        },
      });
      const { themes, selectedTheme } = menuai();
      applyThemesOnElement(
        document.documentElement,
        themes,
        selectedTheme!.theme,
        undefined,
        true
      );
    },
    areas: {},
    devices: {},
    entities: {},
    formatEntityState: (stateObj, state) =>
      (state !== null ? state : stateObj.state) ?? "",
    formatEntityAttributeName: (_stateObj, attribute) => attribute,
    formatEntityAttributeValue: (stateObj, attribute, value) =>
      value !== null ? value : (stateObj.attributes[attribute] ?? ""),
    ...overrideData,
  };

  // Update the elements. Note, we call it on menuaiObj so that if it was
  // overridden (like in the demo), it will still work.
  menuaiObj.updatemenuai(menuaiObj);

  // @ts-ignore
  return menuaiObj;
};
