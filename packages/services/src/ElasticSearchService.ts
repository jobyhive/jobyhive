/**
 * ElasticSearchService
 *
 * Singleton wrapper around the official `@elastic/elasticsearch` Client.
 * Connection is created once; subsequent calls to `getInstance()` return the
 * same object.
 *
 * Config is sourced exclusively from `@repo/system-config`.
 */

import { Client, type estypes } from '@elastic/elasticsearch';
import { config } from '@repo/system-config';
import { Service } from './Service.js';

export class ElasticSearchService extends Service {
    // ── Singleton ────────────────────────────────────────────────────────────
    private static _instance: ElasticSearchService | null = null;

    /** Returns (and lazily creates) the singleton instance. */
    static getInstance(): ElasticSearchService {
        if (!ElasticSearchService._instance) {
            ElasticSearchService._instance = new ElasticSearchService();
        }
        return ElasticSearchService._instance;
    }

    // ── Internal client ──────────────────────────────────────────────────────
    private _client: Client | null = null;

    private constructor() {
        super();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Lifecycle
    // ─────────────────────────────────────────────────────────────────────────

    private _degraded = false;

    async connect(): Promise<void> {
        if (this._connected) return;
        if (this._degraded) return;

        const { ELASTICSEARCH_URL, ELASTICSEARCH_API_KEY } = config;

        if (!ELASTICSEARCH_URL || !ELASTICSEARCH_API_KEY) {
            console.warn('[ElasticSearchService] Missing ELASTICSEARCH_URL or ELASTICSEARCH_API_KEY – running without ElasticSearch.');
            this._degraded = true;
            return;
        }

        try {
            this._client = new Client({
                node: ELASTICSEARCH_URL,
                auth: { apiKey: ELASTICSEARCH_API_KEY },
                tls: { rejectUnauthorized: false },
            });

            // Verify the cluster is reachable
            await this._client.ping();
            this._connected = true;
        } catch (err: any) {
            console.warn('[ElasticSearchService] Could not connect to ElasticSearch – running without long-term memory:', err.message);
            this._degraded = true;
            this._client = null;
        }
    }

    async disconnect(): Promise<void> {
        if (!this._connected || !this._client) return;
        await this._client.close();
        this._connected = false;
        this._client = null;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Client accessor (throws if not connected)
    // ─────────────────────────────────────────────────────────────────────────

    private get client(): Client {
        if (!this._client) {
            throw new Error(
                '[ElasticSearchService] Not connected. Call connect() first.',
            );
        }
        return this._client;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // API surface
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Index (create/replace) a document.
     * @param index  Target index name.
     * @param id     Document ID.
     * @param body   Document body.
     */
    async index<T extends Record<string, unknown>>(
        index: string,
        id: string,
        body: T,
    ): Promise<estypes.IndexResponse | null> {
        if (this._degraded || !this._client) return null;
        return this.client.index({ index, id, document: body });
    }

    /**
     * Full-text / structured search.
     * @param index  Target index name (or comma-separated list / wildcard).
     * @param query  Elasticsearch query DSL object.
     */
    async search<T = unknown>(
        index: string,
        query: estypes.QueryDslQueryContainer,
        options?: { size?: number; from?: number },
    ): Promise<estypes.SearchHit<T>[]> {
        if (this._degraded || !this._client) return [];
        const response = await this.client.search<T>({
            index,
            query,
            size: options?.size ?? 10,
            from: options?.from ?? 0,
        });
        return response.hits.hits;
    }

    /**
     * Get a document by ID.
     */
    async get<T = unknown>(
        index: string,
        id: string,
    ): Promise<T | null> {
        if (this._degraded || !this._client) return null;
        try {
            const response = await this.client.get<T>({ index, id });
            return response._source ?? null;
        } catch (error: any) {
            if (error.meta?.statusCode === 404) {
                return null;
            }
            throw error;
        }
    }

    /**
     * Delete a document by ID.
     */
    async delete(
        index: string,
        id: string,
    ): Promise<estypes.DeleteResponse | null> {
        if (this._degraded || !this._client) return null;
        return this.client.delete({ index, id });
    }

    /**
     * Check if a document exists.
     */
    async exists(index: string, id: string): Promise<boolean> {
        if (this._degraded || !this._client) return false;
        return this.client.exists({ index, id });
    }

    /**
     * Bulk-index an array of documents.
     * Each item in `docs` must include an `_id` field.
     */
    async bulkIndex<T extends Record<string, unknown> & { _id: string }>(
        index: string,
        docs: T[],
    ): Promise<estypes.BulkResponse> {
        const operations = docs.flatMap(({ _id, ...doc }) => [
            { index: { _index: index, _id } },
            doc,
        ]);
        return this.client.bulk({ operations, refresh: true });
    }
}

/** Convenience singleton accessor */
export const elasticSearchService = ElasticSearchService.getInstance();