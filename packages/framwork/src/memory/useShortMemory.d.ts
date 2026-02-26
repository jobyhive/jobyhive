/**
 * useShortMemory (Server-side optimized)
 *
 * Provides an interface for short-term memory (Redis backed)
 * usable in server-side environments.
 * Handles connection automatically on the first call.
 */
export declare function useShortMemory(): {
    connect: () => Promise<void>;
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string, ttlSeconds?: number) => Promise<void>;
    del: (...keys: string[]) => Promise<number>;
    service: any;
};
//# sourceMappingURL=useShortMemory.d.ts.map