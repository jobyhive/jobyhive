/**
 * BedrockService
 *
 * Singleton wrapper around `@aws-sdk/client-bedrock-runtime`.
 * Uses Amazon Nova (default: `amazon.nova-lite-v1:0`) via the Converse /
 * ConverseStream APIs.
 *
 * Connection is created once; subsequent calls to `getInstance()` return the
 * same object.
 *
 * Config is sourced exclusively from `@repo/system-config`.
 */
import { type Message, type ContentBlock, type ConverseResponse } from '@aws-sdk/client-bedrock-runtime';
import { Service } from './Service.js';
export interface InvokeOptions {
    /** Prompt / user message. */
    prompt: string;
    /** Optional document to include in the request. */
    document?: {
        format: 'pdf' | 'csv' | 'docx' | 'html' | 'md' | 'txt' | 'xls' | 'xlsx';
        name: string;
        source: {
            bytes: Uint8Array;
        };
    };
    /** Prior conversation turns to include (for multi-turn dialogue). */
    history?: Message[];
    /** System prompt override. */
    systemPrompt?: string;
    /** Override the model ID from `BEDROCK_MODEL_ID`. */
    modelId?: string;
    /** Inference config overrides. */
    inferenceConfig?: {
        maxTokens?: number;
        temperature?: number;
        topP?: number;
    };
}
export interface InvokeResult {
    /** The assistant's reply text. */
    text: string;
    /** All content blocks returned by the model. */
    content: ContentBlock[];
    /** Raw Converse response. */
    raw: ConverseResponse;
}
export declare class BedrockService extends Service {
    private static _instance;
    static getInstance(): BedrockService;
    private _client;
    private constructor();
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    private get client();
    private resolveModelId;
    private cleanHistory;
    /**
     * Send a prompt to Amazon Nova and receive a full (non-streaming) reply.
     *
     * @example
     * const result = await bedrock.invoke({
     *   prompt: 'Summarise this CV in 3 bullet points…',
     *   systemPrompt: 'You are a professional career advisor.',
     * });
     * console.log(result.text);
     */
    invoke(options: InvokeOptions): Promise<InvokeResult>;
    /**
     * Stream the model's reply token-by-token.
     *
     * Yields each text chunk as it arrives. Useful for real-time UI updates.
     *
     * @example
     * for await (const chunk of bedrock.invokeStream({ prompt: '...' })) {
     *   process.stdout.write(chunk);
     * }
     */
    invokeStream(options: InvokeOptions): AsyncGenerator<string, void, unknown>;
    /**
     * Convenience wrapper: invoke Nova and return only the text response.
     */
    ask(prompt: string, modelId?: string, systemPrompt?: string, history?: Message[], document?: InvokeOptions['document']): Promise<string>;
}
/** Convenience singleton accessor */
export declare const bedrockService: BedrockService;
//# sourceMappingURL=BedrockService.d.ts.map