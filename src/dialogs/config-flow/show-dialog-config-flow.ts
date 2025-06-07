import { html, nothing } from "lit";
import {
  createConfigFlow,
  deleteConfigFlow,
  fetchConfigFlow,
  handleConfigFlowStep,
} from "../../data/config_flow";
import { domainToName } from "../../data/integration";
import type { DataEntryFlowDialogParams } from "./show-dialog-data-entry-flow";
import {
  loadDataEntryFlowDialog,
  showFlowDialog,
} from "./show-dialog-data-entry-flow";

export const loadConfigFlowDialog = loadDataEntryFlowDialog;

export const showConfigFlowDialog = (
  element: HTMLElement,
  dialogParams: Omit<DataEntryFlowDialogParams, "flowConfig"> & {
    entryId?: string;
  }
): void =>
  showFlowDialog(element, dialogParams, {
    flowType: "config_flow",
    showDevices: true,
    createFlow: async (menuai, handler) => {
      const [step] = await Promise.all([
        createConfigFlow(menuai, handler, dialogParams.entryId),
        menuai.loadFragmentTranslation("config"),
        menuai.loadBackendTranslation("config", handler),
        menuai.loadBackendTranslation("selector", handler),
        // Used as fallback if no header defined for step
        menuai.loadBackendTranslation("title", handler),
      ]);
      return step;
    },
    fetchFlow: async (menuai, flowId) => {
      const step = await fetchConfigFlow(menuai, flowId);
      await menuai.loadFragmentTranslation("config");
      await menuai.loadBackendTranslation("config", step.handler);
      await menuai.loadBackendTranslation("selector", step.handler);
      return step;
    },
    handleFlowStep: handleConfigFlowStep,
    deleteFlow: deleteConfigFlow,

    renderAbortDescription(menuai, step) {
      const description = menuai.localize(
        `component.${step.translation_domain || step.handler}.config.abort.${step.reason}`,
        step.description_placeholders
      );

      return description
        ? html`
            <ha-markdown allow-svg breaks .content=${description}></ha-markdown>
          `
        : step.reason;
    },

    renderShowFormStepHeader(menuai, step) {
      return (
        menuai.localize(
          `component.${step.translation_domain || step.handler}.config.step.${step.step_id}.title`,
          step.description_placeholders
        ) || menuai.localize(`component.${step.handler}.title`)
      );
    },

    renderShowFormStepDescription(menuai, step) {
      const description = menuai.localize(
        `component.${step.translation_domain || step.handler}.config.step.${step.step_id}.description`,
        step.description_placeholders
      );
      return description
        ? html`
            <ha-markdown
              .allowDataUrl=${step.handler === "zwave_js"}
              allow-svg
              breaks
              .content=${description}
            ></ha-markdown>
          `
        : "";
    },

    renderShowFormStepFieldLabel(menuai, step, field, options) {
      if (field.type === "expandable") {
        return menuai.localize(
          `component.${step.handler}.config.step.${step.step_id}.sections.${field.name}.name`,
          step.description_placeholders
        );
      }

      const prefix = options?.path?.[0] ? `sections.${options.path[0]}.` : "";

      return (
        menuai.localize(
          `component.${step.handler}.config.step.${step.step_id}.${prefix}data.${field.name}`,
          step.description_placeholders
        ) || field.name
      );
    },

    renderShowFormStepFieldHelper(menuai, step, field, options) {
      if (field.type === "expandable") {
        return menuai.localize(
          `component.${step.translation_domain || step.handler}.config.step.${step.step_id}.sections.${field.name}.description`,
          step.description_placeholders
        );
      }

      const prefix = options?.path?.[0] ? `sections.${options.path[0]}.` : "";

      const description = menuai.localize(
        `component.${step.translation_domain || step.handler}.config.step.${step.step_id}.${prefix}data_description.${field.name}`,
        step.description_placeholders
      );

      return description
        ? html`<ha-markdown breaks .content=${description}></ha-markdown>`
        : "";
    },

    renderShowFormStepFieldError(menuai, step, error) {
      return (
        menuai.localize(
          `component.${step.translation_domain || step.translation_domain || step.handler}.config.error.${error}`,
          step.description_placeholders
        ) || error
      );
    },

    renderShowFormStepFieldLocalizeValue(menuai, step, key) {
      return menuai.localize(`component.${step.handler}.selector.${key}`);
    },

    renderShowFormStepSubmitButton(menuai, step) {
      return (
        menuai.localize(
          `component.${step.handler}.config.step.${step.step_id}.submit`
        ) ||
        menuai.localize(
          `ui.panel.config.integrations.config_flow.${
            step.last_step === false ? "next" : "submit"
          }`
        )
      );
    },

    renderExternalStepHeader(menuai, step) {
      return (
        menuai.localize(
          `component.${step.handler}.config.step.${step.step_id}.title`
        ) ||
        menuai.localize(
          "ui.panel.config.integrations.config_flow.external_step.open_site"
        )
      );
    },

    renderExternalStepDescription(menuai, step) {
      const description = menuai.localize(
        `component.${step.translation_domain || step.handler}.config.${step.step_id}.description`,
        step.description_placeholders
      );

      return html`
        <p>
          ${menuai.localize(
            "ui.panel.config.integrations.config_flow.external_step.description"
          )}
        </p>
        ${description
          ? html`
              <ha-markdown
                allow-svg
                breaks
                .content=${description}
              ></ha-markdown>
            `
          : ""}
      `;
    },

    renderCreateEntryDescription(menuai, step) {
      const description = menuai.localize(
        `component.${step.translation_domain || step.handler}.config.create_entry.${
          step.description || "default"
        }`,
        step.description_placeholders
      );

      return html`
        ${description
          ? html`
              <ha-markdown
                allow-svg
                breaks
                .content=${description}
              ></ha-markdown>
            `
          : nothing}
      `;
    },

    renderShowFormProgressHeader(menuai, step) {
      return (
        menuai.localize(
          `component.${step.handler}.config.step.${step.step_id}.title`
        ) || menuai.localize(`component.${step.handler}.title`)
      );
    },

    renderShowFormProgressDescription(menuai, step) {
      const description = menuai.localize(
        `component.${step.translation_domain || step.handler}.config.progress.${step.progress_action}`,
        step.description_placeholders
      );
      return description
        ? html`
            <ha-markdown allow-svg breaks .content=${description}></ha-markdown>
          `
        : "";
    },

    renderMenuHeader(menuai, step) {
      return (
        menuai.localize(
          `component.${step.handler}.config.step.${step.step_id}.title`
        ) || menuai.localize(`component.${step.handler}.title`)
      );
    },

    renderMenuDescription(menuai, step) {
      const description = menuai.localize(
        `component.${step.translation_domain || step.handler}.config.step.${step.step_id}.description`,
        step.description_placeholders
      );
      return description
        ? html`
            <ha-markdown allow-svg breaks .content=${description}></ha-markdown>
          `
        : "";
    },

    renderMenuOption(menuai, step, option) {
      return menuai.localize(
        `component.${step.translation_domain || step.handler}.config.step.${step.step_id}.menu_options.${option}`,
        step.description_placeholders
      );
    },

    renderLoadingDescription(menuai, reason, handler, step) {
      if (reason !== "loading_flow" && reason !== "loading_step") {
        return "";
      }
      const domain = step?.handler || handler;
      return menuai.localize(
        `ui.panel.config.integrations.config_flow.loading.${reason}`,
        {
          integration: domain
            ? domainToName(menuai.localize, domain)
            : // when we are continuing a config flow, we only know the ID and not the domain
              menuai.localize(
                "ui.panel.config.integrations.config_flow.loading.fallback_title"
              ),
        }
      );
    },
  });
