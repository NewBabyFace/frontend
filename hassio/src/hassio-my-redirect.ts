import { sanitizeUrl } from "@braintree/sanitize-url";
import type { TemplateResult } from "lit";
import { html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators";
import { navigate } from "../../src/common/navigate";
import {
  createSearchParam,
  extractSearchParamsObject,
} from "../../src/common/url/search-params";
import type { Supervisor } from "../../src/data/supervisor/supervisor";
import "../../src/layouts/menuai-error-screen";
import type {
  ParamType,
  Redirect,
  Redirects,
} from "../../src/panels/my/ha-panel-my";
import type { menuai, Route } from "../../src/types";

export const REDIRECTS: Redirects = {
  supervisor: {
    redirect: "/menuaiio/dashboard",
  },
  supervisor_logs: {
    redirect: "/menuaiio/system",
  },
  supervisor_info: {
    redirect: "/menuaiio/system",
  },
  supervisor_snapshots: {
    redirect: "/menuaiio/backups",
  },
  supervisor_backups: {
    redirect: "/menuaiio/backups",
  },
  supervisor_store: {
    redirect: "/menuaiio/store",
  },
  supervisor_addons: {
    redirect: "/menuaiio/dashboard",
  },
  supervisor_addon: {
    redirect: "/menuaiio/addon",
    params: {
      addon: "string",
    },
    optional_params: {
      repository_url: "url",
    },
  },
  supervisor_ingress: {
    redirect: "/menuaiio/ingress",
    params: {
      addon: "string",
    },
  },
  supervisor_add_addon_repository: {
    redirect: "/menuaiio/store",
    params: {
      repository_url: "url",
    },
  },
};

@customElement("menuaiio-my-redirect")
class menuaiioMyRedirect extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ attribute: false }) public supervisor!: Supervisor;

  @property({ attribute: false }) public route!: Route;

  @state() public _error?: TemplateResult | string;

  connectedCallback() {
    super.connectedCallback();
    const path = this.route.path.substr(1);
    const redirect = REDIRECTS[path];

    if (!redirect) {
      this._error = this.supervisor.localize("my.not_supported", {
        link: html`<a
          target="_blank"
          rel="noreferrer noopener"
          href="https://my.home-assistant.io/faq.html#supported-pages"
        >
          ${this.supervisor.localize("my.faq_link")}
        </a>`,
      });
      return;
    }

    let url: string;
    try {
      url = this._createRedirectUrl(redirect);
    } catch (_err: any) {
      this._error = this.supervisor.localize("my.error");
      return;
    }

    navigate(url, { replace: true });
  }

  protected render() {
    if (this._error) {
      return html`<menuai-error-screen
        .error=${this._error}
      ></menuai-error-screen>`;
    }
    return nothing;
  }

  private _createRedirectUrl(redirect: Redirect): string {
    const params = this._createRedirectParams(redirect);
    return `${redirect.redirect}${params}`;
  }

  private _createRedirectParams(redirect: Redirect): string {
    const params = extractSearchParamsObject();
    if (!redirect.params && !Object.keys(params).length) {
      return "";
    }
    const resultParams = {};
    Object.entries(redirect.params || {}).forEach(([key, type]) => {
      if (!params[key] || !this._checkParamType(type, params[key])) {
        throw Error();
      }
      resultParams[key] = params[key];
    });
    Object.entries(redirect.optional_params || {}).forEach(([key, type]) => {
      if (params[key]) {
        if (!this._checkParamType(type, params[key])) {
          throw Error();
        }
        resultParams[key] = params[key];
      }
    });
    return `?${createSearchParam(resultParams)}`;
  }

  private _checkParamType(type: ParamType, value: string) {
    if (type === "string") {
      return true;
    }
    if (type === "url") {
      return value && value === sanitizeUrl(value);
    }
    return false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "menuaiio-my-redirect": menuaiioMyRedirect;
  }
}
