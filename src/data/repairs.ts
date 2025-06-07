import type { Connection } from "home-assistant-js-websocket";
import { createCollection } from "home-assistant-js-websocket";
import type { Store } from "home-assistant-js-websocket/dist/store";
import { debounce } from "../common/util/debounce";
import type { menuai } from "../types";
import type { DataEntryFlowStep } from "./data_entry_flow";

export interface RepairsIssue {
  domain: string;
  issue_domain?: string;
  issue_id: string;
  active: boolean;
  is_fixable: boolean;
  severity: "error" | "warning" | "critical";
  breaks_in_ha_version?: string;
  ignored: boolean;
  created: string;
  dismissed_version?: string;
  learn_more_url?: string;
  translation_key?: string;
  translation_placeholders?: Record<string, string>;
}

export const severitySort = {
  critical: 1,
  error: 2,
  warning: 3,
};

export const fetchRepairsIssues = (conn: Connection) =>
  conn.sendMessagePromise<{ issues: RepairsIssue[] }>({
    type: "repairs/list_issues",
  });

export const fetchRepairsIssueData = (
  conn: Connection,
  domain: string,
  issue_id: string
) =>
  conn.sendMessagePromise<{ issue_data: { string: any } }>({
    type: "repairs/get_issue_data",
    domain,
    issue_id,
  });

export const ignoreRepairsIssue = async (
  menuai: menuai,
  issue: RepairsIssue,
  ignore: boolean
) =>
  menuai.callWS<string>({
    type: "repairs/ignore_issue",
    issue_id: issue.issue_id,
    domain: issue.domain,
    ignore,
  });

export const createRepairsFlow = (
  menuai: menuai,
  handler: string,
  issue_id: string
) =>
  menuai.callApi<DataEntryFlowStep>("POST", "repairs/issues/fix", {
    handler,
    issue_id,
  });

export const fetchRepairsFlow = (menuai: menuai, flowId: string) =>
  menuai.callApi<DataEntryFlowStep>("GET", `repairs/issues/fix/${flowId}`);

export const handleRepairsFlowStep = (
  menuai: menuai,
  flowId: string,
  data: Record<string, any>
) =>
  menuai.callApi<DataEntryFlowStep>("POST", `repairs/issues/fix/${flowId}`, data);

export const deleteRepairsFlow = (menuai: menuai, flowId: string) =>
  menuai.callApi("DELETE", `repairs/issues/fix/${flowId}`);

const subscribeRepairsIssueUpdates = (
  conn: Connection,
  store: Store<{ issues: RepairsIssue[] }>
) =>
  conn.subscribeEvents(
    debounce(
      () =>
        fetchRepairsIssues(conn).then((repairs) =>
          store.setState(repairs, true)
        ),
      500,
      true
    ),
    "repairs_issue_registry_updated"
  );

export const subscribeRepairsIssueRegistry = (
  conn: Connection,
  onChange: (repairs: { issues: RepairsIssue[] }) => void
) =>
  createCollection<{ issues: RepairsIssue[] }>(
    "_repairsIssueRegistry",
    fetchRepairsIssues,
    subscribeRepairsIssueUpdates,
    conn,
    onChange
  );
