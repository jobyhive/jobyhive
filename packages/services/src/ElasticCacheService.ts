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

import { Redis } from 'ioredis';
import { config } from '@repo/system-config';
import { Service } from './Service.js';

export class ElasticCacheService extends Service {
    // ── Singleton ────────────────────────────────────────────────────────────
    private static _instance: ElasticCacheService | null = null;

    static getInstance(): ElasticCacheService {
        if (!ElasticCacheService._instance) {
            ElasticCacheService._instance = new ElasticCacheService();
        }
        return ElasticCacheService._instance;
    }

    // ── Internal client ──────────────────────────────────────────────────────
    private _client: Redis | null = null;

    private constructor() {
        super();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Lifecycle
    // ─────────────────────────────────────────────────────────────────────────

    async connect(): Promise<void> {
        if (this._connected) return;

        const { REDIS_URL } = config;

        this._client = new Redis(REDIS_URL, {
            maxRetriesPerRequest: 3,
            lazyConnect: true,
        });

        // Attach error handler before connecting to avoid unhandled rejections
        this._client.on('error', (err: Error) => {
            console.error('[ElasticCacheService] Redis error:', err.message);
        });

        await this._client.connect();
        this._connected = true;
    }

    async disconnect(): Promise<void> {
        if (!this._connected || !this._client) return;
        await this._client.quit();
        this._connected = false;
        this._client = null;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Client accessor
    // ─────────────────────────────────────────────────────────────────────────

    private get client(): Redis {
        if (!this._client) {
            throw new Error(
                '[ElasticCacheService] Not connected. Call connect() first.',
            );
        }
        return this._client;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // API surface
    // ─────────────────────────────────────────────────────────────────────────

    /** Retrieve a cached value (returns `null` if key does not exist). */
    async get(key: string): Promise<string | null> {
        return this.client.get(key);
    }

    /** Store a string value with an optional TTL (seconds). */
    async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
        if (ttlSeconds !== undefined) {
            await this.client.set(key, value, 'EX', ttlSeconds);
        } else {
            await this.client.set(key, value);
        }
    }

    /** Store a value with a mandatory TTL (seconds). */
    async setEx(key: string, ttlSeconds: number, value: string): Promise<void> {
        await this.client.setex(key, ttlSeconds, value);
    }

    /** Delete one or more keys. */
    async del(...keys: string[]): Promise<number> {
        return this.client.del(...keys);
    }

    /** Increment an integer stored at `key` by `increment` (default 1). */
    async incr(key: string, increment = 1): Promise<number> {
        return increment === 1
            ? this.client.incr(key)
            : this.client.incrby(key, increment);
    }

    /** Check if a key exists. */
    async exists(key: string): Promise<boolean> {
        const count = await this.client.exists(key);
        return count > 0;
    }

    /** Return the remaining TTL of a key in seconds (-1 if no TTL, -2 if missing). */
    async ttl(key: string): Promise<number> {
        return this.client.ttl(key);
    }

    /** Flush the entire database (use with caution in production). */
    async flushAll(): Promise<void> {
        await this.client.flushall();
    }
}

/** Convenience singleton accessor */
export const elasticCacheService = ElasticCacheService.getInstance();