import type { menuai } from "../../types";

export const canToggleDomain = (menuai: menuai, domain: string) => {
  const services = menuai.services[domain];
  if (!services) {
    return false;
  }

  if (domain === "lock") {
    return "lock" in services;
  }
  if (domain === "cover") {
    return "open_cover" in services;
  }
  return "turn_on" in services;
};
