import { ensureArray } from "../common/array/ensure-array";
import { formatNumericDuration } from "../common/datetime/format_duration";
import secondsToDuration from "../common/datetime/seconds_to_duration";
import { computeDeviceNameDisplay } from "../common/entity/compute_device_name";
import { computeStateName } from "../common/entity/compute_state_name";
import { formatListWithAnds } from "../common/string/format-list";
import { isTemplate } from "../common/string/has-template";
import type { menuai } from "../types";
import type { Condition } from "./automation";
import { describeCondition } from "./automation_i18n";
import { localizeDeviceAutomationAction } from "./device_automation";
import type { EntityRegistryEntry } from "./entity_registry";
import {
  computeEntityRegistryName,
  entityRegistryById,
} from "./entity_registry";
import type { FloorRegistryEntry } from "./floor_registry";
import { domainToName } from "./integration";
import type { LabelRegistryEntry } from "./label_registry";
import type {
  ActionType,
  ActionTypes,
  ChooseAction,
  DelayAction,
  DeviceAction,
  EventAction,
  IfAction,
  ParallelAction,
  PlayMediaAction,
  RepeatAction,
  SequenceAction,
  SetConversationResponseAction,
  StopAction,
  VariablesAction,
  WaitForTriggerAction,
} from "./script";
import { getActionType } from "./script";

const actionTranslationBaseKey =
  "ui.panel.config.automation.editor.actions.type";

export const describeAction = <T extends ActionType>(
  menuai: menuai,
  entityRegistry: EntityRegistryEntry[],
  labelRegistry: LabelRegistryEntry[],
  floorRegistry: Record<string, FloorRegistryEntry>,
  action: ActionTypes[T],
  actionType?: T,
  ignoreAlias = false
): string => {
  try {
    const description = tryDescribeAction(
      menuai,
      entityRegistry,
      labelRegistry,
      floorRegistry,
      action,
      actionType,
      ignoreAlias
    );
    if (typeof description !== "string") {
      throw new Error(String(description));
    }
    return description;
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error(error);
    let msg = "Error in describing action";
    if (error.message) {
      msg += ": " + error.message;
    }
    return msg;
  }
};

const tryDescribeAction = <T extends ActionType>(
  menuai: menuai,
  entityRegistry: EntityRegistryEntry[],
  labelRegistry: LabelRegistryEntry[],
  floorRegistry: Record<string, FloorRegistryEntry>,
  action: ActionTypes[T],
  actionType?: T,
  ignoreAlias = false
): string => {
  if (action.alias && !ignoreAlias) {
    return action.alias;
  }
  if (!actionType) {
    actionType = getActionType(action) as T;
  }

  if (actionType === "service") {
    const config = action as ActionTypes["service"];

    const targets: string[] = [];
    const targetOrData = config.target || config.data;
    if (typeof targetOrData === "string" && isTemplate(targetOrData)) {
      targets.push(
        menuai.localize(
          `${actionTranslationBaseKey}.service.description.target_template`,
          { name: "target" }
        )
      );
    } else if (targetOrData) {
      for (const [key, name] of Object.entries({
        area_id: "areas",
        device_id: "devices",
        entity_id: "entities",
        floor_id: "floors",
        label_id: "labels",
      })) {
        if (!(key in targetOrData)) {
          continue;
        }
        const keyConf: string[] = ensureArray(targetOrData[key]) || [];

        for (const targetThing of keyConf) {
          if (isTemplate(targetThing)) {
            targets.push(
              menuai.localize(
                `${actionTranslationBaseKey}.service.description.target_template`,
                { name }
              )
            );
            break;
          } else if (key === "entity_id") {
            if (targetThing.includes(".")) {
              const state = menuai.states[targetThing];
              if (state) {
                targets.push(computeStateName(state));
              } else {
                targets.push(targetThing);
              }
            } else {
              const entityReg = entityRegistryById(entityRegistry)[targetThing];
              if (entityReg) {
                targets.push(
                  computeEntityRegistryName(menuai, entityReg) || targetThing
                );
              } else if (targetThing === "all") {
                targets.push(
                  menuai.localize(
                    `${actionTranslationBaseKey}.service.description.target_every_entity`
                  )
                );
              } else {
                targets.push(
                  menuai.localize(
                    `${actionTranslationBaseKey}.service.description.target_unknown_entity`
                  )
                );
              }
            }
          } else if (key === "device_id") {
            const device = menuai.devices[targetThing];
            if (device) {
              targets.push(computeDeviceNameDisplay(device, menuai));
            } else {
              targets.push(
                menuai.localize(
                  `${actionTranslationBaseKey}.service.description.target_unknown_device`
                )
              );
            }
          } else if (key === "area_id") {
            const area = menuai.areas[targetThing];
            if (area?.name) {
              targets.push(area.name);
            } else {
              targets.push(
                menuai.localize(
                  `${actionTranslationBaseKey}.service.description.target_unknown_area`
                )
              );
            }
          } else if (key === "floor_id") {
            const floor = floorRegistry[targetThing] ?? undefined;
            if (floor?.name) {
              targets.push(floor.name);
            } else {
              targets.push(
                menuai.localize(
                  `${actionTranslationBaseKey}.service.description.target_unknown_floor`
                )
              );
            }
          } else if (key === "label_id") {
            const label = labelRegistry.find(
              (lbl) => lbl.label_id === targetThing
            );
            if (label?.name) {
              targets.push(label.name);
            } else {
              targets.push(
                menuai.localize(
                  `${actionTranslationBaseKey}.service.description.target_unknown_label`
                )
              );
            }
          } else {
            targets.push(targetThing);
          }
        }
      }
    }

    if (
      config.service_template ||
      (config.action && isTemplate(config.action))
    ) {
      return menuai.localize(
        targets.length
          ? `${actionTranslationBaseKey}.service.description.service_based_on_template`
          : `${actionTranslationBaseKey}.service.description.service_based_on_template_no_targets`,
        {
          targets: formatListWithAnds(menuai.locale, targets),
        }
      );
    }

    if (config.action) {
      const [domain, serviceName] = config.action.split(".", 2);
      const service =
        menuai.localize(`component.${domain}.services.${serviceName}.name`) ||
        menuai.services[domain][serviceName]?.name;

      if (config.metadata) {
        return menuai.localize(
          targets.length
            ? `${actionTranslationBaseKey}.service.description.service_name`
            : `${actionTranslationBaseKey}.service.description.service_name_no_targets`,
          {
            domain: domainToName(menuai.localize, domain),
            name: service || config.action,
            targets: formatListWithAnds(menuai.locale, targets),
          }
        );
      }

      return menuai.localize(
        targets.length
          ? `${actionTranslationBaseKey}.service.description.service_based_on_name`
          : `${actionTranslationBaseKey}.service.description.service_based_on_name_no_targets`,
        {
          name: service
            ? `${domainToName(menuai.localize, domain)}: ${service}`
            : config.action,
          targets: formatListWithAnds(menuai.locale, targets),
        }
      );
    }
    return menuai.localize(
      `${actionTranslationBaseKey}.service.description.service`
    );
  }

  if (actionType === "delay") {
    const config = action as DelayAction;

    let duration: string;
    if (typeof config.delay === "number") {
      duration = menuai.localize(
        `${actionTranslationBaseKey}.delay.description.duration_string`,
        {
          string: secondsToDuration(config.delay)!,
        }
      );
    } else if (typeof config.delay === "string") {
      duration = isTemplate(config.delay)
        ? menuai.localize(
            `${actionTranslationBaseKey}.delay.description.duration_template`
          )
        : menuai.localize(
            `${actionTranslationBaseKey}.delay.description.duration_string`,
            {
              string:
                config.delay ||
                menuai.localize(
                  `${actionTranslationBaseKey}.delay.description.duration_unknown`
                ),
            }
          );
    } else if (config.delay) {
      duration = menuai.localize(
        `${actionTranslationBaseKey}.delay.description.duration_string`,
        {
          string: formatNumericDuration(menuai.locale, config.delay),
        }
      );
    } else {
      duration = menuai.localize(
        `${actionTranslationBaseKey}.delay.description.duration_string`,
        {
          string: menuai.localize(
            `${actionTranslationBaseKey}.delay.description.duration_unknown`
          ),
        }
      );
    }

    return menuai.localize(`${actionTranslationBaseKey}.delay.description.full`, {
      duration: duration,
    });
  }

  if (actionType === "play_media") {
    const config = action as PlayMediaAction;
    const entityId = config.target?.entity_id || config.entity_id;
    const mediaStateObj = entityId ? menuai.states[entityId] : undefined;
    return menuai.localize(
      `${actionTranslationBaseKey}.play_media.description.full`,
      {
        hasMedia:
          config.metadata.title || config.data.media_content_id
            ? "true"
            : "false",
        media:
          (config.metadata.title as string | undefined) ||
          config.data.media_content_id,
        hasMediaPlayer:
          mediaStateObj || entityId !== undefined ? "true" : "false",
        mediaPlayer: mediaStateObj ? computeStateName(mediaStateObj) : entityId,
      }
    );
  }

  if (actionType === "wait_for_trigger") {
    const config = action as WaitForTriggerAction;
    const triggers = ensureArray(config.wait_for_trigger);
    if (!triggers || triggers.length === 0) {
      return menuai.localize(
        `${actionTranslationBaseKey}.wait_for_trigger.description.wait_for_a_trigger`
      );
    }
    return menuai.localize(
      `${actionTranslationBaseKey}.wait_for_trigger.description.wait_for_triggers`,
      { count: triggers.length }
    );
  }

  if (actionType === "variables") {
    const config = action as VariablesAction;
    return menuai.localize(
      `${actionTranslationBaseKey}.variables.description.full`,
      {
        names: formatListWithAnds(menuai.locale, Object.keys(config.variables)),
      }
    );
  }

  if (actionType === "fire_event") {
    const config = action as EventAction;
    if (isTemplate(config.event)) {
      return menuai.localize(
        `${actionTranslationBaseKey}.event.description.full`,
        {
          name: menuai.localize(
            `${actionTranslationBaseKey}.event.description.template`
          ),
        }
      );
    }
    return menuai.localize(`${actionTranslationBaseKey}.event.description.full`, {
      name: config.event,
    });
  }

  if (actionType === "wait_template") {
    return menuai.localize(
      `${actionTranslationBaseKey}.wait_template.description.full`
    );
  }

  if (actionType === "stop") {
    const config = action as StopAction;
    return menuai.localize(`${actionTranslationBaseKey}.stop.description.full`, {
      hasReason: config.stop !== undefined ? "true" : "false",
      reason: config.stop,
    });
  }

  if (actionType === "if") {
    const config = action as IfAction;

    if (config.else !== undefined) {
      return menuai.localize(
        `${actionTranslationBaseKey}.if.description.if_else`
      );
    }

    return menuai.localize(`${actionTranslationBaseKey}.if.description.if`);
  }

  if (actionType === "choose") {
    const config = action as ChooseAction;
    if (config.choose) {
      const numActions =
        ensureArray(config.choose).length + (config.default ? 1 : 0);
      return menuai.localize(
        `${actionTranslationBaseKey}.choose.description.full`,
        { number: numActions }
      );
    }
    return menuai.localize(
      `${actionTranslationBaseKey}.choose.description.no_action`
    );
  }

  if (actionType === "repeat") {
    const config = action as RepeatAction;

    let chosenAction = "";
    if ("count" in config.repeat) {
      const count = config.repeat.count;
      chosenAction = menuai.localize(
        `${actionTranslationBaseKey}.repeat.description.count`,
        { count: count }
      );
    } else if ("while" in config.repeat) {
      const conditions = ensureArray(config.repeat.while);
      chosenAction = menuai.localize(
        `${actionTranslationBaseKey}.repeat.description.while_count`,
        { count: conditions.length }
      );
    } else if ("until" in config.repeat) {
      const conditions = ensureArray(config.repeat.until);
      chosenAction = menuai.localize(
        `${actionTranslationBaseKey}.repeat.description.until_count`,
        { count: conditions.length }
      );
    } else if ("for_each" in config.repeat) {
      const items = ensureArray(config.repeat.for_each).map((item) =>
        JSON.stringify(item)
      );
      chosenAction = menuai.localize(
        `${actionTranslationBaseKey}.repeat.description.for_each`,
        { items: formatListWithAnds(menuai.locale, items) }
      );
    }
    return menuai.localize(
      `${actionTranslationBaseKey}.repeat.description.full`,
      { chosenAction: chosenAction }
    );
  }

  if (actionType === "check_condition") {
    return menuai.localize(
      `${actionTranslationBaseKey}.check_condition.description.full`,
      {
        condition: describeCondition(action as Condition, menuai, entityRegistry),
      }
    );
  }

  if (actionType === "device_action") {
    const config = action as DeviceAction;
    if (!config.device_id) {
      return menuai.localize(
        `${actionTranslationBaseKey}.device_id.description.no_device`
      );
    }
    const localized = localizeDeviceAutomationAction(
      menuai,
      entityRegistry,
      config
    );
    if (localized) {
      return localized;
    }
    const stateObj = menuai.states[config.entity_id];
    return `${config.type || "Perform action with"} ${
      stateObj ? computeStateName(stateObj) : config.entity_id
    }`;
  }

  if (actionType === "sequence") {
    const config = action as SequenceAction;
    const numActions = ensureArray(config.sequence).length;
    return menuai.localize(
      `${actionTranslationBaseKey}.sequence.description.full`,
      { number: numActions }
    );
  }

  if (actionType === "parallel") {
    const config = action as ParallelAction;
    const numActions = ensureArray(config.parallel).length;
    return menuai.localize(
      `${actionTranslationBaseKey}.parallel.description.full`,
      { number: numActions }
    );
  }

  if (actionType === "set_conversation_response") {
    const config = action as SetConversationResponseAction;
    if (isTemplate(config.set_conversation_response)) {
      return menuai.localize(
        `${actionTranslationBaseKey}.set_conversation_response.description.template`
      );
    }
    return menuai.localize(
      `${actionTranslationBaseKey}.set_conversation_response.description.full`,
      { response: config.set_conversation_response }
    );
  }

  return actionType;
};
