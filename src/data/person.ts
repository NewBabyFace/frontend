import type {
  menuaiEntityAttributeBase,
  menuaiEntityBase,
} from "home-assistant-js-websocket";
import type { menuai } from "../types";

export interface BasePerson {
  name: string;
  picture?: string;
}

export interface Person extends BasePerson {
  id: string;
  user_id?: string;
  device_trackers?: string[];
}

export interface PersonMutableParams {
  name: string;
  user_id: string | null;
  device_trackers: string[];
  picture: string | null;
}

interface PersonEntityAttributes extends menuaiEntityAttributeBase {
  id?: string;
  user_id?: string;
  device_trackers?: string[];
  editable?: boolean;
  gps_accuracy?: number;
  latitude?: number;
  longitude?: number;
}

export interface PersonEntity extends menuaiEntityBase {
  attributes: PersonEntityAttributes;
}

export const fetchPersons = (menuai: menuai) =>
  menuai.callWS<{
    storage: Person[];
    config: Person[];
  }>({ type: "person/list" });

export const createPerson = (
  menuai: menuai,
  values: PersonMutableParams
) =>
  menuai.callWS<Person>({
    type: "person/create",
    ...values,
  });

export const updatePerson = (
  menuai: menuai,
  personId: string,
  updates: Partial<PersonMutableParams>
) =>
  menuai.callWS<Person>({
    type: "person/update",
    person_id: personId,
    ...updates,
  });

export const deletePerson = (menuai: menuai, personId: string) =>
  menuai.callWS({
    type: "person/delete",
    person_id: personId,
  });
