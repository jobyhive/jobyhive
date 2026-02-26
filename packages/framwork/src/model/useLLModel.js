import { bedrockService } from "@repo/services";
/**
 * useLLModel (Server-side optimized)
 *
 * Provides an interface for LLM operations (AWS Bedrock backed)
 * usable in server-side environments.
 * Handles connection automatically on the first call.
 *
 * @param defaultModelId Optional default model ID to use for all requests.
 */
export function useLLModel(defaultModelId) {
    const ensureConnected = async () => {
        await bedrockService.connect();
    };
    return {
        connect: ensureConnected,
        ask: async (prompt, historyOrSystemPrompt, systemPrompt, modelId, document) => {
            let actualHistory = [];
            let actualSystemPrompt = systemPrompt;
            if (typeof historyOrSystemPrompt === 'string') {
                actualSystemPrompt = historyOrSystemPrompt;
            }
            else if (Array.isArray(historyOrSystemPrompt)) {
                actualHistory = historyOrSystemPrompt;
            }
            await ensureConnected();
            return await bedrockService.ask(prompt, modelId ?? defaultModelId, actualSystemPrompt, actualHistory, document);
        },
        invoke: async (options) => {
            await ensureConnected();
            return await bedrockService.invoke({
                ...options,
                modelId: options.modelId ?? defaultModelId
            });
        },
        invokeStream: async function* (options) {
            await ensureConnected();
            yield* bedrockService.invokeStream({
                ...options,
                modelId: options.modelId ?? defaultModelId
            });
        },
        service: bedrockService
    };
}
