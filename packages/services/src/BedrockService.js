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
import { BedrockRuntimeClient, ConverseCommand, ConverseStreamCommand, } from '@aws-sdk/client-bedrock-runtime';
import { config } from '@repo/system-config';
import { Service } from './Service.js';
// ─── Service ─────────────────────────────────────────────────────────────────
export class BedrockService extends Service {
    // ── Singleton ────────────────────────────────────────────────────────────
    static _instance = null;
    static getInstance() {
        if (!BedrockService._instance) {
            BedrockService._instance = new BedrockService();
        }
        return BedrockService._instance;
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
    async disconnect() {
        if (!this._connected || !this._client)
            return;
        this._client.destroy();
        this._connected = false;
        this._client = null;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // Client accessor
    // ─────────────────────────────────────────────────────────────────────────
    get client() {
        if (!this._client) {
            throw new Error('[BedrockService] Not connected. Call connect() first.');
        }
        return this._client;
    }
    resolveModelId(override) {
        return override ?? config.BEDROCK_MODEL_ID;
    }
    cleanHistory(history) {
        if (history.length === 0)
            return [];
        let cleaned = [];
        let expectedRole = 'user';
        for (const msg of history) {
            if (msg.role === expectedRole) {
                cleaned.push(msg);
                expectedRole = expectedRole === 'user' ? 'assistant' : 'user';
            }
            else if (msg.role === 'user' && expectedRole === 'assistant') {
                // Two user messages in a row? Merge them or skip. 
                // For simplicity, let's keep the latest one and wait for an assistant role.
                cleaned[cleaned.length - 1] = msg;
            }
        }
        // Must start with user. If not, slice until first user.
        const firstUserIndex = cleaned.findIndex(m => m.role === 'user');
        if (firstUserIndex === -1)
            return [];
        return cleaned.slice(firstUserIndex);
    }
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
    async invoke(options) {
        const modelId = this.resolveModelId(options.modelId);
        const userContent = [{ text: options.prompt }];
        if (options.document) {
            userContent.push({ document: options.document });
        }
        // Build message list: optional history + new user turn
        const messages = [
            ...this.cleanHistory(options.history ?? []),
            {
                role: 'user',
                content: userContent,
            },
        ];
        const response = await this.client.send(new ConverseCommand({
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
        }));
        const content = response.output?.message?.content ?? [];
        const text = content
            .filter((b) => 'text' in b)
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
    async *invokeStream(options) {
        const modelId = this.resolveModelId(options.modelId);
        const userContent = [{ text: options.prompt }];
        if (options.document) {
            userContent.push({ document: options.document });
        }
        const messages = [
            ...this.cleanHistory(options.history ?? []),
            {
                role: 'user',
                content: userContent,
            },
        ];
        const response = await this.client.send(new ConverseStreamCommand({
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
        }));
        if (!response.stream)
            return;
        for await (const event of response.stream) {
            const chunk = event.contentBlockDelta;
            const text = chunk?.delta?.text;
            if (text)
                yield text;
        }
    }
    /**
     * Convenience wrapper: invoke Nova and return only the text response.
     */
    async ask(prompt, modelId, systemPrompt, history, document) {
        const result = await this.invoke({ prompt, modelId, systemPrompt, history, document });
        return result.text;
    }
}
/** Convenience singleton accessor */
export const bedrockService = BedrockService.getInstance();
