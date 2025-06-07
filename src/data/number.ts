import type { menuai } from "../types";

export interface NumberDeviceClassUnits {
  units: string[];
}

export const getNumberDeviceClassConvertibleUnits = (
  menuai: menuai,
  deviceClass: string
): Promise<NumberDeviceClassUnits> =>
  menuai.callWS({
    type: "number/device_class_convertible_units",
    device_class: deviceClass,
  });
