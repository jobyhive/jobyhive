/**
 * ElasticCacheService
 *
 * Singleton wrapper around an `ioredis` Redis client, typically backed by
 * Amazon ElastiCache (Redis-compatible).
 *
 * Connection is created once; subsequent calls to `getInstance()` return the
 * same object.
 *
 * Config is sourced exclusively from `@repo/system-config`.
 */
import { Service } from './Service.js';
export declare class ElasticCacheService extends Service {
    private static _instance;
    static getInstance(): ElasticCacheService;
    private _client;
    private constructor();
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    private get client();
    /** Retrieve a cached value (returns `null` if key does not exist). */
    get(key: string): Promise<string | null>;
    /** Store a string value with an optional TTL (seconds). */
    set(key: string, value: string, ttlSeconds?: number): Promise<void>;
    /** Store a value with a mandatory TTL (seconds). */
    setEx(key: string, ttlSeconds: number, value: string): Promise<void>;
    /** Delete one or more keys. */
    del(...keys: string[]): Promise<number>;
    /** Increment an integer stored at `key` by `increment` (default 1). */
    incr(key: string, increment?: number): Promise<number>;
    /** Check if a key exists. */
    exists(key: string): Promise<boolean>;
    /** Return the remaining TTL of a key in seconds (-1 if no TTL, -2 if missing). */
    ttl(key: string): Promise<number>;
    /** Flush the entire database (use with caution in production). */
    flushAll(): Promise<void>;
}
/** Convenience singleton accessor */
export declare const elasticCacheService: ElasticCacheService;
//# sourceMappingURL=ElasticCacheService.d.ts.map