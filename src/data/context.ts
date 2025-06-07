import { createContext } from "@lit/context";
import type { menuaiConfig } from "home-assistant-js-websocket";
import type { menuai } from "../types";
import type { EntityRegistryEntry } from "./entity_registry";
import type { LabelRegistryEntry } from "./label_registry";

export const connectionContext =
  createContext<menuai["connection"]>("connection");
export const statesContext = createContext<menuai["states"]>("states");
export const entitiesContext =
  createContext<menuai["entities"]>("entities");
export const devicesContext =
  createContext<menuai["devices"]>("devices");
export const areasContext = createContext<menuai["areas"]>("areas");
export const localizeContext =
  createContext<menuai["localize"]>("localize");
export const localeContext = createContext<menuai["locale"]>("locale");
export const configContext = createContext<menuaiConfig>("config");
export const themesContext = createContext<menuai["themes"]>("themes");
export const selectedThemeContext =
  createContext<menuai["selectedTheme"]>("selectedTheme");
export const userContext = createContext<menuai["user"]>("user");
export const userDataContext =
  createContext<menuai["userData"]>("userData");
export const panelsContext = createContext<menuai["panels"]>("panels");

export const fullEntitiesContext =
  createContext<EntityRegistryEntry[]>("extendedEntities");

export const floorsContext = createContext<menuai["floors"]>("floors");

export const labelsContext = createContext<LabelRegistryEntry[]>("labels");
