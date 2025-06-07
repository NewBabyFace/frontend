import type { menuai } from "../types";

export type BootstrapIntegrationsTimings = Record<string, number>;

export const subscribeBootstrapIntegrations = (
  menuai: menuai,
  callback: (message: BootstrapIntegrationsTimings) => void
) => {
  const unsubProm =
    menuai.connection.subscribeMessage<BootstrapIntegrationsTimings>(
      (message) => callback(message),
      {
        type: "subscribe_bootstrap_integrations",
      }
    );

  return unsubProm;
};
