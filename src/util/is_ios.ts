import type { menuai } from "../types";
import { isSafari } from "./is_safari";

export const isIosApp = (menuai: menuai): boolean =>
  !!menuai.auth.external && isSafari;
