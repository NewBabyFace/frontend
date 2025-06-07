import type { menuaiEntity } from "home-assistant-js-websocket";
import type { HaFormSchema } from "../components/ha-form/types";
import type { menuai } from "../types";

export interface ZHAEntityReference extends menuaiEntity {
  name: string;
  original_name?: string;
}

export interface ZHADevice {
  available: boolean;
  name: string;
  ieee: string;
  nwk: number;
  lqi: number;
  rssi: string;
  last_seen: string;
  manufacturer: string;
  model: string;
  quirk_applied: boolean;
  quirk_class: string;
  entities: ZHAEntityReference[];
  manufacturer_code: number;
  device_reg_id: string;
  user_given_name?: string;
  power_source?: string;
  area_id?: string;
  device_type: string;
  active_coordinator: boolean;
  signature: any;
  neighbors: Neighbor[];
  routes: Route[];
  pairing_status?: string;
}

export interface Neighbor {
  ieee: string;
  nwk: string;
  lqi: string;
  depth: string;
  relationship: string;
}

export interface Route {
  dest_nwk: string;
  route_status: RouteStatus;
  memory_constrained: boolean;
  many_to_one: boolean;
  route_record_required: boolean;
  next_hop: string;
}

export enum RouteStatus {
  Active = "Active",
  DiscoveryUnderway = "Discovery_Underway",
  DiscoveryFailed = "Discovery_Failed",
  Inactive = "Inactive",
  ValidationUnderway = "Validation_Underway",
}

export interface ZHADeviceEndpoint {
  device: ZHADevice;
  endpoint_id: number;
  entities: ZHAEntityReference[];
}

export interface Attribute {
  name: string;
  id: number;
}

export interface Cluster {
  name: string;
  id: number;
  endpoint_id: number;
  type: string;
}

export interface ClusterConfigurationData {
  cluster_name: string;
  cluster_id: number;
  success: boolean;
}

export interface ClusterAttributeData {
  cluster_name: string;
  cluster_id: number;
  attributes: AttributeConfigurationStatus[];
}

export interface AttributeConfigurationStatus {
  id: number;
  name: string;
  status: string;
  min: number;
  max: number;
  change: number;
}

export interface ClusterConfigurationStatus {
  cluster: Cluster;
  bindSuccess: boolean | undefined;
  attributes: Map<number, AttributeConfigurationStatus>;
}

interface ClusterConfigurationBindEvent {
  type: "zha_channel_bind";
  zha_channel_msg_data: ClusterConfigurationData;
}

interface ClusterConfigurationReportConfigurationEvent {
  type: "zha_channel_configure_reporting";
  zha_channel_msg_data: ClusterAttributeData;
}

interface ClusterConfigurationEventFinish {
  type: "zha_channel_cfg_done";
}

export type ClusterConfigurationEvent =
  | ClusterConfigurationReportConfigurationEvent
  | ClusterConfigurationBindEvent
  | ClusterConfigurationEventFinish;

export interface Command {
  name: string;
  id: number;
  type: string;
  schema: HaFormSchema[];
}

export interface ReadAttributeServiceData {
  ieee: string;
  endpoint_id: number;
  cluster_id: number;
  cluster_type: string;
  attribute: number;
  manufacturer?: number;
}

export interface ZHAGroup {
  name: string;
  group_id: number;
  members: ZHADeviceEndpoint[];
}

export interface ZHAConfiguration {
  data: Record<string, Record<string, unknown>>;
  schemas: Record<string, HaFormSchema[]>;
}

export interface ZHANetworkBackupNodeInfo {
  nwk: string;
  ieee: string;
  logical_type: "coordinator" | "router" | "end_device";
}

export interface ZHANetworkBackupKey {
  key: string;
  tx_counter: number;
  rx_counter: number;
  seq: number;
  partner_ieee: string;
}

export interface ZHANetworkBackupNetworkInfo {
  extended_pan_id: string;
  pan_id: string;
  nwk_update_id: number;
  nwk_manager_id: string;
  channel: number;
  channel_mask: number[];
  security_level: number;
  network_key: ZHANetworkBackupKey;
  tc_link_key: ZHANetworkBackupKey;
  key_table: ZHANetworkBackupKey[];
  children: string[];
  nwk_addresses: Record<string, string>;
  stack_specific?: Record<string, any>;
  metadata: Record<string, any>;
  source: string;
}

export interface ZHANetworkBackup {
  backup_time: string;
  network_info: ZHANetworkBackupNetworkInfo;
  node_info: ZHANetworkBackupNodeInfo;
}

export interface ZHADeviceSettings {
  path: string;
  baudrate?: number;
  flow_control?: string;
}

export interface ZHANetworkSettings {
  settings: ZHANetworkBackup;
  radio_type: "ezsp" | "znp" | "deconz" | "zigate" | "xbee";
  device: ZHADeviceSettings;
}

export interface ZHANetworkBackupAndMetadata {
  backup: ZHANetworkBackup;
  is_complete: boolean;
}

export interface ZHAGroupMember {
  ieee: string;
  endpoint_id: string;
}

export const reconfigureNode = (
  menuai: menuai,
  ieeeAddress: string,
  callbackFunction: (message: ClusterConfigurationEvent) => void
) =>
  menuai.connection.subscribeMessage(
    (message: ClusterConfigurationEvent) => callbackFunction(message),
    {
      type: "zha/devices/reconfigure",
      ieee: ieeeAddress,
    }
  );

export const refreshTopology = (menuai: menuai): Promise<void> =>
  menuai.callWS({
    type: "zha/topology/update",
  });

export const fetchAttributesForCluster = (
  menuai: menuai,
  ieeeAddress: string,
  endpointId: number,
  clusterId: number,
  clusterType: string
): Promise<Attribute[]> =>
  menuai.callWS({
    type: "zha/devices/clusters/attributes",
    ieee: ieeeAddress,
    endpoint_id: endpointId,
    cluster_id: clusterId,
    cluster_type: clusterType,
  });

export const fetchDevices = (menuai: menuai): Promise<ZHADevice[]> =>
  menuai.callWS({
    type: "zha/devices",
  });

export const fetchZHADevice = (
  menuai: menuai,
  ieeeAddress: string
): Promise<ZHADevice> =>
  menuai.callWS({
    type: "zha/device",
    ieee: ieeeAddress,
  });

export const fetchBindableDevices = (
  menuai: menuai,
  ieeeAddress: string
): Promise<ZHADevice[]> =>
  menuai.callWS({
    type: "zha/devices/bindable",
    ieee: ieeeAddress,
  });

export const bindDevices = (
  menuai: menuai,
  sourceIEEE: string,
  targetIEEE: string
): Promise<void> =>
  menuai.callWS({
    type: "zha/devices/bind",
    source_ieee: sourceIEEE,
    target_ieee: targetIEEE,
  });

export const unbindDevices = (
  menuai: menuai,
  sourceIEEE: string,
  targetIEEE: string
): Promise<void> =>
  menuai.callWS({
    type: "zha/devices/unbind",
    source_ieee: sourceIEEE,
    target_ieee: targetIEEE,
  });

export const bindDeviceToGroup = (
  menuai: menuai,
  deviceIEEE: string,
  groupId: number,
  clusters: Cluster[]
): Promise<void> =>
  menuai.callWS({
    type: "zha/groups/bind",
    source_ieee: deviceIEEE,
    group_id: groupId,
    bindings: clusters,
  });

export const unbindDeviceFromGroup = (
  menuai: menuai,
  deviceIEEE: string,
  groupId: number,
  clusters: Cluster[]
): Promise<void> =>
  menuai.callWS({
    type: "zha/groups/unbind",
    source_ieee: deviceIEEE,
    group_id: groupId,
    bindings: clusters,
  });

export const readAttributeValue = (
  menuai: menuai,
  data: ReadAttributeServiceData
): Promise<string> =>
  menuai.callWS({
    ...data,
    type: "zha/devices/clusters/attributes/value",
  });

export const fetchCommandsForCluster = (
  menuai: menuai,
  ieeeAddress: string,
  endpointId: number,
  clusterId: number,
  clusterType: string
): Promise<Command[]> =>
  menuai.callWS({
    type: "zha/devices/clusters/commands",
    ieee: ieeeAddress,
    endpoint_id: endpointId,
    cluster_id: clusterId,
    cluster_type: clusterType,
  });

export const fetchClustersForZhaDevice = (
  menuai: menuai,
  ieeeAddress: string
): Promise<Cluster[]> =>
  menuai.callWS({
    type: "zha/devices/clusters",
    ieee: ieeeAddress,
  });

export const fetchGroups = (menuai: menuai): Promise<ZHAGroup[]> =>
  menuai.callWS({
    type: "zha/groups",
  });

export const removeGroups = (
  menuai: menuai,
  groupIdsToRemove: number[]
): Promise<ZHAGroup[]> =>
  menuai.callWS({
    type: "zha/group/remove",
    group_ids: groupIdsToRemove,
  });

export const fetchGroup = (
  menuai: menuai,
  groupId: number
): Promise<ZHAGroup> =>
  menuai.callWS({
    type: "zha/group",
    group_id: groupId,
  });

export const fetchGroupableDevices = (
  menuai: menuai
): Promise<ZHADeviceEndpoint[]> =>
  menuai.callWS({
    type: "zha/devices/groupable",
  });

export const addMembersToGroup = (
  menuai: menuai,
  groupId: number,
  membersToAdd: ZHAGroupMember[]
): Promise<ZHAGroup> =>
  menuai.callWS({
    type: "zha/group/members/add",
    group_id: groupId,
    members: membersToAdd,
  });

export const removeMembersFromGroup = (
  menuai: menuai,
  groupId: number,
  membersToRemove: ZHAGroupMember[]
): Promise<ZHAGroup> =>
  menuai.callWS({
    type: "zha/group/members/remove",
    group_id: groupId,
    members: membersToRemove,
  });

export const addGroup = (
  menuai: menuai,
  groupName: string,
  groupId?: number,
  membersToAdd?: ZHAGroupMember[]
): Promise<ZHAGroup> =>
  menuai.callWS({
    type: "zha/group/add",
    group_name: groupName,
    group_id: groupId,
    members: membersToAdd,
  });

export const fetchZHAConfiguration = (
  menuai: menuai
): Promise<ZHAConfiguration> =>
  menuai.callWS({
    type: "zha/configuration",
  });

export const updateZHAConfiguration = (
  menuai: menuai,
  data: any
): Promise<any> =>
  menuai.callWS({
    type: "zha/configuration/update",
    data: data,
  });

export const fetchZHANetworkSettings = (
  menuai: menuai
): Promise<ZHANetworkSettings> =>
  menuai.callWS({
    type: "zha/network/settings",
  });

export const createZHANetworkBackup = (
  menuai: menuai
): Promise<ZHANetworkBackupAndMetadata> =>
  menuai.callWS({
    type: "zha/network/backups/create",
  });

export const restoreZHANetworkBackup = (
  menuai: menuai,
  backup: ZHANetworkBackup,
  ezspForceWriteEUI64 = false
): Promise<void> =>
  menuai.callWS({
    type: "zha/network/backups/restore",
    backup: backup,
    ezsp_force_write_eui64: ezspForceWriteEUI64,
  });

export const listZHANetworkBackups = (
  menuai: menuai
): Promise<ZHANetworkBackup[]> =>
  menuai.callWS({
    type: "zha/network/backups/list",
  });

export const changeZHANetworkChannel = (
  menuai: menuai,
  newChannel: "auto" | number
): Promise<void> =>
  menuai.callWS({
    type: "zha/network/change_channel",
    new_channel: newChannel,
  });

export const INITIALIZED = "INITIALIZED";
export const INTERVIEW_COMPLETE = "INTERVIEW_COMPLETE";
export const CONFIGURED = "CONFIGURED";
export const PAIRED = "PAIRED";
export const INCOMPLETE_PAIRING_STATUSES = [
  PAIRED,
  CONFIGURED,
  INTERVIEW_COMPLETE,
];

export const DEVICE_JOINED = "device_joined";
export const RAW_DEVICE_INITIALIZED = "raw_device_initialized";
export const DEVICE_FULLY_INITIALIZED = "device_fully_initialized";
export const DEVICE_MESSAGE_TYPES = [
  DEVICE_JOINED,
  RAW_DEVICE_INITIALIZED,
  DEVICE_FULLY_INITIALIZED,
];
export const LOG_OUTPUT = "log_output";
export const ZHA_CHANNEL_MSG = "zha_channel_message";
export const ZHA_CHANNEL_MSG_BIND = "zha_channel_bind";
export const ZHA_CHANNEL_MSG_CFG_RPT = "zha_channel_configure_reporting";
export const ZHA_CHANNEL_CFG_DONE = "zha_channel_cfg_done";
