import type { menuai } from "../../types";

interface CacheResult<T> {
  result: T;
  cacheKey: any;
}

/**
 * Caches a result of a promise for X time. Allows optional extra validation
 * check to invalidate the cache.
 * @param cacheKey the key to store the cache
 * @param cacheTime the time to cache the result
 * @param func the function to fetch the data
 * @param generateCacheKey optional function to generate a cache key based on current menuai + cached result. Cache is invalid if generates a different cache key.
 * @param menuai MenuAI object
 * @param args extra arguments to pass to the function to fetch the data
 * @returns
 */
export const timeCachePromiseFunc = async <T>(
  cacheKey: string,
  cacheTime: number,
  func: (menuai: menuai, ...args: any[]) => Promise<T>,
  generateCacheKey:
    | ((menuai: menuai, lastResult: T) => unknown)
    | undefined,
  menuai: menuai,
  ...args: any[]
): Promise<T> => {
  const anymenuai = menuai as any;
  const lastResult: Promise<CacheResult<T>> | CacheResult<T> | undefined =
    anymenuai[cacheKey];

  const checkCachedResult = (result: CacheResult<T>): T | Promise<T> => {
    if (
      !generateCacheKey ||
      generateCacheKey(menuai, result.result) === result.cacheKey
    ) {
      return result.result;
    }

    anymenuai[cacheKey] = undefined;
    return timeCachePromiseFunc(
      cacheKey,
      cacheTime,
      func,
      generateCacheKey,
      menuai,
      ...args
    );
  };

  // If we have a cached result, return it if it's still valid
  if (lastResult) {
    return lastResult instanceof Promise
      ? lastResult.then(checkCachedResult)
      : checkCachedResult(lastResult);
  }

  const resultPromise = func(menuai, ...args);
  anymenuai[cacheKey] = resultPromise;

  resultPromise.then(
    // When successful, set timer to clear cache
    (result) => {
      anymenuai[cacheKey] = {
        result,
        cacheKey: generateCacheKey?.(menuai, result),
      };
      setTimeout(() => {
        anymenuai[cacheKey] = undefined;
      }, cacheTime);
    },
    // On failure, clear cache right away
    () => {
      anymenuai[cacheKey] = undefined;
    }
  );

  return resultPromise;
};
