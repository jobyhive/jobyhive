import { type InvokeOptions, type InvokeResult } from "@repo/services";
/**
 * useLLModel (Server-side optimized)
 *
 * Provides an interface for LLM operations (AWS Bedrock backed)
 * usable in server-side environments.
 * Handles connection automatically on the first call.
 *
 * @param defaultModelId Optional default model ID to use for all requests.
 */
export declare function useLLModel(defaultModelId?: string): {
    connect: () => Promise<void>;
    ask: (prompt: string, historyOrSystemPrompt?: any[] | string, systemPrompt?: string, modelId?: string, document?: InvokeOptions['document']) => Promise<string>;
    invoke: (options: InvokeOptions) => Promise<InvokeResult>;
    invokeStream: (options: InvokeOptions) => AsyncGenerator<string>;
    service: any;
};
//# sourceMappingURL=useLLModel.d.ts.map