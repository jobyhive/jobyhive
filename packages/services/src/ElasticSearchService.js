/**
 * ElasticSearchService
 *
 * Singleton wrapper around the official `@elastic/elasticsearch` Client.
 * Connection is created once; subsequent calls to `getInstance()` return the
 * same object.
 *
 * Config is sourced exclusively from `@repo/system-config`.
 */
import { Client } from '@elastic/elasticsearch';
import { config } from '@repo/system-config';
import { Service } from './Service.js';
export class ElasticSearchService extends Service {
    // ── Singleton ────────────────────────────────────────────────────────────
    static _instance = null;
    /** Returns (and lazily creates) the singleton instance. */
    static getInstance() {
        if (!ElasticSearchService._instance) {
            ElasticSearchService._instance = new ElasticSearchService();
        }
        return ElasticSearchService._instance;
    }
    // ── Internal client ──────────────────────────────────────────────────────
    _client = null;
    constructor() {
        super();
    }
    // ─────────────────────────────────────────────────────────────────────────
    // Lifecycle
    // ─────────────────────────────────────────────────────────────────────────
    async connect() {
        if (this._connected)
            return;
        const { ELASTICSEARCH_URL, ELASTICSEARCH_API_KEY } = config;
        if (!ELASTICSEARCH_URL || !ELASTICSEARCH_API_KEY) {
            throw new Error('[ElasticSearchService] Missing ELASTICSEARCH_URL or ELASTICSEARCH_API_KEY in config.');
        }
        this._client = new Client({
            node: ELASTICSEARCH_URL,
            auth: { apiKey: ELASTICSEARCH_API_KEY },
            tls: { rejectUnauthorized: false },
        });
        // Verify the cluster is reachable
        await this._client.ping();
        this._connected = true;
    }
    async disconnect() {
        if (!this._connected || !this._client)
            return;
        await this._client.close();
        this._connected = false;
        this._client = null;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // Client accessor (throws if not connected)
    // ─────────────────────────────────────────────────────────────────────────
    get client() {
        if (!this._client) {
            throw new Error('[ElasticSearchService] Not connected. Call connect() first.');
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
    async index(index, id, body) {
        return this.client.index({ index, id, document: body });
    }
    /**
     * Full-text / structured search.
     * @param index  Target index name (or comma-separated list / wildcard).
     * @param query  Elasticsearch query DSL object.
     */
    async search(index, query, options) {
        const response = await this.client.search({
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
    async get(index, id) {
        try {
            const response = await this.client.get({ index, id });
            return response._source ?? null;
        }
        catch (error) {
            if (error.meta?.statusCode === 404) {
                return null;
            }
            throw error;
        }
    }
    /**
     * Delete a document by ID.
     */
    async delete(index, id) {
        return this.client.delete({ index, id });
    }
    /**
     * Check if a document exists.
     */
    async exists(index, id) {
        return this.client.exists({ index, id });
    }
    /**
     * Bulk-index an array of documents.
     * Each item in `docs` must include an `_id` field.
     */
    async bulkIndex(index, docs) {
        const operations = docs.flatMap(({ _id, ...doc }) => [
            { index: { _index: index, _id } },
            doc,
        ]);
        return this.client.bulk({ operations, refresh: true });
    }
}
/** Convenience singleton accessor */
export const elasticSearchService = ElasticSearchService.getInstance();
