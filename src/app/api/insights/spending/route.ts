import { NextResponse } from "next/server";
import { APP_USER } from "@/lib/workspace";
import { getExpenses } from "@/lib/data";
import { spendingAnalytics } from "@/lib/expenses";
import { LRUCache } from "@/utils/cache";

const spendingCache = new LRUCache<string, ReturnType<typeof spendingAnalytics>>(50);
const CACHE_TTL_MS = 60_000; // 1 minute

export async function GET() {
  const cacheKey = `spending:${APP_USER.id}`;

  const cached = spendingCache.get(cacheKey);
  if (cached !== undefined) {
    return NextResponse.json(cached);
  }

  const result = spendingAnalytics(await getExpenses(APP_USER.id));
  spendingCache.set(cacheKey, result, CACHE_TTL_MS);

  return NextResponse.json(result);
}