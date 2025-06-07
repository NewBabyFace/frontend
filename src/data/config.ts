import type { menuai } from "../types";

interface ValidConfig {
  valid: true;
  error: null;
}

interface InvalidConfig {
  valid: false;
  error: string;
}

type ValidKeys = "triggers" | "actions" | "conditions";

export const validateConfig = <T extends Partial<Record<ValidKeys, unknown>>>(
  menuai: menuai,
  config: T
): Promise<Record<keyof T, ValidConfig | InvalidConfig>> =>
  menuai.callWS({
    type: "validate_config",
    ...config,
  });
