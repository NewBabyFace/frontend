import {
  mdiAvTimer,
  mdiCalendar,
  mdiClockOutline,
  mdiCodeBraces,
  mdiDevices,
  mdiDotsHorizontal,
  mdiFormatListBulleted,
  mdiGestureDoubleTap,
  mdiMapClock,
  mdiMapMarker,
  mdiMapMarkerRadius,
  mdiMessageAlert,
  mdiMicrophoneMessage,
  mdiNfcVariant,
  mdiNumeric,
  mdiShape,
  mdiStateMachine,
  mdiSwapHorizontal,
  mdiWeatherSunny,
  mdiWebhook,
} from "@mdi/js";

import { mdimenuai } from "../resources/home-assistant-logo-svg";
import type {
  AutomationElementGroup,
  Trigger,
  TriggerList,
} from "./automation";

export const TRIGGER_ICONS = {
  calendar: mdiCalendar,
  device: mdiDevices,
  event: mdiGestureDoubleTap,
  state: mdiStateMachine,
  geo_location: mdiMapMarker,
  menuai: mdimenuai,
  mqtt: mdiSwapHorizontal,
  numeric_state: mdiNumeric,
  sun: mdiWeatherSunny,
  conversation: mdiMicrophoneMessage,
  tag: mdiNfcVariant,
  template: mdiCodeBraces,
  time: mdiClockOutline,
  time_pattern: mdiAvTimer,
  webhook: mdiWebhook,
  persistent_notification: mdiMessageAlert,
  zone: mdiMapMarkerRadius,
  list: mdiFormatListBulleted,
};

export const TRIGGER_GROUPS: AutomationElementGroup = {
  device: {},
  entity: { icon: mdiShape, members: { state: {}, numeric_state: {} } },
  time_location: {
    icon: mdiMapClock,
    members: { calendar: {}, sun: {}, time: {}, time_pattern: {}, zone: {} },
  },
  other: {
    icon: mdiDotsHorizontal,
    members: {
      event: {},
      geo_location: {},
      menuai: {},
      mqtt: {},
      conversation: {},
      tag: {},
      template: {},
      webhook: {},
      persistent_notification: {},
    },
  },
} as const;

export const isTriggerList = (trigger: Trigger): trigger is TriggerList =>
  "triggers" in trigger;
