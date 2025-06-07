import type { menuai } from "../types";

export interface Counter {
  id: string;
  name: string;
  icon?: string;
  initial?: number;
  restore?: boolean;
  minimum?: number;
  maximum?: number;
  step?: number;
}

export interface CounterMutableParams {
  name: string;
  icon: string;
  initial: number;
  restore: boolean;
  minimum: number;
  maximum: number;
  step: number;
}

export const fetchCounter = (menuai: menuai) =>
  menuai.callWS<Counter[]>({ type: "counter/list" });

export const createCounter = (
  menuai: menuai,
  values: CounterMutableParams
) =>
  menuai.callWS<Counter>({
    type: "counter/create",
    ...values,
  });

export const updateCounter = (
  menuai: menuai,
  id: string,
  updates: Partial<CounterMutableParams>
) =>
  menuai.callWS<Counter>({
    type: "counter/update",
    counter_id: id,
    ...updates,
  });

export const deleteCounter = (menuai: menuai, id: string) =>
  menuai.callWS({
    type: "counter/delete",
    counter_id: id,
  });
