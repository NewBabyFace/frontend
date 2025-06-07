import { html, nothing } from "lit";
import type { DataEntryFlowStep } from "../../../data/data_entry_flow";
import { domainToName } from "../../../data/integration";
import type { RepairsIssue } from "../../../data/repairs";
import {
  createRepairsFlow,
  deleteRepairsFlow,
  fetchRepairsFlow,
  handleRepairsFlowStep,
} from "../../../data/repairs";
import {
  loadDataEntryFlowDialog,
  showFlowDialog,
} from "../../../dialogs/config-flow/show-dialog-data-entry-flow";
import type { menuai } from "../../../types";
import "./dialog-repairs-issue-subtitle";

const mergePlaceholders = (issue: RepairsIssue, step: DataEntryFlowStep) =>
  step.description_placeholders && issue.translation_placeholders
    ? { ...issue.translation_placeholders, ...step.description_placeholders }
    : step.description_placeholders || issue.translation_placeholders;

const renderIssueDescription = (menuai: menuai, issue: RepairsIssue) =>
  issue.breaks_in_ha_version
    ? html`
        <ha-alert alert-type="warning">
          ${menuai.localize("ui.panel.config.repairs.dialog.breaks_in_version", {
            version: issue.breaks_in_ha_version,
          })} </ha-alert
        ><br />
      `
    : "";

export const loadRepairFlowDialog = loadDataEntryFlowDialog;

export const showRepairsFlowDialog = (
  element: HTMLElement,
  issue: RepairsIssue,
  dialogClosedCallback?: (params: { flowFinished: boolean }) => void
): void =>
  showFlowDialog(
    element,
    {
      startFlowHandler: issue.domain,
      domain: issue.domain,
      dialogClosedCallback,
    },
    {
      flowType: "repair_flow",
      showDevices: false,
      createFlow: async (menuai, handler) => {
        const [step] = await Promise.all([
          createRepairsFlow(menuai, handler, issue.issue_id),
          menuai.loadBackendTranslation("issues", issue.domain),
          menuai.loadBackendTranslation("selector", issue.domain),
        ]);
        return step;
      },
      fetchFlow: async (menuai, flowId) => {
        const [step] = await Promise.all([
          fetchRepairsFlow(menuai, flowId),
          menuai.loadBackendTranslation("issues", issue.domain),
          menuai.loadBackendTranslation("selector", issue.domain),
        ]);
        return step;
      },
      handleFlowStep: handleRepairsFlowStep,
      deleteFlow: deleteRepairsFlow,

      renderAbortHeader(menuai) {
        return menuai.localize("ui.dialogs.repair_flow.form.header");
      },

      renderAbortSubheader(menuai) {
        return html`
          <dialog-repairs-issue-subtitle
            .menuai=${menuai}
            .issue=${issue}
          ></dialog-repairs-issue-subtitle>
        `;
      },

      renderAbortDescription(menuai, step) {
        const description = menuai.localize(
          `component.${issue.domain}.issues.${
            issue.translation_key || issue.issue_id
          }.fix_flow.abort.${step.reason}`,
          mergePlaceholders(issue, step)
        );

        return html`${renderIssueDescription(menuai, issue)}
        ${description
          ? html`
              <ha-markdown
                breaks
                allow-svg
                .content=${description}
              ></ha-markdown>
            `
          : step.reason}`;
      },

      renderShowFormStepHeader(menuai, step) {
        return (
          menuai.localize(
            `component.${issue.domain}.issues.${
              issue.translation_key || issue.issue_id
            }.fix_flow.step.${step.step_id}.title`,
            mergePlaceholders(issue, step)
          ) || menuai.localize("ui.dialogs.repair_flow.form.header")
        );
      },

      renderShowFormStepSubheader(menuai) {
        return html`
          <dialog-repairs-issue-subtitle
            .menuai=${menuai}
            .issue=${issue}
          ></dialog-repairs-issue-subtitle>
        `;
      },

      renderShowFormStepDescription(menuai, step) {
        const description = menuai.localize(
          `component.${issue.domain}.issues.${
            issue.translation_key || issue.issue_id
          }.fix_flow.step.${step.step_id}.description`,
          mergePlaceholders(issue, step)
        );
        return html`${renderIssueDescription(menuai, issue)}
        ${description
          ? html`
              <ha-markdown
                allow-svg
                breaks
                .content=${description}
              ></ha-markdown>
            `
          : nothing}`;
      },

      renderShowFormStepFieldLabel(menuai, step, field, options) {
        return menuai.localize(
          `component.${issue.domain}.issues.${
            issue.translation_key || issue.issue_id
          }.fix_flow.step.${step.step_id}.${options?.prefix ? `section.${options.prefix[0]}.` : ""}data.${field.name}`,
          mergePlaceholders(issue, step)
        );
      },

      renderShowFormStepFieldHelper(menuai, step, field, options) {
        const description = menuai.localize(
          `component.${issue.domain}.issues.${
            issue.translation_key || issue.issue_id
          }.fix_flow.step.${step.step_id}.${options?.prefix ? `section.${options.prefix[0]}.` : ""}data_description.${field.name}`,
          mergePlaceholders(issue, step)
        );
        return html`${renderIssueDescription(menuai, issue)}
        ${description
          ? html`<ha-markdown breaks .content=${description}></ha-markdown>`
          : nothing}`;
      },

      renderShowFormStepFieldError(menuai, step, error) {
        return menuai.localize(
          `component.${issue.domain}.issues.${
            issue.translation_key || issue.issue_id
          }.fix_flow.error.${error}`,
          mergePlaceholders(issue, step)
        );
      },

      renderShowFormStepFieldLocalizeValue(menuai, _step, key) {
        return menuai.localize(`component.${issue.domain}.selector.${key}`);
      },

      renderShowFormStepSubmitButton(menuai, step) {
        return (
          menuai.localize(
            `component.${issue.domain}.issues.${
              issue.translation_key || issue.issue_id
            }.fix_flow.step.${step.step_id}.submit`
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
          <p>${menuai.localize("ui.dialogs.repair_flow.success.description")}</p>
        `;
      },

      renderShowFormProgressHeader(menuai, step) {
        return (
          menuai.localize(
            `component.${issue.domain}.issues.step.${
              issue.translation_key || issue.issue_id
            }.fix_flow.${step.step_id}.title`,
            mergePlaceholders(issue, step)
          ) || menuai.localize(`component.${issue.domain}.title`)
        );
      },

      renderShowFormProgressSubheader(menuai) {
        return html`
          <dialog-repairs-issue-subtitle
            .menuai=${menuai}
            .issue=${issue}
          ></dialog-repairs-issue-subtitle>
        `;
      },

      renderShowFormProgressDescription(menuai, step) {
        const description = menuai.localize(
          `component.${issue.domain}.issues.${
            issue.translation_key || issue.issue_id
          }.fix_flow.progress.${step.progress_action}`,
          mergePlaceholders(issue, step)
        );
        return html`${renderIssueDescription(menuai, issue)}${description
          ? html`
              <ha-markdown
                allow-svg
                breaks
                .content=${description}
              ></ha-markdown>
            `
          : nothing}`;
      },

      renderMenuHeader(menuai, step) {
        return (
          menuai.localize(
            `component.${issue.domain}.issues.${
              issue.translation_key || issue.issue_id
            }.fix_flow.step.${step.step_id}.title`,
            mergePlaceholders(issue, step)
          ) || menuai.localize(`component.${issue.domain}.title`)
        );
      },

      renderMenuSubheader(menuai) {
        return html`
          <dialog-repairs-issue-subtitle
            .menuai=${menuai}
            .issue=${issue}
          ></dialog-repairs-issue-subtitle>
        `;
      },

      renderMenuDescription(menuai, step) {
        const description = menuai.localize(
          `component.${issue.domain}.issues.${
            issue.translation_key || issue.issue_id
          }.fix_flow.step.${step.step_id}.description`,
          mergePlaceholders(issue, step)
        );
        return html`${renderIssueDescription(menuai, issue)}
        ${description
          ? html`
              <ha-markdown
                allow-svg
                breaks
                .content=${description}
              ></ha-markdown>
            `
          : nothing}`;
      },

      renderMenuOption(menuai, step, option) {
        return menuai.localize(
          `component.${issue.domain}.issues.${
            issue.translation_key || issue.issue_id
          }.fix_flow.step.${step.step_id}.menu_options.${option}`,
          mergePlaceholders(issue, step)
        );
      },

      renderLoadingDescription(menuai, reason) {
        return (
          menuai.localize(
            `component.${issue.domain}.issues.${
              issue.translation_key || issue.issue_id
            }.fix_flow.loading`
          ) ||
          (reason === "loading_flow" || reason === "loading_step"
            ? menuai.localize(`ui.dialogs.repair_flow.loading.${reason}`, {
                integration: domainToName(menuai.localize, issue.domain),
              })
            : "")
        );
      },
    }
  );
