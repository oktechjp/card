// Derived from https://github.com/dominictarr/hashlru/blob/master/index.js

export interface LRU<T> {
  has(key: string): boolean;
  remove(key: string): void;
  get(key: string): T;
  set(key: string, value: T): void;
  clear(): void;
}
export interface AutoLRU<T> {
  get(key: string): T;
  clear(): void;
}
export function autoLru<T = any>(
  max: number,
  create: (key: string) => T,
): AutoLRU<T> {
  const cache = lru<T>(max);
  return {
    get(key) {
      let res = cache.get(key);
      if (res === undefined) {
        res = create(key);
        cache.set(key, res);
      }
      return res;
    },
    clear: () => cache.clear(),
  };
}
export function lru<T = any>(max: number): LRU<T> {
  let size = 0;
  let cache = Object.create(null);
  let _cache = Object.create(null);

  function update(key: string, value: T) {
    cache[key] = value;
    size++;
    if (size >= max) {
      size = 0;
      _cache = cache;
      cache = Object.create(null);
    }
  }

  return {
    has(key: string) {
      return cache[key] !== undefined || _cache[key] !== undefined;
    },
    remove(key: string) {
      if (cache[key] !== undefined) cache[key] = undefined;
      if (_cache[key] !== undefined) _cache[key] = undefined;
    },
    get(key: string) {
      let v = cache[key];
      if (v !== undefined) return v;
      if ((v = _cache[key]) !== undefined) {
        update(key, v);
        return v;
      }
    },
    set: function (key: string, value: T) {
      if (cache[key] !== undefined) cache[key] = value;
      else update(key, value);
    },
    clear: function () {
      size = 0;
      cache = Object.create(null);
      _cache = Object.create(null);
    },
  };
}
