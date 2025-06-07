import type { DeviceRegistryEntry } from "../../../../../../data/device_registry";
import { fetchZwaveNodeAlerts } from "../../../../../../data/zwave_js";
import type { menuai } from "../../../../../../types";
import type { DeviceAlert } from "../../../ha-config-device-page";

export const getZwaveDeviceAlerts = async (
  menuai: menuai,
  device: DeviceRegistryEntry
): Promise<DeviceAlert[]> => {
  const nodeAlerts = await fetchZwaveNodeAlerts(menuai, device.id);
  const deviceAlerts: DeviceAlert[] = [];

  if (nodeAlerts?.is_embedded === false) {
    deviceAlerts.push({
      level: "info",
      text: menuai.localize(
        "ui.panel.config.zwave_js.device_info.custom_device_config"
      ),
    });
  }

  if (!nodeAlerts?.comments?.length) {
    return deviceAlerts;
  }

  deviceAlerts.push(
    ...nodeAlerts.comments.map((comment) => ({
      level: comment.level,
      text: comment.text,
    }))
  );
  return deviceAlerts;
};
