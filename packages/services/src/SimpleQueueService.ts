/**
 * SimpleQueueService (SQS)
 *
 * Singleton wrapper around `@aws-sdk/client-sqs`.
 *
 * Connection is created once; subsequent calls to `getInstance()` return the
 * same object.
 *
 * Config is sourced exclusively from `@repo/system-config`.
 */

import {
    SQSClient,
    SendMessageCommand,
    type SendMessageCommandOutput,
    ReceiveMessageCommand,
    type Message,
    DeleteMessageCommand,
    type DeleteMessageCommandOutput,
    GetQueueAttributesCommand,
    type QueueAttributeName,
    PurgeQueueCommand,
    ChangeMessageVisibilityCommand,
} from '@aws-sdk/client-sqs';
import { config } from '@repo/system-config';
import { Service } from './Service.js';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface SendMessageOptions {
    /** Message body (string — JSON-serialise objects before passing). */
    body: string;
    /** Override the queue URL from `SQS_QUEUE_URL`. */
    queueUrl?: string;
    /** Delay delivery by up to 900 seconds. */
    delaySeconds?: number;
    /** Optional message group ID (FIFO queues). */
    messageGroupId?: string;
    /** Optional deduplication ID (FIFO queues). */
    messageDeduplicationId?: string;
    /** String key/value attributes attached to the message. */
    attributes?: Record<string, string>;
}

export interface ReceiveMessagesOptions {
    /** Number of messages to retrieve (1–10, default 1). */
    maxMessages?: number;
    /** Visibility timeout in seconds (default 30). */
    visibilityTimeout?: number;
    /** Wait-time for long polling in seconds (default 0 = short poll). */
    waitTimeSeconds?: number;
    /** Override the queue URL from `SQS_QUEUE_URL`. */
    queueUrl?: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────

export class SimpleQueueService extends Service {
    // ── Singleton ────────────────────────────────────────────────────────────
    private static _instance: SimpleQueueService | null = null;

    static getInstance(): SimpleQueueService {
        if (!SimpleQueueService._instance) {
            SimpleQueueService._instance = new SimpleQueueService();
        }
        return SimpleQueueService._instance;
    }

    // ── Internal client ──────────────────────────────────────────────────────
    private _client: SQSClient | null = null;

    private constructor() {
        super();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Lifecycle
    // ─────────────────────────────────────────────────────────────────────────

    async connect(): Promise<void> {
        if (this._connected) return;

        const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = config;

        this._client = new SQSClient({
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

    private get client(): SQSClient {
        if (!this._client) {
            throw new Error(
                '[SimpleQueueService] Not connected. Call connect() first.',
            );
        }
        return this._client;
    }

    private resolveQueueUrl(override?: string): string {
        const url = override ?? config.SQS_QUEUE_URL;
        if (!url) {
            throw new Error(
                '[SimpleQueueService] No queue URL. Set SQS_QUEUE_URL or pass `queueUrl` in options.',
            );
        }
        return url;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // API surface
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Send a single message to the queue.
     *
     * @example
     * await sqs.sendMessage({ body: JSON.stringify({ type: 'JOB_MATCH', payload }) });
     */
    async sendMessage(options: SendMessageOptions): Promise<SendMessageCommandOutput> {
        const queueUrl = this.resolveQueueUrl(options.queueUrl);

        const messageAttributes = options.attributes
            ? Object.fromEntries(
                Object.entries(options.attributes).map(([k, v]) => [
                    k,
                    { DataType: 'String', StringValue: v },
                ]),
            )
            : undefined;

        return this.client.send(
            new SendMessageCommand({
                QueueUrl: queueUrl,
                MessageBody: options.body,
                DelaySeconds: options.delaySeconds,
                MessageGroupId: options.messageGroupId,
                MessageDeduplicationId: options.messageDeduplicationId,
                MessageAttributes: messageAttributes,
            }),
        );
    }

    /**
     * Poll the queue for up to `maxMessages` messages.
     * Returns an empty array when the queue is empty.
     */
    async receiveMessages(
        options: ReceiveMessagesOptions = {},
    ): Promise<Message[]> {
        const queueUrl = this.resolveQueueUrl(options.queueUrl);

        const response = await this.client.send(
            new ReceiveMessageCommand({
                QueueUrl: queueUrl,
                MaxNumberOfMessages: options.maxMessages ?? 1,
                VisibilityTimeout: options.visibilityTimeout ?? 30,
                WaitTimeSeconds: options.waitTimeSeconds ?? 0,
                AttributeNames: ['All'],
                MessageAttributeNames: ['All'],
            }),
        );

        return response.Messages ?? [];
    }

    /**
     * Delete a message once it has been successfully processed.
     * @param receiptHandle  The `ReceiptHandle` from `receiveMessages()`.
     */
    async deleteMessage(
        receiptHandle: string,
        queueUrl?: string,
    ): Promise<DeleteMessageCommandOutput> {
        return this.client.send(
            new DeleteMessageCommand({
                QueueUrl: this.resolveQueueUrl(queueUrl),
                ReceiptHandle: receiptHandle,
            }),
        );
    }

    /**
     * Extend (or reduce) the visibility timeout of an in-flight message.
     * @param receiptHandle  The `ReceiptHandle` from `receiveMessages()`.
     * @param timeoutSeconds New visibility timeout in seconds (0–43200).
     */
    async changeVisibility(
        receiptHandle: string,
        timeoutSeconds: number,
        queueUrl?: string,
    ): Promise<void> {
        await this.client.send(
            new ChangeMessageVisibilityCommand({
                QueueUrl: this.resolveQueueUrl(queueUrl),
                ReceiptHandle: receiptHandle,
                VisibilityTimeout: timeoutSeconds,
            }),
        );
    }

    /**
     * Fetch queue attributes (e.g. approximate message count).
     * @param attributes  Attribute names to fetch. Defaults to all.
     */
    async getAttributes(
        attributes: QueueAttributeName[] = ['All'],
        queueUrl?: string,
    ): Promise<Record<string, string>> {
        const response = await this.client.send(
            new GetQueueAttributesCommand({
                QueueUrl: this.resolveQueueUrl(queueUrl),
                AttributeNames: attributes,
            }),
        );
        return response.Attributes ?? {};
    }

    /**
     * Purge all messages from the queue (use with caution!).
     */
    async purge(queueUrl?: string): Promise<void> {
        await this.client.send(
            new PurgeQueueCommand({ QueueUrl: this.resolveQueueUrl(queueUrl) }),
        );
    }
}

/** Convenience singleton accessor */
export const simpleQueueService = SimpleQueueService.getInstance();