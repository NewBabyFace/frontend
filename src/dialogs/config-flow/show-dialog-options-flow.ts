import { html } from "lit";
import type { ConfigEntry } from "../../data/config_entries";
import { domainToName } from "../../data/integration";
import {
  createOptionsFlow,
  deleteOptionsFlow,
  fetchOptionsFlow,
  handleOptionsFlowStep,
} from "../../data/options_flow";
import type { DataEntryFlowDialogParams } from "./show-dialog-data-entry-flow";
import {
  loadDataEntryFlowDialog,
  showFlowDialog,
} from "./show-dialog-data-entry-flow";

export const loadOptionsFlowDialog = loadDataEntryFlowDialog;

export const showOptionsFlowDialog = (
  element: HTMLElement,
  configEntry: ConfigEntry,
  dialogParams?: Omit<DataEntryFlowDialogParams, "flowConfig">
): void =>
  showFlowDialog(
    element,
    {
      startFlowHandler: configEntry.entry_id,
      domain: configEntry.domain,
      ...dialogParams,
    },
    {
      flowType: "options_flow",
      showDevices: false,
      createFlow: async (menuai, handler) => {
        const [step] = await Promise.all([
          createOptionsFlow(menuai, handler),
          menuai.loadFragmentTranslation("config"),
          menuai.loadBackendTranslation("options", configEntry.domain),
          menuai.loadBackendTranslation("selector", configEntry.domain),
        ]);
        return step;
      },
      fetchFlow: async (menuai, flowId) => {
        const [step] = await Promise.all([
          fetchOptionsFlow(menuai, flowId),
          menuai.loadFragmentTranslation("config"),
          menuai.loadBackendTranslation("options", configEntry.domain),
          menuai.loadBackendTranslation("selector", configEntry.domain),
        ]);
        return step;
      },
      handleFlowStep: handleOptionsFlowStep,
      deleteFlow: deleteOptionsFlow,

      renderAbortDescription(menuai, step) {
        const description = menuai.localize(
          `component.${step.translation_domain || configEntry.domain}.options.abort.${step.reason}`,
          step.description_placeholders
        );

        return description
          ? html`
              <ha-markdown
                breaks
                allow-svg
                .content=${description}
              ></ha-markdown>
            `
          : step.reason;
      },

      renderShowFormStepHeader(menuai, step) {
        return (
          menuai.localize(
            `component.${step.translation_domain || configEntry.domain}.options.step.${step.step_id}.title`,
            step.description_placeholders
          ) || menuai.localize(`ui.dialogs.options_flow.form.header`)
        );
      },

      renderShowFormStepDescription(menuai, step) {
        const description = menuai.localize(
          `component.${step.translation_domain || configEntry.domain}.options.step.${step.step_id}.description`,
          step.description_placeholders
        );
        return description
          ? html`
              <ha-markdown
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
            `component.${configEntry.domain}.options.step.${step.step_id}.sections.${field.name}.name`,
            step.description_placeholders
          );
        }

        const prefix = options?.path?.[0] ? `sections.${options.path[0]}.` : "";

        return (
          menuai.localize(
            `component.${configEntry.domain}.options.step.${step.step_id}.${prefix}data.${field.name}`,
            step.description_placeholders
          ) || field.name
        );
      },

      renderShowFormStepFieldHelper(menuai, step, field, options) {
        if (field.type === "expandable") {
          return menuai.localize(
            `component.${step.translation_domain || configEntry.domain}.options.step.${step.step_id}.sections.${field.name}.description`,
            step.description_placeholders
          );
        }

        const prefix = options?.path?.[0] ? `sections.${options.path[0]}.` : "";

        const description = menuai.localize(
          `component.${step.translation_domain || configEntry.domain}.options.step.${step.step_id}.${prefix}data_description.${field.name}`,
          step.description_placeholders
        );
        return description
          ? html`<ha-markdown breaks .content=${description}></ha-markdown>`
          : "";
      },

      renderShowFormStepFieldError(menuai, step, error) {
        return (
          menuai.localize(
            `component.${step.translation_domain || configEntry.domain}.options.error.${error}`,
            step.description_placeholders
          ) || error
        );
      },

      renderShowFormStepFieldLocalizeValue(menuai, _step, key) {
        return menuai.localize(`component.${configEntry.domain}.selector.${key}`);
      },

      renderShowFormStepSubmitButton(menuai, step) {
        return (
          menuai.localize(
            `component.${configEntry.domain}.options.step.${step.step_id}.submit`
          ) ||
          menuai.localize(
            `ui.panel.config.integrations.config_flow.${
              step.last_step === false ? "next" : "submit"
            }`
          )
        );
      },

      renderExternalStepHeader(_menuai, _step) {
        return "";
      },

      renderExternalStepDescription(_menuai, _step) {
        return "";
      },

      renderCreateEntryDescription(menuai, _step) {
        return html`
          <p>${menuai.localize(`ui.dialogs.options_flow.success.description`)}</p>
        `;
      },

      renderShowFormProgressHeader(menuai, step) {
        return (
          menuai.localize(
            `component.${configEntry.domain}.options.step.${step.step_id}.title`
          ) || menuai.localize(`component.${configEntry.domain}.title`)
        );
      },

      renderShowFormProgressDescription(menuai, step) {
        const description = menuai.localize(
          `component.${step.translation_domain || configEntry.domain}.options.progress.${step.progress_action}`,
          step.description_placeholders
        );
        return description
          ? html`
              <ha-markdown
                allow-svg
                breaks
                .content=${description}
              ></ha-markdown>
            `
          : "";
      },

      renderMenuHeader(menuai, step) {
        return (
          menuai.localize(
            `component.${configEntry.domain}.options.step.${step.step_id}.title`
          ) || menuai.localize(`component.${configEntry.domain}.title`)
        );
      },

      renderMenuDescription(menuai, step) {
        const description = menuai.localize(
          `component.${step.translation_domain || configEntry.domain}.options.step.${step.step_id}.description`,
          step.description_placeholders
        );
        return description
          ? html`
              <ha-markdown
                allow-svg
                breaks
                .content=${description}
              ></ha-markdown>
            `
          : "";
      },

      renderMenuOption(menuai, step, option) {
        return menuai.localize(
          `component.${step.translation_domain || configEntry.domain}.options.step.${step.step_id}.menu_options.${option}`,
          step.description_placeholders
        );
      },

      renderLoadingDescription(menuai, reason) {
        return (
          menuai.localize(`component.${configEntry.domain}.options.loading`) ||
          (reason === "loading_flow" || reason === "loading_step"
            ? menuai.localize(`ui.dialogs.options_flow.loading.${reason}`, {
                integration: domainToName(menuai.localize, configEntry.domain),
              })
            : "")
        );
      },
    }
  );
