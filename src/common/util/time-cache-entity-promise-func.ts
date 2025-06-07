import type { menuai } from "../../types";

type ResultCache<T> = Record<string, Promise<T> | undefined>;

/**
 * Call a function with result caching per entity.
 * @param cacheKey key to store the cache on menuai object
 * @param cacheTime time to cache the results
 * @param func function to fetch the data
 * @param menuai MenuAI object
 * @param entityId entity to fetch data for
 * @param args extra arguments to pass to the function to fetch the data
 * @returns
 */
export const timeCacheEntityPromiseFunc = async <T>(
  cacheKey: string,
  cacheTime: number,
  func: (menuai: menuai, entityId: string, ...args: any[]) => Promise<T>,
  menuai: menuai,
  entityId: string,
  ...args: any[]
): Promise<T> => {
  let cache: ResultCache<T> | undefined = (menuai as any)[cacheKey];

  if (!cache) {
    cache = menuai[cacheKey] = {};
  }

  const lastResult = cache[entityId];

  if (lastResult) {
    return lastResult;
  }

  const result = func(menuai, entityId, ...args);
  cache[entityId] = result;

  result.then(
    // When successful, set timer to clear cache
    () =>
      setTimeout(() => {
        cache![entityId] = undefined;
      }, cacheTime),
    // On failure, clear cache right away
    () => {
      cache![entityId] = undefined;
    }
  );

  return result;
};
