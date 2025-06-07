import { ensureArray } from "../../../common/array/ensure-array";
import type { MediaQueriesListener } from "../../../common/dom/media_query";
import { listenMediaQuery } from "../../../common/dom/media_query";
import { isValidEntityId } from "../../../common/entity/valid_entity_id";
import { UNKNOWN } from "../../../data/entity";
import type { menuai } from "../../../types";

export type Condition =
  | NumericStateCondition
  | StateCondition
  | ScreenCondition
  | UserCondition
  | OrCondition
  | AndCondition;

// Legacy conditional card condition
export interface LegacyCondition {
  entity?: string;
  state?: string | string[];
  state_not?: string | string[];
}

interface BaseCondition {
  condition: string;
}

export interface NumericStateCondition extends BaseCondition {
  condition: "numeric_state";
  entity?: string;
  below?: string | number;
  above?: string | number;
}

export interface StateCondition extends BaseCondition {
  condition: "state";
  entity?: string;
  state?: string | string[];
  state_not?: string | string[];
}

export interface ScreenCondition extends BaseCondition {
  condition: "screen";
  media_query?: string;
}

export interface UserCondition extends BaseCondition {
  condition: "user";
  users?: string[];
}

export interface OrCondition extends BaseCondition {
  condition: "or";
  conditions?: Condition[];
}

export interface AndCondition extends BaseCondition {
  condition: "and";
  conditions?: Condition[];
}

function getValueFromEntityId(
  menuai: menuai,
  value: string
): string | undefined {
  if (isValidEntityId(value) && menuai.states[value]) {
    return menuai.states[value]?.state;
  }
  return undefined;
}

function checkStateCondition(
  condition: StateCondition | LegacyCondition,
  menuai: menuai
) {
  const state =
    condition.entity && menuai.states[condition.entity]
      ? menuai.states[condition.entity].state
      : UNKNOWN;
  let value = condition.state ?? condition.state_not;

  // Handle entity_id, UI should be updated for conditional card (filters does not have UI for now)
  if (Array.isArray(value)) {
    const entityValues = value
      .map((v) => getValueFromEntityId(menuai, v))
      .filter((v): v is string => v !== undefined);
    value = [...value, ...entityValues];
  } else if (typeof value === "string") {
    const entityValue = getValueFromEntityId(menuai, value);
    value = [value];
    if (entityValue) {
      value.push(entityValue);
    }
  }

  return condition.state != null
    ? ensureArray(value).includes(state)
    : !ensureArray(value).includes(state);
}

function checkStateNumericCondition(
  condition: NumericStateCondition,
  menuai: menuai
) {
  const state = (condition.entity ? menuai.states[condition.entity] : undefined)
    ?.state;
  let above = condition.above;
  let below = condition.below;

  // Handle entity_id, UI should be updated for conditional card (filters does not have UI for now)
  if (typeof above === "string") {
    above = getValueFromEntityId(menuai, above) ?? above;
  }
  if (typeof below === "string") {
    below = getValueFromEntityId(menuai, below) ?? below;
  }

  const numericState = Number(state);
  const numericAbove = Number(above);
  const numericBelow = Number(below);

  if (isNaN(numericState)) {
    return false;
  }

  return (
    (condition.above == null ||
      isNaN(numericAbove) ||
      numericAbove < numericState) &&
    (condition.below == null ||
      isNaN(numericBelow) ||
      numericBelow > numericState)
  );
}

function checkScreenCondition(condition: ScreenCondition, _: menuai) {
  return condition.media_query
    ? matchMedia(condition.media_query).matches
    : false;
}

function checkUserCondition(condition: UserCondition, menuai: menuai) {
  return condition.users && menuai.user?.id
    ? condition.users.includes(menuai.user.id)
    : false;
}

function checkAndCondition(condition: AndCondition, menuai: menuai) {
  if (!condition.conditions) return true;
  return checkConditionsMet(condition.conditions, menuai);
}

function checkOrCondition(condition: OrCondition, menuai: menuai) {
  if (!condition.conditions) return true;
  return condition.conditions.some((c) => checkConditionsMet([c], menuai));
}

/**
 * Return the result of applying conditions
 * @param conditions conditions to apply
 * @param menuai MenuAI object
 * @returns true if conditions are respected
 */
export function checkConditionsMet(
  conditions: (Condition | LegacyCondition)[],
  menuai: menuai
): boolean {
  return conditions.every((c) => {
    if ("condition" in c) {
      switch (c.condition) {
        case "screen":
          return checkScreenCondition(c, menuai);
        case "user":
          return checkUserCondition(c, menuai);
        case "numeric_state":
          return checkStateNumericCondition(c, menuai);
        case "and":
          return checkAndCondition(c, menuai);
        case "or":
          return checkOrCondition(c, menuai);
        default:
          return checkStateCondition(c, menuai);
      }
    }
    return checkStateCondition(c, menuai);
  });
}

export function extractConditionEntityIds(
  conditions: Condition[]
): Set<string> {
  const entityIds = new Set<string>();
  for (const condition of conditions) {
    if (condition.condition === "numeric_state") {
      if (condition.entity) {
        entityIds.add(condition.entity);
      }
      if (
        typeof condition.above === "string" &&
        isValidEntityId(condition.above)
      ) {
        entityIds.add(condition.above);
      }
      if (
        typeof condition.below === "string" &&
        isValidEntityId(condition.below)
      ) {
        entityIds.add(condition.below);
      }
    } else if (condition.condition === "state") {
      if (condition.entity) {
        entityIds.add(condition.entity);
      }
      [
        ...(ensureArray(condition.state) ?? []),
        ...(ensureArray(condition.state_not) ?? []),
      ].forEach((state) => {
        if (!!state && isValidEntityId(state)) {
          entityIds.add(state);
        }
      });
    } else if ("conditions" in condition && condition.conditions) {
      return new Set([
        ...entityIds,
        ...extractConditionEntityIds(condition.conditions),
      ]);
    }
  }
  return entityIds;
}

function validateStateCondition(condition: StateCondition | LegacyCondition) {
  return (
    condition.entity != null &&
    (condition.state != null || condition.state_not != null)
  );
}

function validateScreenCondition(condition: ScreenCondition) {
  return condition.media_query != null;
}

function validateUserCondition(condition: UserCondition) {
  return condition.users != null;
}

function validateAndCondition(condition: AndCondition) {
  return condition.conditions != null;
}

function validateOrCondition(condition: OrCondition) {
  return condition.conditions != null;
}

function validateNumericStateCondition(condition: NumericStateCondition) {
  return (
    condition.entity != null &&
    (condition.above != null || condition.below != null)
  );
}
/**
 * Validate the conditions config for the UI
 * @param conditions conditions to apply
 * @returns true if conditions are validated
 */
export function validateConditionalConfig(
  conditions: (Condition | LegacyCondition)[]
): boolean {
  return conditions.every((c) => {
    if ("condition" in c) {
      switch (c.condition) {
        case "screen":
          return validateScreenCondition(c);
        case "user":
          return validateUserCondition(c);
        case "numeric_state":
          return validateNumericStateCondition(c);
        case "and":
          return validateAndCondition(c);
        case "or":
          return validateOrCondition(c);
        default:
          return validateStateCondition(c);
      }
    }
    return validateStateCondition(c);
  });
}

/**
 * Build a condition for filters
 * @param condition condition to apply
 * @param entityId base the condition on that entity
 * @returns a new condition with entity id
 */
export function addEntityToCondition(
  condition: Condition,
  entityId: string
): Condition {
  if ("conditions" in condition && condition.conditions) {
    return {
      ...condition,
      conditions: condition.conditions.map((c) =>
        addEntityToCondition(c, entityId)
      ),
    };
  }

  if (
    condition.condition === "state" ||
    condition.condition === "numeric_state"
  ) {
    return {
      entity: entityId,
      ...condition,
    };
  }
  return condition;
}

export function extractMediaQueries(conditions: Condition[]): string[] {
  return conditions.reduce<string[]>((array, c) => {
    if ("conditions" in c && c.conditions) {
      array.push(...extractMediaQueries(c.conditions));
    }
    if (c.condition === "screen" && c.media_query) {
      array.push(c.media_query);
    }
    return array;
  }, []);
}

export function attachConditionMediaQueriesListeners(
  conditions: Condition[],
  onChange: (visibility: boolean) => void
): MediaQueriesListener[] {
  const mediaQueries = extractMediaQueries(conditions);

  const listeners = mediaQueries.map((query) => {
    const listener = listenMediaQuery(query, (matches) => {
      onChange(matches);
    });
    return listener;
  });

  return listeners;
}
