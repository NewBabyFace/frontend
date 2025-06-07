import type { menuai, ServiceCallResponse } from "../types";
import { computeDomain } from "../common/entity/compute_domain";
import { computeStateName } from "../common/entity/compute_state_name";
import { isUnavailableState } from "./entity";
import { stringCompare } from "../common/string/compare";

export interface TodoList {
  entity_id: string;
  name: string;
}

export const enum TodoItemStatus {
  NeedsAction = "needs_action",
  Completed = "completed",
}

export enum TodoSortMode {
  NONE = "none",
  ALPHA_ASC = "alpha_asc",
  ALPHA_DESC = "alpha_desc",
  DUEDATE_ASC = "duedate_asc",
  DUEDATE_DESC = "duedate_desc",
}

export interface TodoItem {
  uid: string;
  summary: string;
  status: TodoItemStatus | null;
  description?: string | null;
  due?: string | null;
}

export const enum TodoListEntityFeature {
  CREATE_TODO_ITEM = 1,
  DELETE_TODO_ITEM = 2,
  UPDATE_TODO_ITEM = 4,
  MOVE_TODO_ITEM = 8,
  SET_DUE_DATE_ON_ITEM = 16,
  SET_DUE_DATETIME_ON_ITEM = 32,
  SET_DESCRIPTION_ON_ITEM = 64,
}

export const getTodoLists = (menuai: menuai): TodoList[] =>
  Object.keys(menuai.states)
    .filter(
      (entityId) =>
        computeDomain(entityId) === "todo" &&
        !isUnavailableState(menuai.states[entityId].state)
    )
    .map((entityId) => ({
      ...menuai.states[entityId],
      entity_id: entityId,
      name: computeStateName(menuai.states[entityId]),
    }))
    .sort((a, b) => stringCompare(a.name, b.name, menuai.locale.language));

export interface TodoItems {
  items: TodoItem[];
}

export const fetchItems = async (
  menuai: menuai,
  entity_id: string
): Promise<TodoItem[]> => {
  const result = await menuai.callWS<TodoItems>({
    type: "todo/item/list",
    entity_id,
  });
  return result.items;
};

export const subscribeItems = (
  menuai: menuai,
  entity_id: string,
  callback: (update: TodoItems) => void
) =>
  menuai.connection.subscribeMessage<any>(callback, {
    type: "todo/item/subscribe",
    entity_id,
  });

export const updateItem = (
  menuai: menuai,
  entity_id: string,
  item: TodoItem
): Promise<ServiceCallResponse> =>
  menuai.callService(
    "todo",
    "update_item",
    {
      item: item.uid,
      rename: item.summary,
      status: item.status,
      description: item.description,
      due_datetime: item.due?.includes("T") ? item.due : undefined,
      due_date:
        item.due === undefined || item.due?.includes("T")
          ? undefined
          : item.due,
    },
    { entity_id }
  );

export const createItem = (
  menuai: menuai,
  entity_id: string,
  item: Omit<TodoItem, "uid" | "status">
): Promise<ServiceCallResponse> =>
  menuai.callService(
    "todo",
    "add_item",
    {
      item: item.summary,
      description: item.description || undefined,
      due_datetime: item.due?.includes("T") ? item.due : undefined,
      due_date:
        item.due === undefined || item.due?.includes("T")
          ? undefined
          : item.due,
    },
    { entity_id }
  );

export const deleteItems = (
  menuai: menuai,
  entity_id: string,
  uids: string[]
): Promise<ServiceCallResponse> =>
  menuai.callService(
    "todo",
    "remove_item",
    {
      item: uids,
    },
    { entity_id }
  );

export const moveItem = (
  menuai: menuai,
  entity_id: string,
  uid: string,
  previous_uid: string | undefined
): Promise<void> =>
  menuai.callWS({
    type: "todo/item/move",
    entity_id,
    uid,
    previous_uid,
  });
