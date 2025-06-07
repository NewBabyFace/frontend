import type { TemplateResult } from "lit";
import { fireEvent } from "../../common/dom/fire_event";
import type { HaFormSchema } from "../../components/ha-form/types";
import type {
  DataEntryFlowStep,
  DataEntryFlowStepAbort,
  DataEntryFlowStepCreateEntry,
  DataEntryFlowStepExternal,
  DataEntryFlowStepForm,
  DataEntryFlowStepMenu,
  DataEntryFlowStepProgress,
  FlowType,
} from "../../data/data_entry_flow";
import type { IntegrationManifest } from "../../data/integration";
import type { menuai } from "../../types";

export interface FlowConfig {
  flowType: FlowType;

  showDevices: boolean;

  createFlow(menuai: menuai, handler: string): Promise<DataEntryFlowStep>;

  fetchFlow(menuai: menuai, flowId: string): Promise<DataEntryFlowStep>;

  handleFlowStep(
    menuai: menuai,
    flowId: string,
    data: Record<string, any>
  ): Promise<DataEntryFlowStep>;

  deleteFlow(menuai: menuai, flowId: string): Promise<unknown>;

  renderAbortHeader?(menuai: menuai, step: DataEntryFlowStepAbort): string;

  renderAbortSubheader?(
    menuai: menuai,
    step: DataEntryFlowStepAbort
  ): string | TemplateResult;

  renderAbortDescription(
    menuai: menuai,
    step: DataEntryFlowStepAbort
  ): TemplateResult | string;

  renderShowFormStepHeader(
    menuai: menuai,
    step: DataEntryFlowStepForm
  ): string;

  renderShowFormStepSubheader?(
    menuai: menuai,
    step: DataEntryFlowStepForm
  ): string | TemplateResult;

  renderShowFormStepDescription(
    menuai: menuai,
    step: DataEntryFlowStepForm
  ): TemplateResult | "";

  renderShowFormStepFieldLabel(
    menuai: menuai,
    step: DataEntryFlowStepForm,
    field: HaFormSchema,
    options: { path?: string[]; [key: string]: any }
  ): string;

  renderShowFormStepFieldHelper(
    menuai: menuai,
    step: DataEntryFlowStepForm,
    field: HaFormSchema,
    options: { path?: string[]; [key: string]: any }
  ): TemplateResult | string;

  renderShowFormStepFieldError(
    menuai: menuai,
    step: DataEntryFlowStepForm,
    error: string
  ): string;

  renderShowFormStepFieldLocalizeValue(
    menuai: menuai,
    step: DataEntryFlowStepForm,
    key: string
  ): string;

  renderShowFormStepSubmitButton(
    menuai: menuai,
    step: DataEntryFlowStepForm
  ): string;

  renderExternalStepHeader(
    menuai: menuai,
    step: DataEntryFlowStepExternal
  ): string;

  renderExternalStepDescription(
    menuai: menuai,
    step: DataEntryFlowStepExternal
  ): TemplateResult | "";

  renderCreateEntryDescription(
    menuai: menuai,
    step: DataEntryFlowStepCreateEntry
  ): TemplateResult | "";

  renderShowFormProgressHeader(
    menuai: menuai,
    step: DataEntryFlowStepProgress
  ): string;

  renderShowFormProgressSubheader?(
    menuai: menuai,
    step: DataEntryFlowStepProgress
  ): string | TemplateResult;

  renderShowFormProgressDescription(
    menuai: menuai,
    step: DataEntryFlowStepProgress
  ): TemplateResult | "";

  renderMenuHeader(menuai: menuai, step: DataEntryFlowStepMenu): string;

  renderMenuSubheader?(
    menuai: menuai,
    step: DataEntryFlowStepMenu
  ): string | TemplateResult;

  renderMenuDescription(
    menuai: menuai,
    step: DataEntryFlowStepMenu
  ): TemplateResult | "";

  renderMenuOption(
    menuai: menuai,
    step: DataEntryFlowStepMenu,
    option: string
  ): string;

  renderLoadingDescription(
    menuai: menuai,
    loadingReason: LoadingReason,
    handler?: string,
    step?: DataEntryFlowStep | null
  ): string;
}

export type LoadingReason =
  | "loading_handlers"
  | "loading_flow"
  | "loading_step";

export interface DataEntryFlowDialogParams {
  startFlowHandler?: string;
  searchQuery?: string;
  continueFlowId?: string;
  manifest?: IntegrationManifest | null;
  domain?: string;
  dialogClosedCallback?: (params: {
    flowFinished: boolean;
    entryId?: string;
  }) => void;
  flowConfig: FlowConfig;
  showAdvanced?: boolean;
  dialogParentElement?: HTMLElement;
  navigateToResult?: boolean;
}

export const loadDataEntryFlowDialog = () => import("./dialog-data-entry-flow");

export const showFlowDialog = (
  element: HTMLElement,
  dialogParams: Omit<DataEntryFlowDialogParams, "flowConfig">,
  flowConfig: FlowConfig
): void => {
  fireEvent(element, "show-dialog", {
    dialogTag: "dialog-data-entry-flow",
    dialogImport: loadDataEntryFlowDialog,
    dialogParams: {
      ...dialogParams,
      flowConfig,
      dialogParentElement: element,
    },
  });
};
