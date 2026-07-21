import { LRUCache } from "./cache";

describe("LRUCache", () => {
  it("returns undefined on a cache miss", () => {
    const cache = new LRUCache<string, number>(3);
    expect(cache.get("a")).toBeUndefined();
  });

  it("returns the cached value on a hit", () => {
    const cache = new LRUCache<string, number>(3);
    cache.set("a", 1);
    expect(cache.get("a")).toBe(1);
  });

  it("evicts the least recently used entry when maxSize is exceeded", () => {
    const cache = new LRUCache<string, number>(2);
    cache.set("a", 1);
    cache.set("b", 2);
    cache.set("c", 3); // should evict "a" (least recently used)

    expect(cache.get("a")).toBeUndefined();
    expect(cache.get("b")).toBe(2);
    expect(cache.get("c")).toBe(3);
  });

  it("counts a get() as a recent use, protecting it from eviction", () => {
    const cache = new LRUCache<string, number>(2);
    cache.set("a", 1);
    cache.set("b", 2);
    cache.get("a"); // "a" is now most recently used
    cache.set("c", 3); // should evict "b", not "a"

    expect(cache.get("a")).toBe(1);
    expect(cache.get("b")).toBeUndefined();
    expect(cache.get("c")).toBe(3);
  });

  it("expires an entry after its TTL passes", async () => {
    jest.useFakeTimers();
    const cache = new LRUCache<string, number>(3);
    cache.set("a", 1, 1000); // 1 second TTL

    expect(cache.get("a")).toBe(1);

    jest.advanceTimersByTime(1001);
    expect(cache.get("a")).toBeUndefined();

    jest.useRealTimers();
  });

  it("does not expire an entry with no TTL", () => {
    jest.useFakeTimers();
    const cache = new LRUCache<string, number>(3);
    cache.set("a", 1); // no TTL

    jest.advanceTimersByTime(1_000_000);
    expect(cache.get("a")).toBe(1);

    jest.useRealTimers();
  });

  it("removes an entry via invalidate()", () => {
    const cache = new LRUCache<string, number>(3);
    cache.set("a", 1);
    cache.invalidate("a");
    expect(cache.get("a")).toBeUndefined();
  });

  it("overwriting an existing key updates its value and marks it recently used", () => {
    const cache = new LRUCache<string, number>(2);
    cache.set("a", 1);
    cache.set("b", 2);
    cache.set("a", 10); // update "a", also refreshes its recency
    cache.set("c", 3); // should evict "b", not "a"

    expect(cache.get("a")).toBe(10);
    expect(cache.get("b")).toBeUndefined();
    expect(cache.get("c")).toBe(3);
  });
});