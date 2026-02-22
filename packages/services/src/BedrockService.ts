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

import {
    BedrockRuntimeClient,
    ConverseCommand,
    ConverseStreamCommand,
    type Message,
    type ContentBlock,
    type ConverseResponse,
    type ConverseStreamOutput,
} from '@aws-sdk/client-bedrock-runtime';
import { config } from '@repo/system-config';
import { Service } from './Service.js';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface InvokeOptions {
    /** Prompt / user message. */
    prompt: string;
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

// ─── Service ─────────────────────────────────────────────────────────────────

export class BedrockService extends Service {
    // ── Singleton ────────────────────────────────────────────────────────────
    private static _instance: BedrockService | null = null;

    static getInstance(): BedrockService {
        if (!BedrockService._instance) {
            BedrockService._instance = new BedrockService();
        }
        return BedrockService._instance;
    }

    // ── Internal client ──────────────────────────────────────────────────────
    private _client: BedrockRuntimeClient | null = null;

    private constructor() {
        super();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Lifecycle
    // ─────────────────────────────────────────────────────────────────────────

    async connect(): Promise<void> {
        if (this._connected) return;

        const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = config;

        this._client = new BedrockRuntimeClient({
            region: AWS_REGION,
            credentials: {
                accessKeyId: AWS_ACCESS_KEY_ID,
                secretAccessKey: AWS_SECRET_ACCESS_KEY,
            },
        });

        this._connected = true;
    }

    async disconnect(): Promise<void> {
        if (!this._connected || !this._client) return;
        this._client.destroy();
        this._connected = false;
        this._client = null;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Client accessor
    // ─────────────────────────────────────────────────────────────────────────

    private get client(): BedrockRuntimeClient {
        if (!this._client) {
            throw new Error(
                '[BedrockService] Not connected. Call connect() first.',
            );
        }
        return this._client;
    }

    private resolveModelId(override?: string): string {
        return override ?? config.BEDROCK_MODEL_ID;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // API surface
    // ─────────────────────────────────────────────────────────────────────────

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
    async invoke(options: InvokeOptions): Promise<InvokeResult> {
        const modelId = this.resolveModelId(options.modelId);

        // Build message list: optional history + new user turn
        const messages: Message[] = [
            ...(options.history ?? []),
            {
                role: 'user',
                content: [{ text: options.prompt }],
            },
        ];

        const response = await this.client.send(
            new ConverseCommand({
                modelId,
                messages,
                system: options.systemPrompt
                    ? [{ text: options.systemPrompt }]
                    : undefined,
                inferenceConfig: {
                    maxTokens: options.inferenceConfig?.maxTokens ?? 2048,
                    temperature: options.inferenceConfig?.temperature ?? 0.7,
                    topP: options.inferenceConfig?.topP ?? 0.9,
                },
            }),
        );

        const content = response.output?.message?.content ?? [];
        const text = content
            .filter((b): b is ContentBlock.TextMember => 'text' in b)
            .map((b) => b.text)
            .join('');

        return { text, content, raw: response };
    }

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
    async *invokeStream(
        options: InvokeOptions,
    ): AsyncGenerator<string, void, unknown> {
        const modelId = this.resolveModelId(options.modelId);

        const messages: Message[] = [
            ...(options.history ?? []),
            {
                role: 'user',
                content: [{ text: options.prompt }],
            },
        ];

        const response = await this.client.send(
            new ConverseStreamCommand({
                modelId,
                messages,
                system: options.systemPrompt
                    ? [{ text: options.systemPrompt }]
                    : undefined,
                inferenceConfig: {
                    maxTokens: options.inferenceConfig?.maxTokens ?? 2048,
                    temperature: options.inferenceConfig?.temperature ?? 0.7,
                    topP: options.inferenceConfig?.topP ?? 0.9,
                },
            }),
        );

        if (!response.stream) return;

        for await (const event of response.stream) {
            const chunk = (event as ConverseStreamOutput).contentBlockDelta;
            const text = chunk?.delta?.text;
            if (text) yield text;
        }
    }

    /**
     * Convenience wrapper: invoke Nova and return only the text response.
     */
    async ask(prompt: string, systemPrompt?: string): Promise<string> {
        const result = await this.invoke({ prompt, systemPrompt });
        return result.text;
    }
}

/** Convenience singleton accessor */
export const bedrockService = BedrockService.getInstance();
