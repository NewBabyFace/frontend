import { atLeastVersion } from "../../common/config/version";
import type { menuai } from "../../types";
import type { menuaiioResponse } from "./common";
import type { CreateSessionResponse } from "./supervisor";

function setIngressCookie(session: string): string {
  document.cookie = `ingress_session=${session};path=/api/menuaiio_ingress/;SameSite=Strict${
    location.protocol === "https:" ? ";Secure" : ""
  }`;
  return session;
}

export const createmenuaiioSession = async (
  menuai: menuai
): Promise<string> => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    const wsResponse: { session: string } = await menuai.callWS({
      type: "supervisor/api",
      endpoint: "/ingress/session",
      method: "post",
    });
    return setIngressCookie(wsResponse.session);
  }

  const restResponse: { data: { session: string } } = await menuai.callApi<
    menuaiioResponse<CreateSessionResponse>
  >("POST", "menuaiio/ingress/session");
  return setIngressCookie(restResponse.data.session);
};

export const validatemenuaiioSession = async (
  menuai: menuai,
  session: string
): Promise<void> => {
  if (atLeastVersion(menuai.config.version, 2021, 2, 4)) {
    await menuai.callWS({
      type: "supervisor/api",
      endpoint: "/ingress/validate_session",
      method: "post",
      data: { session },
    });
    return;
  }

  await menuai.callApi<menuaiioResponse<void>>(
    "POST",
    "menuaiio/ingress/validate_session",
    { session }
  );
};
