import type { menuai } from "../../types";

/** Return if a component is loaded. */
export const isComponentLoaded = (
  menuai: menuai,
  component: string
): boolean => menuai && menuai.config.components.includes(component);
