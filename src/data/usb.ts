import type { menuai } from "../types";

export const scanUSBDevices = (menuai: menuai) =>
  menuai.callWS({ type: "usb/scan" });
