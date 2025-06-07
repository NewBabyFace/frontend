import type { menuaiEventBase } from "home-assistant-js-websocket";
import type { menuai } from "../types";

export const EVENT_TAG_SCANNED = "tag_scanned";

export interface TagScannedEvent extends menuaiEventBase {
  event_type: "tag_scanned";
  data: {
    tag_id: string;
    device_id?: string;
  };
}

export interface Tag {
  id: string;
  name?: string;
  description?: string;
  last_scanned?: string;
}

export interface UpdateTagParams {
  name?: Tag["name"];
  description?: Tag["description"];
}

export const fetchTags = async (menuai: menuai) =>
  menuai.callWS<Tag[]>({
    type: "tag/list",
  });

export const createTag = async (
  menuai: menuai,
  params: UpdateTagParams,
  tagId?: string
) =>
  menuai.callWS<Tag>({
    type: "tag/create",
    tag_id: tagId,
    ...params,
  });

export const updateTag = async (
  menuai: menuai,
  tagId: string,
  params: UpdateTagParams
) =>
  menuai.callWS<Tag>({
    ...params,
    type: "tag/update",
    tag_id: tagId,
  });

export const deleteTag = async (menuai: menuai, tagId: string) =>
  menuai.callWS<undefined>({
    type: "tag/delete",
    tag_id: tagId,
  });
