/**
 * useLongMemory (Server-side optimized)
 *
 * Provides an interface for long-term memory (ElasticSearch backed)
 * usable in server-side environments.
 */
export declare function useLongMemory(): {
    connect: () => Promise<void>;
    search: (index: string, query: any, options?: {
        size?: number;
        from?: number;
    }) => Promise<any>;
    get: <T = any>(index: string, id: string) => Promise<T | null>;
    index: (indexName: string, id: string, body: any) => Promise<any>;
    exists: (indexName: string, id: string) => Promise<boolean>;
    remove: (indexName: string, id: string) => Promise<any>;
    service: any;
};
//# sourceMappingURL=useLongMemory.d.ts.map