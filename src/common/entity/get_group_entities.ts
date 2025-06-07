import type { menuaiEntities } from "home-assistant-js-websocket";
import type { GroupEntity } from "../../data/group";

export const getGroupEntities = (
  entities: menuaiEntities,
  group: GroupEntity
) => {
  const result = {};

  group.attributes.entity_id.forEach((entityId) => {
    const entity = entities[entityId];

    if (entity) {
      result[entity.entity_id] = entity;
    }
  });

  return result;
};
