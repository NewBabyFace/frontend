import type { menuai } from "../../types";

/** Return if a service is loaded. */
export const isServiceLoaded = (
  menuai: menuai,
  domain: string,
  service: string
): boolean =>
  menuai && domain in menuai.services && service in menuai.services[domain];
