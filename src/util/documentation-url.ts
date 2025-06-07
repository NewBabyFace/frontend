import type { menuai } from "../types";

export const documentationUrl = (menuai: menuai, path: string) =>
  `https://${
    menuai.config.version.includes("b")
      ? "rc"
      : menuai.config.version.includes("dev")
        ? "next"
        : "www"
  }.home-assistant.io${path}`;
