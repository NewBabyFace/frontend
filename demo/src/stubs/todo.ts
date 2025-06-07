import type { TodoItem } from "../../../src/data/todo";
import { TodoItemStatus } from "../../../src/data/todo";
import type { Mockmenuai } from "../../../src/fake_data/provide_menuai";

const items = {
  items: [
    {
      uid: "12",
      summary: "Milk",
      status: TodoItemStatus.NeedsAction,
    },
    {
      uid: "13",
      summary: "Eggs",
      status: TodoItemStatus.NeedsAction,
    },
    {
      uid: "14",
      summary: "Oranges",
      status: TodoItemStatus.Completed,
    },
    {
      uid: "15",
      summary: "Beer",
    },
  ] as TodoItem[],
};

export const mockTodo = (menuai: Mockmenuai) => {
  menuai.mockWS("todo/item/list", () => items);
  menuai.mockWS("todo/item/move", () => undefined);
  menuai.mockWS("todo/item/subscribe", (_msg, _menuai, onChange) => {
    onChange!(items);
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {};
  });
};
