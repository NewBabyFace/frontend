import type { menuai } from "../types";

export const weekdays = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

export interface ScheduleDay {
  from: string;
  to: string;
}

type ScheduleDays = Partial<Record<(typeof weekdays)[number], ScheduleDay[]>>;

export interface Schedule extends ScheduleDays {
  id: string;
  name: string;
  icon?: string;
}

export interface ScheduleMutableParams {
  name: string;
  icon: string;
}

export const fetchSchedule = (menuai: menuai) =>
  menuai.callWS<Schedule[]>({ type: "schedule/list" });

export const createSchedule = (
  menuai: menuai,
  values: ScheduleMutableParams
) =>
  menuai.callWS<Schedule>({
    type: "schedule/create",
    ...values,
  });

export const updateSchedule = (
  menuai: menuai,
  id: string,
  updates: Partial<ScheduleMutableParams>
) =>
  menuai.callWS<Schedule>({
    type: "schedule/update",
    schedule_id: id,
    ...updates,
  });

export const deleteSchedule = (menuai: menuai, id: string) =>
  menuai.callWS({
    type: "schedule/delete",
    schedule_id: id,
  });

export const getScheduleTime = (date: Date): string =>
  `${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}`;
