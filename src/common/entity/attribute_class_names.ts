import type { menuaiEntity } from "home-assistant-js-websocket";

export const attributeClassNames = (
  stateObj: menuaiEntity,
  attributes: string[]
): string => {
  if (!stateObj) {
    return "";
  }
  return attributes
    .map((attribute) =>
      attribute in stateObj.attributes ? "has-" + attribute : ""
    )
    .filter((attr) => attr !== "")
    .join(" ");
};
