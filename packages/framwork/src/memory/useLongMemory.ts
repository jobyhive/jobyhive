import { elasticSearchService } from "@repo/services";

/**
 * useLongMemory (Server-side optimized)
 * 
 * Provides an interface for long-term memory (ElasticSearch backed)
 * usable in server-side environments.
 */
export function useLongMemory(): {
    connect: () => Promise<void>;
    search: (index: string, query: any, options?: { size?: number; from?: number }) => Promise<any>;
    get: <T = any>(index: string, id: string) => Promise<T | null>;
    index: (indexName: string, id: string, body: any) => Promise<any>;
    exists: (indexName: string, id: string) => Promise<boolean>;
    remove: (indexName: string, id: string) => Promise<any>;
    service: any;
} {
    const ensureConnected = async () => {
        await elasticSearchService.connect();
    };

    return {
        connect: ensureConnected,
        search: async (index: string, query: any, options?: { size?: number; from?: number }) => {
            await ensureConnected();
            return await elasticSearchService.search(index, query, options);
        },
        get: async (index: string, id: string) => {
            await ensureConnected();
            return await elasticSearchService.get(index, id);
        },
        index: async (indexName: string, id: string, body: any) => {
            await ensureConnected();
            return await elasticSearchService.index(indexName, id, body);
        },
        exists: async (indexName: string, id: string) => {
            await ensureConnected();
            return await elasticSearchService.exists(indexName, id);
        },
        remove: async (indexName: string, id: string) => {
            await ensureConnected();
            return await elasticSearchService.delete(indexName, id);
        },
        service: elasticSearchService
    };
}