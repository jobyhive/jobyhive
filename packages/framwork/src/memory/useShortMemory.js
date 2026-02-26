import { elasticCacheService } from "@repo/services";
/**
 * useShortMemory (Server-side optimized)
 *
 * Provides an interface for short-term memory (Redis backed)
 * usable in server-side environments.
 * Handles connection automatically on the first call.
 */
export function useShortMemory() {
    const ensureConnected = async () => {
        await elasticCacheService.connect();
    };
    return {
        connect: ensureConnected,
        get: async (key) => {
            await ensureConnected();
            return await elasticCacheService.get(key);
        },
        set: async (key, value, ttlSeconds) => {
            await ensureConnected();
            await elasticCacheService.set(key, value, ttlSeconds);
        },
        del: async (...keys) => {
            await ensureConnected();
            return await elasticCacheService.del(...keys);
        },
        service: elasticCacheService
    };
}
