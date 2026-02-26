import { elasticSearchService } from "@repo/services";
/**
 * useLongMemory (Server-side optimized)
 *
 * Provides an interface for long-term memory (ElasticSearch backed)
 * usable in server-side environments.
 */
export function useLongMemory() {
    const ensureConnected = async () => {
        await elasticSearchService.connect();
    };
    return {
        connect: ensureConnected,
        search: async (index, query, options) => {
            await ensureConnected();
            return await elasticSearchService.search(index, query, options);
        },
        get: async (index, id) => {
            await ensureConnected();
            return await elasticSearchService.get(index, id);
        },
        index: async (indexName, id, body) => {
            await ensureConnected();
            return await elasticSearchService.index(indexName, id, body);
        },
        exists: async (indexName, id) => {
            await ensureConnected();
            return await elasticSearchService.exists(indexName, id);
        },
        remove: async (indexName, id) => {
            await ensureConnected();
            return await elasticSearchService.delete(indexName, id);
        },
        service: elasticSearchService
    };
}
