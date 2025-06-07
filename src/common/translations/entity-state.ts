import type { menuaiConfig, menuaiEntity } from "home-assistant-js-websocket";
import type { FrontendLocaleData } from "../../data/translation";
import type { menuai } from "../../types";
import type { LocalizeFunc } from "./localize";

export type FormatEntityStateFunc = (
  stateObj: menuaiEntity,
  state?: string
) => string;
export type FormatEntityAttributeValueFunc = (
  stateObj: menuaiEntity,
  attribute: string,
  value?: any
) => string;
export type FormatEntityAttributeNameFunc = (
  stateObj: menuaiEntity,
  attribute: string
) => string;

export const computeFormatFunctions = async (
  localize: LocalizeFunc,
  locale: FrontendLocaleData,
  config: menuaiConfig,
  entities: menuai["entities"],
  sensorNumericDeviceClasses: string[]
): Promise<{
  formatEntityState: FormatEntityStateFunc;
  formatEntityAttributeValue: FormatEntityAttributeValueFunc;
  formatEntityAttributeName: FormatEntityAttributeNameFunc;
}> => {
  const { computeStateDisplay } = await import(
    "../entity/compute_state_display"
  );
  const { computeAttributeValueDisplay, computeAttributeNameDisplay } =
    await import("../entity/compute_attribute_display");

  return {
    formatEntityState: (stateObj, state) =>
      computeStateDisplay(
        localize,
        stateObj,
        locale,
        sensorNumericDeviceClasses,
        config,
        entities,
        state
      ),
    formatEntityAttributeValue: (stateObj, attribute, value) =>
      computeAttributeValueDisplay(
        localize,
        stateObj,
        locale,
        config,
        entities,
        attribute,
        value
      ),
    formatEntityAttributeName: (stateObj, attribute) =>
      computeAttributeNameDisplay(localize, stateObj, entities, attribute),
  };
};
