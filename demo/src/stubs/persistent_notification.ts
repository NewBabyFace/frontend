import type { PersistentNotificationMessage } from "../../../src/data/persistent_notification";
import type { Mockmenuai } from "../../../src/fake_data/provide_menuai";

export const mockPersistentNotification = (menuai: Mockmenuai) => {
  menuai.mockWS("persistent_notification/subscribe", (_msg, _menuai, onChange) => {
    onChange!({
      type: "added",
      notifications: {
        "demo-1": {
          created_at: new Date().toISOString(),
          message: "There was motion detected in the backyard.",
          notification_id: "demo-1",
          title: "Motion Detected!",
          status: "unread",
        },
      },
    } as PersistentNotificationMessage);
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return () => {};
  });
};
