import { elasticCacheService } from "@repo/services";

/**
 * useShortMemory (Server-side optimized)
 * 
 * Provides an interface for short-term memory (Redis backed) 
 * usable in server-side environments.
 * Handles connection automatically on the first call.
 */
export function useShortMemory(): {
    connect: () => Promise<void>;
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string, ttlSeconds?: number) => Promise<void>;
    del: (...keys: string[]) => Promise<number>;
    service: any;
} {
    const ensureConnected = async () => {
        await elasticCacheService.connect();
    };

    return {
        connect: ensureConnected,
        get: async (key: string) => {
            await ensureConnected();
            return await elasticCacheService.get(key);
        },
        set: async (key: string, value: string, ttlSeconds?: number) => {
            await ensureConnected();
            await elasticCacheService.set(key, value, ttlSeconds);
        },
        del: async (...keys: string[]) => {
            await ensureConnected();
            return await elasticCacheService.del(...keys);
        },
        service: elasticCacheService
    };
}
