import type { PageNavigation } from "../../layouts/menuai-tabs-subpage";
import type { menuai } from "../../types";
import { ensureArray } from "../array/ensure-array";
import { isComponentLoaded } from "./is_component_loaded";

export const canShowPage = (menuai: menuai, page: PageNavigation) =>
  (isCore(page) || isLoadedIntegration(menuai, page)) &&
  !hideAdvancedPage(menuai, page) &&
  isNotLoadedIntegration(menuai, page);

export const isLoadedIntegration = (
  menuai: menuai,
  page: PageNavigation
) =>
  !page.component ||
  ensureArray(page.component).some((integration) =>
    isComponentLoaded(menuai, integration)
  );

export const isNotLoadedIntegration = (
  menuai: menuai,
  page: PageNavigation
) =>
  !page.not_component ||
  !ensureArray(page.not_component).some((integration) =>
    isComponentLoaded(menuai, integration)
  );

export const isCore = (page: PageNavigation) => page.core;
export const isAdvancedPage = (page: PageNavigation) => page.advancedOnly;
export const userWantsAdvanced = (menuai: menuai) =>
  menuai.userData?.showAdvanced;
export const hideAdvancedPage = (menuai: menuai, page: PageNavigation) =>
  isAdvancedPage(page) && !userWantsAdvanced(menuai);
