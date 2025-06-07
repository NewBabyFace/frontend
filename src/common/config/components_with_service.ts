import type { menuai } from "../../types";

/** Return an array of domains with the service. */
export const componentsWithService = (
  menuai: menuai,
  service: string
): string[] =>
  menuai &&
  Object.keys(menuai.services).filter((key) => service in menuai.services[key]);
