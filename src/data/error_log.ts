import type { menuai } from "../types";

export interface LogProvider {
  key: string;
  name: string;
}

export const fetchErrorLog = (menuai: menuai) =>
  menuai.callApi<string>("GET", "error_log");

export const getErrorLogDownloadUrl = "/api/error_log";
