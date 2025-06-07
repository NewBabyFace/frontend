import type { HaFormSchema } from "../components/ha-form/types";
import type { menuai } from "../types";
import type { RefreshTokenType } from "./refresh_token";

export interface AuthUrlSearchParams {
  client_id?: string;
  redirect_uri?: string;
  state?: string;
}

export interface AuthProvider {
  name: string;
  id: string;
  type: string;
  users?: Record<string, string>;
}

export interface Credential {
  type: string;
}

export interface SignedPath {
  path: string;
}

export const menuaiUrl = __menuai_URL__;

export const autocompleteLoginFields = (schema: HaFormSchema[]) =>
  schema.map((field) => {
    if (field.type !== "string") return field;
    switch (field.name) {
      case "username":
        return { ...field, autocomplete: "username", autofocus: true };
      case "password":
        return { ...field, autocomplete: "current-password" };
      case "code":
        return { ...field, autocomplete: "one-time-code", autofocus: true };
      default:
        return field;
    }
  });

export const getSignedPath = (
  menuai: menuai,
  path: string
): Promise<SignedPath> => menuai.callWS({ type: "auth/sign_path", path });

export const fetchAuthProviders = () =>
  fetch("/auth/providers", {
    credentials: "same-origin",
  });

export const createLoginFlow = (
  client_id: string | undefined,
  redirect_uri: string | undefined,
  handler: (string | null)[]
) =>
  fetch("/auth/login_flow", {
    method: "POST",
    credentials: "same-origin",
    body: JSON.stringify({
      client_id,
      handler,
      redirect_uri,
    }),
  });

export const submitLoginFlow = (flow_id: string, data: Record<string, any>) =>
  fetch(`/auth/login_flow/${flow_id}`, {
    method: "POST",
    credentials: "same-origin",
    body: JSON.stringify(data),
  });

export const deleteLoginFlow = (flow_id) =>
  fetch(`/auth/login_flow/${flow_id}`, {
    method: "DELETE",
    credentials: "same-origin",
  });

export const redirectWithAuthCode = (
  url: string,
  authCode: string,
  oauth2State: string | undefined,
  storeToken: boolean
) => {
  // OAuth 2: 3.1.2 we need to retain query component of a redirect URI
  if (!url.includes("?")) {
    url += "?";
  } else if (!url.endsWith("&")) {
    url += "&";
  }

  url += `code=${encodeURIComponent(authCode)}`;

  if (oauth2State) {
    url += `&state=${encodeURIComponent(oauth2State)}`;
  }
  if (storeToken) {
    url += `&storeToken=true`;
  }

  document.location.assign(url);
};

export const createAuthForUser = async (
  menuai: menuai,
  userId: string,
  username: string,
  password: string
) =>
  menuai.callWS({
    type: "config/auth_provider/menuai/create",
    user_id: userId,
    username,
    password,
  });

export const changePassword = (
  menuai: menuai,
  current_password: string,
  new_password: string
) =>
  menuai.callWS({
    type: "config/auth_provider/menuai/change_password",
    current_password,
    new_password,
  });

export const adminChangePassword = (
  menuai: menuai,
  userId: string,
  password: string
) =>
  menuai.callWS<undefined>({
    type: "config/auth_provider/menuai/admin_change_password",
    user_id: userId,
    password,
  });

export const adminChangeUsername = (
  menuai: menuai,
  userId: string,
  username: string
) =>
  menuai.callWS<undefined>({
    type: "config/auth_provider/menuai/admin_change_username",
    user_id: userId,
    username,
  });

export const deleteAllRefreshTokens = (
  menuai: menuai,
  token_type?: RefreshTokenType,
  delete_current_token?: boolean
) =>
  menuai.callWS({
    type: "auth/delete_all_refresh_tokens",
    token_type,
    delete_current_token,
  });
