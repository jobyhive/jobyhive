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
    const { AWS_REGION } = config;

    // Always destroy and recreate the client to avoid holding onto stale
    // STS credentials from a previous Lambda invocation. Lambda rotates
    // temporary credentials every 15–60 min; a cached client won't pick
    // up the new token, causing "security token is invalid" errors.
    if (this._client) {
      this._client.destroy();
      this._client = null;
      this._connected = false;
    }

    this._client = new BedrockRuntimeClient({
      region: AWS_REGION,
      // Credentials are resolved automatically from the Lambda execution role.
      // Do NOT pass accessKeyId/secretAccessKey here — Lambda injects
      // temporary STS credentials that also require a session token.
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

  /**
   * Executes a client command with automatic re-initialization on authentication errors.
   * This addresses the "security token is invalid" issue in warm Lambda instances
   * where STS credentials have expired mid-invocation.
   */
  private async sendWithRetry<T>(command: any): Promise<T> {
    try {
      return await this.client.send(command) as T;
    } catch (error: any) {
      const isAuthError =
        error.name === 'UnrecognizedClientException' ||
        error.name === 'ExpiredTokenException' ||
        error.message?.includes('security token') ||
        error.message?.includes('ExpiredToken');

      if (isAuthError) {
        console.warn(
          '[BedrockService] Detected authentication error — recreating client with fresh credentials.',
          error.message,
        );

        // Recreate the client cleanly; the SDK will fetch a fresh
        // STS token from the Lambda execution role automatically.
        await this.connect();

        return await this.client.send(command) as T;
      }

      throw error;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────────

  private resolveModelId(override?: string): string {
    return override ?? config.BEDROCK_MODEL_ID;
  }

  private cleanHistory(history: Message[]): Message[] {
    if (history.length === 0) return [];

    let cleaned: Message[] = [];
    let expectedRole: 'user' | 'assistant' = 'user';

    for (const msg of history) {
      if (msg.role === expectedRole) {
        cleaned.push(msg);
        expectedRole = expectedRole === 'user' ? 'assistant' : 'user';
      } else if (msg.role === 'user' && expectedRole === 'assistant') {
        // Two user messages in a row — keep the latest one.
        cleaned[cleaned.length - 1] = msg;
      }
    }

    // History must start with a user turn.
    const firstUserIndex = cleaned.findIndex(m => m.role === 'user');
    if (firstUserIndex === -1) return [];
    return cleaned.slice(firstUserIndex);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Public API
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

    const userContent: ContentBlock[] = [{ text: options.prompt }];
    if (options.document) {
      userContent.push({ document: options.document });
    }

    const messages: Message[] = [
      ...this.cleanHistory(options.history ?? []),
      {
        role: 'user',
        content: userContent,
      },
    ];

    const response = await this.sendWithRetry<ConverseResponse>(
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

    const userContent: ContentBlock[] = [{ text: options.prompt }];
    if (options.document) {
      userContent.push({ document: options.document });
    }

    const messages: Message[] = [
      ...this.cleanHistory(options.history ?? []),
      {
        role: 'user',
        content: userContent,
      },
    ];

    const response = await this.sendWithRetry<any>(
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
  async ask(
    prompt: string,
    modelId?: string,
    systemPrompt?: string,
    history?: Message[],
    document?: InvokeOptions['document'],
  ): Promise<string> {
    const result = await this.invoke({ prompt, modelId, systemPrompt, history, document });
    return result.text;
  }
}

/** Convenience singleton accessor */
export const bedrockService = BedrockService.getInstance();