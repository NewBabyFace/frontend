import type { menuai } from "../types";

export interface ApplicationCredentialsDomainConfig {
  description_placeholders: Record<string, string>;
}

export interface ApplicationCredentialsConfig {
  integrations: Record<string, ApplicationCredentialsDomainConfig>;
}

export interface ApplicationCredentialsConfigEntry {
  application_credentials_id?: string;
}

export interface ApplicationCredential {
  id: string;
  domain: string;
  client_id: string;
  client_secret: string;
  name: string;
}

export const fetchApplicationCredentialsConfig = async (menuai: menuai) =>
  menuai.callWS<ApplicationCredentialsConfig>({
    type: "application_credentials/config",
  });

export const fetchApplicationCredentialsConfigEntry = async (
  menuai: menuai,
  configEntryId: string
) =>
  menuai.callWS<ApplicationCredentialsConfigEntry>({
    type: "application_credentials/config_entry",
    config_entry_id: configEntryId,
  });

export const fetchApplicationCredentials = async (menuai: menuai) =>
  menuai.callWS<ApplicationCredential[]>({
    type: "application_credentials/list",
  });

export const createApplicationCredential = async (
  menuai: menuai,
  domain: string,
  clientId: string,
  clientSecret: string,
  name?: string
) =>
  menuai.callWS<ApplicationCredential>({
    type: "application_credentials/create",
    domain,
    client_id: clientId,
    client_secret: clientSecret,
    name,
  });

export const deleteApplicationCredential = async (
  menuai: menuai,
  applicationCredentialsId: string
) =>
  menuai.callWS<undefined>({
    type: "application_credentials/delete",
    application_credentials_id: applicationCredentialsId,
  });
