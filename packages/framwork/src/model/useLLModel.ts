import { bedrockService, type InvokeOptions, type InvokeResult } from "@repo/services";

/**
 * useLLModel (Server-side optimized)
 *
 * Provides an interface for LLM operations (AWS Bedrock backed)
 * usable in server-side environments.
 *
 * `connect()` is called automatically before every operation — the updated
 * BedrockService always recreates the client on connect(), ensuring Lambda
 * never reuses stale STS credentials across warm invocations.
 *
 * @param defaultModelId Optional default model ID to use for all requests.
 */
export function useLLModel(defaultModelId?: string): {
  connect: () => Promise<void>;
  ask: (
    prompt: string,
    historyOrSystemPrompt?: any[] | string,
    systemPrompt?: string,
    modelId?: string,
    document?: InvokeOptions['document'],
  ) => Promise<string>;
  invoke: (options: InvokeOptions) => Promise<InvokeResult>;
  invokeStream: (options: InvokeOptions) => AsyncGenerator<string, void, unknown>;
} {
  const ensureConnected = async (): Promise<void> => {
    await bedrockService.connect();
  };

  return {
    connect: ensureConnected,

    ask: async (
      prompt: string,
      historyOrSystemPrompt?: any[] | string,
      systemPrompt?: string,
      modelId?: string,
      document?: InvokeOptions['document'],
    ): Promise<string> => {
      let actualHistory: any[] = [];
      let actualSystemPrompt = systemPrompt;

      if (typeof historyOrSystemPrompt === 'string') {
        actualSystemPrompt = historyOrSystemPrompt;
      } else if (Array.isArray(historyOrSystemPrompt)) {
        actualHistory = historyOrSystemPrompt;
      }

      await ensureConnected();
      return bedrockService.ask(
        prompt,
        modelId ?? defaultModelId,
        actualSystemPrompt,
        actualHistory,
        document,
      );
    },

    invoke: async (options: InvokeOptions): Promise<InvokeResult> => {
      await ensureConnected();
      return bedrockService.invoke({
        ...options,
        modelId: options.modelId ?? defaultModelId,
      });
    },

    invokeStream: async function* (
      options: InvokeOptions,
    ): AsyncGenerator<string, void, unknown> {
      await ensureConnected();
      yield* bedrockService.invokeStream({
        ...options,
        modelId: options.modelId ?? defaultModelId,
      });
    },
  };
}