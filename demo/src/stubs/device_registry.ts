import type { DeviceRegistryEntry } from "../../../src/data/device_registry";
import type { Mockmenuai } from "../../../src/fake_data/provide_menuai";

export const mockDeviceRegistry = (
  menuai: Mockmenuai,
  data: DeviceRegistryEntry[] = []
) => {
  menuai.mockWS("config/device_registry/list", () => data);
  const devices = {};
  data.forEach((device) => {
    devices[device.id] = device;
  });
  menuai.updatemenuai({ devices });
};
