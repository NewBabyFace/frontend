import type { menuai } from "../../types";

/** Get the location name from a menuai object. */
export default function computeLocationName(menuai: menuai): string {
  return menuai && menuai.config.location_name;
}
