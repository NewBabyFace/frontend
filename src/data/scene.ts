import type {
  menuaiEntityAttributeBase,
  menuaiEntityBase,
} from "home-assistant-js-websocket";
import { navigate } from "../common/navigate";
import type { menuai, ServiceCallResponse } from "../types";

export const SCENE_IGNORED_DOMAINS = [
  "binary_sensor",
  "button",
  "configuration",
  "device_tracker",
  "event",
  "image_processing",
  "input_button",
  "persistent_notification",
  "person",
  "scene",
  "schedule",
  "script",
  "sensor",
  "sun",
  "update",
  "weather",
  "zone",
];

let inititialSceneEditorData:
  | { config?: Partial<SceneConfig>; areaId?: string }
  | undefined;

export const showSceneEditor = (
  config?: Partial<SceneConfig>,
  areaId?: string
) => {
  inititialSceneEditorData = { config, areaId };
  navigate("/config/scene/edit/new");
};

export const getSceneEditorInitData = () => {
  const data = inititialSceneEditorData;
  inititialSceneEditorData = undefined;
  return data;
};

export interface SceneEntity extends menuaiEntityBase {
  attributes: menuaiEntityAttributeBase & { id?: string };
}

export interface SceneConfig {
  id?: string;
  name: string;
  icon?: string;
  entities: SceneEntities;
  metadata?: SceneMetaData;
}

export type SceneEntities = Record<
  string,
  string | { state: string; [key: string]: any }
>;

export type SceneMetaData = Record<
  string,
  { entity_only?: boolean | undefined }
>;

export const activateScene = (
  menuai: menuai,
  entityId: string
): Promise<ServiceCallResponse> =>
  menuai.callService("scene", "turn_on", { entity_id: entityId });

export const applyScene = (
  menuai: menuai,
  entities: SceneEntities
): Promise<ServiceCallResponse> =>
  menuai.callService("scene", "apply", { entities });

export const getSceneConfig = (
  menuai: menuai,
  sceneId: string
): Promise<SceneConfig> =>
  menuai.callApi<SceneConfig>("GET", `config/scene/config/${sceneId}`);

export const saveScene = (
  menuai: menuai,
  sceneId: string,
  config: SceneConfig
) => menuai.callApi("POST", `config/scene/config/${sceneId}`, config);

export const deleteScene = (menuai: menuai, id: string) =>
  menuai.callApi("DELETE", `config/scene/config/${id}`);
