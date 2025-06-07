import type { LitElement } from "lit";
import type { menuai } from "../../types";

export function computeRTL(menuai: menuai) {
  const lang = menuai.language || "en";
  if (menuai.translationMetadata.translations[lang]) {
    return menuai.translationMetadata.translations[lang].isRTL || false;
  }
  return false;
}

export function computeRTLDirection(menuai: menuai) {
  return emitRTLDirection(computeRTL(menuai));
}

export function emitRTLDirection(rtl: boolean) {
  return rtl ? "rtl" : "ltr";
}

export function computeDirectionStyles(isRTL: boolean, element: LitElement) {
  const direction: string = emitRTLDirection(isRTL);
  setDirectionStyles(direction, element);
}

export function setDirectionStyles(direction: string, element: LitElement) {
  document.dir = direction;
  element.style.direction = direction;
  element.style.setProperty("--direction", direction);
  element.style.setProperty(
    "--float-start",
    direction === "ltr" ? "left" : "right"
  );
  element.style.setProperty(
    "--float-end",
    direction === "ltr" ? "right" : "left"
  );
  element.style.setProperty(
    "--margin-title",
    direction === "ltr" ? "var(--margin-title-ltr)" : "var(--margin-title-rtl)"
  );
  element.style.setProperty(
    "--scale-direction",
    direction === "ltr" ? "1" : "-1"
  );
}
