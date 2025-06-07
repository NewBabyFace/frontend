import { timeCachePromiseFunc } from "../common/util/time-cache-function-promise";
import type { menuai } from "../types";

interface EntitySource {
  domain: string;
}

export type EntitySources = Record<string, EntitySource>;

const fetchEntitySources = (menuai: menuai): Promise<EntitySources> =>
  menuai.callWS({ type: "entity/source" });

export const fetchEntitySourcesWithCache = (
  menuai: menuai
): Promise<EntitySources> =>
  timeCachePromiseFunc(
    "_entitySources",
    // cache for 30 seconds
    30000,
    fetchEntitySources,
    // We base the cache on number of states. If number of states
    // changes we force a refresh
    (menuai2) => Object.keys(menuai2.states).length,
    menuai
  );
