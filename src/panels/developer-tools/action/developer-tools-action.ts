import { mdiHelpCircle } from "@mdi/js";
import type { menuaiService } from "home-assistant-js-websocket";
import { ERR_CONNECTION_LOST } from "home-assistant-js-websocket";
import { load } from "js-yaml";
import type { CSSResultGroup } from "lit";
import { css, html, LitElement, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators";
import memoizeOne from "memoize-one";
import { storage } from "../../../common/decorators/storage";
import { computeDomain } from "../../../common/entity/compute_domain";
import { computeObjectId } from "../../../common/entity/compute_object_id";
import { hasTemplate, isTemplate } from "../../../common/string/has-template";
import type { LocalizeFunc } from "../../../common/translations/localize";
import { extractSearchParam } from "../../../common/url/search-params";
import { copyToClipboard } from "../../../common/util/copy-clipboard";
import type { HaProgressButton } from "../../../components/buttons/ha-progress-button";
import { showToast } from "../../../util/toast";

import "../../../components/entity/ha-entity-picker";
import "../../../components/ha-alert";
import "../../../components/ha-button";
import "../../../components/ha-card";
import "../../../components/buttons/ha-progress-button";
import "../../../components/ha-expansion-panel";
import "../../../components/ha-icon-button";
import "../../../components/ha-service-control";
import "../../../components/ha-service-picker";
import "../../../components/ha-yaml-editor";
import type { HaYamlEditor } from "../../../components/ha-yaml-editor";
import { forwardHaptic } from "../../../data/haptics";
import type { Action, ServiceAction } from "../../../data/script";
import { migrateAutomationAction } from "../../../data/script";
import {
  callExecuteScript,
  serviceCallWillDisconnect,
} from "../../../data/service";
import { haStyle } from "../../../resources/styles";
import type { menuai } from "../../../types";
import { documentationUrl } from "../../../util/documentation-url";

@customElement("developer-tools-action")
class HaPanelDevAction extends LitElement {
  @property({ attribute: false }) public menuai!: menuai;

  @property({ type: Boolean }) public narrow = false;

  @state() private _uiAvailable = true;

  @state() private _response?: Record<string, any>;

  @state() private _error?: string;

  private _yamlValid = true;

  @state()
  @storage({
    key: "panel-dev-action-state-service-data",
    state: true,
    subscribe: false,
  })
  private _serviceData?: ServiceAction = { action: "", target: {}, data: {} };

  @state()
  @storage({
    key: "panel-dev-action-state-yaml-mode",
    state: true,
    subscribe: false,
  })
  private _yamlMode = false;

  @query("#yaml-editor") private _yamlEditor?: HaYamlEditor;

  protected willUpdate() {
    if (
      !this.hasUpdated &&
      this._serviceData?.action &&
      typeof this._serviceData.action !== "string"
    ) {
      this._serviceData.action = "";
    }
  }

  protected firstUpdated(params) {
    super.firstUpdated(params);
    this.menuai.loadBackendTranslation("services");
    this.menuai.loadBackendTranslation("selector");

    const serviceParam = extractSearchParam("service");
    if (serviceParam) {
      this._serviceData = {
        action: serviceParam,
        target: {},
        data: {},
      };
      if (this._yamlMode) {
        this.updateComplete.then(() =>
          this._yamlEditor?.setValue(this._serviceData)
        );
      }
    } else if (!this._serviceData?.action) {
      const domain = Object.keys(this.menuai.services).sort()[0];
      const service = Object.keys(this.menuai.services[domain]).sort()[0];
      this._serviceData = {
        action: `${domain}.${service}`,
        target: {},
        data: {},
      };
      if (this._yamlMode) {
        this.updateComplete.then(() =>
          this._yamlEditor?.setValue(this._serviceData)
        );
      }
    }
    this._checkUiSupported();
  }

  protected render() {
    const { target, fields } = this._fields(
      this.menuai.services,
      this._serviceData?.action
    );

    const domain = this._serviceData?.action
      ? computeDomain(this._serviceData?.action)
      : undefined;

    const serviceName = this._serviceData?.action
      ? computeObjectId(this._serviceData?.action)
      : undefined;

    return html`
      <div class="content">
        <p>
          ${this.menuai.localize(
            "ui.panel.developer-tools.tabs.actions.description"
          )}
        </p>
        <ha-card>
          ${this._yamlMode
            ? html`<div class="card-content">
                <ha-service-picker
                  .menuai=${this.menuai}
                  .value=${this._serviceData?.action}
                  @value-changed=${this._serviceChanged}
                  show-service-id
                ></ha-service-picker>
                <ha-yaml-editor
                  id="yaml-editor"
                  .menuai=${this.menuai}
                  .defaultValue=${this._serviceData}
                  @value-changed=${this._yamlChanged}
                ></ha-yaml-editor>
              </div>`
            : html`
                <ha-service-control
                  .menuai=${this.menuai}
                  .value=${this._serviceData}
                  .narrow=${this.narrow}
                  show-advanced
                  show-service-id
                  @value-changed=${this._serviceDataChanged}
                  class="card-content"
                ></ha-service-control>
              `}
          ${this._error !== undefined
            ? html`<ha-alert alert-type="error">${this._error}</ha-alert>`
            : nothing}
        </ha-card>
      </div>
      <div class="button-row">
        <div class="buttons">
          <div class="switch-mode-container">
            <mwc-button
              @click=${this._toggleYaml}
              .disabled=${!this._uiAvailable}
            >
              ${this._yamlMode
                ? this.menuai.localize(
                    "ui.panel.developer-tools.tabs.actions.ui_mode"
                  )
                : this.menuai.localize(
                    "ui.panel.developer-tools.tabs.actions.yaml_mode"
                  )}
            </mwc-button>
            ${!this._uiAvailable
              ? html`<span class="error"
                  >${this.menuai.localize(
                    "ui.panel.developer-tools.tabs.actions.no_template_ui_support"
                  )}</span
                >`
              : ""}
          </div>
          <ha-progress-button raised @click=${this._callService}>
            ${this.menuai.localize(
              "ui.panel.developer-tools.tabs.actions.call_service"
            )}
          </ha-progress-button>
        </div>
      </div>
      ${this._response
        ? html`<div class="content">
            <ha-card
              .header=${this.menuai.localize(
                "ui.panel.developer-tools.tabs.actions.response"
              )}
            >
              <div class="card-content">
                <ha-yaml-editor
                  .menuai=${this.menuai}
                  copy-clipboard
                  read-only
                  auto-update
                  has-extra-actions
                  .value=${this._response}
                >
                  <ha-button slot="extra-actions" @click=${this._copyTemplate}
                    >${this.menuai.localize(
                      "ui.panel.developer-tools.tabs.actions.copy_clipboard_template"
                    )}</ha-button
                  >
                </ha-yaml-editor>
              </div>
            </ha-card>
          </div>`
        : nothing}
      ${(this._yamlMode ? fields : this._filterSelectorFields(fields)).length
        ? html`<div class="content">
            <ha-expansion-panel
              .header=${this._yamlMode
                ? this.menuai.localize(
                    "ui.panel.developer-tools.tabs.actions.all_parameters"
                  )
                : this.menuai.localize(
                    "ui.panel.developer-tools.tabs.actions.yaml_parameters"
                  )}
              outlined
              .expanded=${this._yamlMode}
            >
              ${this._yamlMode
                ? html`<div class="description">
                    <h3>
                      ${target
                        ? html`
                            ${this.menuai.localize(
                              "ui.panel.developer-tools.tabs.actions.accepts_target"
                            )}
                          `
                        : ""}
                    </h3>
                    ${this._serviceData?.action
                      ? html` <a
                          href=${documentationUrl(
                            this.menuai,
                            "/integrations/" +
                              computeDomain(this._serviceData?.action)
                          )}
                          title=${this.menuai.localize(
                            "ui.components.service-control.integration_doc"
                          )}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <ha-icon-button
                            class="help-icon"
                            .path=${mdiHelpCircle}
                            .label=${this.menuai!.localize("ui.common.help")}
                          ></ha-icon-button>
                        </a>`
                      : ""}
                  </div>`
                : ""}
              <table class="attributes">
                <tr>
                  <th>
                    ${this.menuai.localize(
                      "ui.panel.developer-tools.tabs.actions.column_parameter"
                    )}
                  </th>
                  <th>
                    ${this.menuai.localize(
                      "ui.panel.developer-tools.tabs.actions.column_description"
                    )}
                  </th>
                  <th>
                    ${this.menuai.localize(
                      "ui.panel.developer-tools.tabs.actions.column_example"
                    )}
                  </th>
                </tr>
                ${(this._yamlMode
                  ? fields
                  : this._filterSelectorFields(fields)
                ).map(
                  (field) =>
                    html` <tr>
                      <td><pre>${field.key}</pre></td>
                      <td>
                        ${this.menuai.localize(
                          `component.${domain}.services.${serviceName}.fields.${field.key}.description`
                        ) || field.description}
                      </td>
                      <td>
                        ${this.menuai.localize(
                          `component.${domain}.services.${serviceName}.fields.${field.key}.example`
                        ) || field.example}
                      </td>
                    </tr>`
                )}
              </table>
              ${this._yamlMode
                ? html`<mwc-button @click=${this._fillExampleData}
                    >${this.menuai.localize(
                      "ui.panel.developer-tools.tabs.actions.fill_example_data"
                    )}</mwc-button
                  >`
                : ""}
            </ha-expansion-panel>
          </div>`
        : ""}
    `;
  }

  private async _copyTemplate(): Promise<void> {
    await copyToClipboard(
      `{% set ${this._serviceData?.response_variable || "action_response"} = ${JSON.stringify(this._response)} %}`
    );
    showToast(this, {
      message: this.menuai.localize("ui.common.copied_clipboard"),
    });
  }

  private _filterSelectorFields = memoizeOne((fields) =>
    fields.filter((field) => !field.selector)
  );

  private _validateServiceData = (
    serviceData: ServiceAction | undefined,
    fields,
    target,
    yamlMode: boolean,
    localize: LocalizeFunc
  ): string | undefined => {
    const errorCategory = yamlMode ? "yaml" : "ui";
    if (!serviceData?.action) {
      return localize(
        `ui.panel.developer-tools.tabs.actions.errors.${errorCategory}.no_action`
      );
    }
    const domain = computeDomain(serviceData.action);
    const service = computeObjectId(serviceData.action);
    if (!domain || !service) {
      return localize(
        `ui.panel.developer-tools.tabs.actions.errors.${errorCategory}.invalid_action`
      );
    }
    const dataIsTemplate =
      typeof serviceData.data === "string" && isTemplate(serviceData.data);
    if (
      target &&
      !dataIsTemplate &&
      !serviceData.target &&
      !serviceData.data?.entity_id &&
      !serviceData.data?.device_id &&
      !serviceData.data?.area_id
    ) {
      return localize(
        `ui.panel.developer-tools.tabs.actions.errors.${errorCategory}.no_target`
      );
    }
    for (const field of fields) {
      if (
        field.required &&
        !dataIsTemplate &&
        (!serviceData.data || serviceData.data[field.key] === undefined)
      ) {
        return localize(
          `ui.panel.developer-tools.tabs.actions.errors.${errorCategory}.missing_required_field`,
          { key: field.key }
        );
      }
    }
    return undefined;
  };

  private _fields = memoizeOne(
    (
      serviceDomains: menuai["services"],
      domainService: string | undefined
    ): { target: boolean; fields: any[] } => {
      if (!domainService) {
        return { target: false, fields: [] };
      }
      const domain = computeDomain(domainService);
      const service = computeObjectId(domainService);
      if (!(domain in serviceDomains)) {
        return { target: false, fields: [] };
      }
      if (!(service in serviceDomains[domain])) {
        return { target: false, fields: [] };
      }
      const target = "target" in serviceDomains[domain][service];
      const fields = serviceDomains[domain][service].fields;
      const result: (menuaiService["fields"] & { key: string })[] = [];

      // TODO: remplace any by proper type when updated in home-assistant-js-websocket
      const getFields = (flds: any) => {
        Object.keys(flds).forEach((field) => {
          const fieldData = flds[field];
          if (fieldData.fields) {
            getFields(fieldData.fields);
          } else {
            result.push({
              key: field,
              ...fieldData,
            });
          }
        });
      };

      getFields(fields);

      return {
        target,
        fields: result,
      };
    }
  );

  private async _callService(ev) {
    const button = ev.currentTarget as HaProgressButton;

    if (this._yamlMode && !this._yamlValid) {
      forwardHaptic("failure");
      button.actionError();
      this._error = this.menuai.localize(
        "ui.panel.developer-tools.tabs.actions.errors.yaml.invalid_yaml"
      );
      return;
    }

    const { target, fields } = this._fields(
      this.menuai.services,
      this._serviceData?.action
    );

    this._error = this._validateServiceData(
      this._serviceData,
      fields,
      target,
      this._yamlMode,
      this.menuai.localize
    );

    if (this._error !== undefined) {
      forwardHaptic("failure");
      button.actionError();
      return;
    }
    const [domain, service] = this._serviceData!.action!.split(".", 2);
    const script: Action[] = [];
    if (
      this.menuai.services?.[domain]?.[service] &&
      "response" in this.menuai.services[domain][service]
    ) {
      script.push({
        ...this._serviceData!,
        response_variable: "service_result",
      });
      script.push({ stop: "done", response_variable: "service_result" });
    } else {
      script.push(this._serviceData!);
    }
    try {
      this._response = (await callExecuteScript(this.menuai, script)).response;
    } catch (err: any) {
      if (
        err.error?.code === ERR_CONNECTION_LOST &&
        serviceCallWillDisconnect(domain, service)
      ) {
        return;
      }
      forwardHaptic("failure");
      button.actionError();

      let localizedErrorMessage: string | undefined;
      if (err.translation_domain && err.translation_key) {
        const lokalize = await this.menuai.loadBackendTranslation(
          "exceptions",
          err.translation_domain
        );
        localizedErrorMessage = lokalize(
          `component.${err.translation_domain}.exceptions.${err.translation_key}.message`,
          err.translation_placeholders
        );
      }
      this._error =
        localizedErrorMessage ||
        this.menuai.localize("ui.notification_toast.action_failed", {
          service: this._serviceData!.action!,
        }) + ` ${err.message}`;
      return;
    }
    button.actionSuccess();
  }

  private _toggleYaml() {
    this._yamlMode = !this._yamlMode;
    this._yamlValid = true;
    this._error = undefined;
  }

  private _yamlChanged(ev) {
    if (!ev.detail.isValid) {
      this._yamlValid = false;
      return;
    }
    this._yamlValid = true;

    if (typeof ev.detail.value !== "object") {
      return;
    }

    if (this._serviceData?.action !== ev.detail.value.action) {
      this._error = undefined;
    }

    this._serviceData = migrateAutomationAction(
      ev.detail.value
    ) as ServiceAction;

    this._checkUiSupported();
  }

  private _checkUiSupported() {
    if (
      this._serviceData &&
      Object.entries(this._serviceData).some(
        ([key, val]) => key !== "data" && hasTemplate(val)
      )
    ) {
      this._yamlMode = true;
      this._uiAvailable = false;
    } else {
      this._uiAvailable = true;
    }
  }

  private _serviceDataChanged(ev) {
    if (this._serviceData?.action !== ev.detail.value.action) {
      this._error = undefined;
    }
    this._serviceData = ev.detail.value;
    this._checkUiSupported();
  }

  private _serviceChanged(ev) {
    ev.stopPropagation();
    if (ev.detail.value) {
      this._serviceData = { action: ev.detail.value, data: {} };
      this._yamlEditor?.setValue(this._serviceData);
    }
    this._response = undefined;
    this._error = undefined;
    this._checkUiSupported();
  }

  private _fillExampleData() {
    const { fields } = this._fields(
      this.menuai.services,
      this._serviceData?.action
    );
    const domain = this._serviceData?.action
      ? computeDomain(this._serviceData?.action)
      : undefined;

    const serviceName = this._serviceData?.action
      ? computeObjectId(this._serviceData?.action)
      : undefined;

    const example = {};
    fields.forEach((field) => {
      if (field.example) {
        let value: any = "";
        try {
          value = load(field.example);
        } catch (_err: any) {
          value =
            this.menuai.localize(
              `component.${domain}.services.${serviceName}.fields.${field.key}.example`
            ) || field.example;
        }
        example[field.key] = value;
      }
    });
    this._serviceData = { ...this._serviceData!, data: example };
    this._yamlEditor?.setValue(this._serviceData);
    this._checkUiSupported();
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      css`
        .content {
          padding: 16px;
          padding: max(16px, var(--safe-area-inset-top))
            max(16px, var(--safe-area-inset-right))
            max(16px, var(--safe-area-inset-bottom))
            max(16px, var(--safe-area-inset-left));
          max-width: 1200px;
          margin: auto;
        }
        .button-row {
          padding: 8px 16px;
          padding: max(8px, var(--safe-area-inset-top))
            max(16px, var(--safe-area-inset-right))
            max(8px, var(--safe-area-inset-bottom))
            max(16px, var(--safe-area-inset-left));
          border-top: 1px solid var(--divider-color);
          border-bottom: 1px solid var(--divider-color);
          background: var(--card-background-color);
          position: sticky;
          bottom: 0;
          box-sizing: border-box;
          width: 100%;
        }
        .button-row .buttons {
          display: flex;
          justify-content: space-between;
          max-width: 1200px;
          margin: auto;
        }
        .switch-mode-container {
          display: flex;
          align-items: center;
        }
        .switch-mode-container .error {
          margin-left: 8px;
          margin-inline-start: 8px;
          margin-inline-end: initial;
        }
        .attributes {
          width: 100%;
        }

        .attributes th {
          text-align: var(--float-start);
          background-color: var(--card-background-color);
          border-bottom: 1px solid var(--primary-text-color);
          direction: var(--direction);
        }

        .attributes tr {
          vertical-align: top;
          direction: ltr;
        }

        .attributes tr:nth-child(odd) {
          background-color: var(--table-row-background-color, #eee);
        }

        .attributes tr:nth-child(even) {
          background-color: var(--table-row-alternative-background-color, #eee);
        }

        .attributes td:nth-child(3) {
          white-space: pre-wrap;
          word-break: break-word;
        }

        .attributes td {
          padding: 4px;
          vertical-align: middle;
        }

        .help-icon {
          color: var(--secondary-text-color);
        }
        .description {
          justify-content: space-between;
          display: flex;
          align-items: center;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "developer-tools-action": HaPanelDevAction;
  }
}
