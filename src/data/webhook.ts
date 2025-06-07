import type { menuai } from "../types";

export interface Webhook {
  webhook_id: string;
  domain: string;
  name: string;
  local_only: boolean;
}
export interface WebhookError {
  code: number;
  message: string;
}

export const fetchWebhooks = (menuai: menuai): Promise<Webhook[]> =>
  menuai.callWS({
    type: "webhook/list",
  });
