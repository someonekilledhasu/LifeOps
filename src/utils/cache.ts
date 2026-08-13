export interface Cache<K, V> {
  get(key: K): V | undefined;
  set(key: K, value: V, ttlMs?: number): void;
  invalidate(key: K): void;
}
interface CacheEntry<V> {
  value: V;
  expiresAt: number | null; // timestamp in ms, or null for no expiry
}

export class LRUCache<K, V> implements Cache<K, V> {
  private store = new Map<K, CacheEntry<V>>();
  private maxSize: number;

  constructor(maxSize: number = 100) {
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;

    // check TTL expiry
    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }

    // move to end = mark as recently used
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.value;
  }

  set(key: K, value: V, ttlMs?: number): void {
    // if key exists, delete first so re-inserting puts it at the end
    if (this.store.has(key)) {
      this.store.delete(key);
    } else if (this.store.size >= this.maxSize) {
      // evict least recently used = first key in map
      const oldestKey = this.store.keys().next().value as K;
      this.store.delete(oldestKey);
    }

    this.store.set(key, {
      value,
      expiresAt: ttlMs ? Date.now() + ttlMs : null,
    });
  }

  invalidate(key: K): void {
    this.store.delete(key);
  }
}