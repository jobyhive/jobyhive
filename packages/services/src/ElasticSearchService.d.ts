/**
 * ElasticSearchService
 *
 * Singleton wrapper around the official `@elastic/elasticsearch` Client.
 * Connection is created once; subsequent calls to `getInstance()` return the
 * same object.
 *
 * Config is sourced exclusively from `@repo/system-config`.
 */
import { type estypes } from '@elastic/elasticsearch';
import { Service } from './Service.js';
export declare class ElasticSearchService extends Service {
    private static _instance;
    /** Returns (and lazily creates) the singleton instance. */
    static getInstance(): ElasticSearchService;
    private _client;
    private constructor();
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    private get client();
    /**
     * Index (create/replace) a document.
     * @param index  Target index name.
     * @param id     Document ID.
     * @param body   Document body.
     */
    index<T extends Record<string, unknown>>(index: string, id: string, body: T): Promise<estypes.IndexResponse>;
    /**
     * Full-text / structured search.
     * @param index  Target index name (or comma-separated list / wildcard).
     * @param query  Elasticsearch query DSL object.
     */
    search<T = unknown>(index: string, query: estypes.QueryDslQueryContainer, options?: {
        size?: number;
        from?: number;
    }): Promise<estypes.SearchHit<T>[]>;
    /**
     * Get a document by ID.
     */
    get<T = unknown>(index: string, id: string): Promise<T | null>;
    /**
     * Delete a document by ID.
     */
    delete(index: string, id: string): Promise<estypes.DeleteResponse>;
    /**
     * Check if a document exists.
     */
    exists(index: string, id: string): Promise<boolean>;
    /**
     * Bulk-index an array of documents.
     * Each item in `docs` must include an `_id` field.
     */
    bulkIndex<T extends Record<string, unknown> & {
        _id: string;
    }>(index: string, docs: T[]): Promise<estypes.BulkResponse>;
}
/** Convenience singleton accessor */
export declare const elasticSearchService: ElasticSearchService;
//# sourceMappingURL=ElasticSearchService.d.ts.map