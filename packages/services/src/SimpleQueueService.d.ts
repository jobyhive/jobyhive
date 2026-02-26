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
import { type SendMessageCommandOutput, type Message, type DeleteMessageCommandOutput, type QueueAttributeName } from '@aws-sdk/client-sqs';
import { Service } from './Service.js';
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
export declare class SimpleQueueService extends Service {
    private static _instance;
    static getInstance(): SimpleQueueService;
    private _client;
    private constructor();
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    private get client();
    private resolveQueueUrl;
    /**
     * Send a single message to the queue.
     *
     * @example
     * await sqs.sendMessage({ body: JSON.stringify({ type: 'JOB_MATCH', payload }) });
     */
    sendMessage(options: SendMessageOptions): Promise<SendMessageCommandOutput>;
    /**
     * Poll the queue for up to `maxMessages` messages.
     * Returns an empty array when the queue is empty.
     */
    receiveMessages(options?: ReceiveMessagesOptions): Promise<Message[]>;
    /**
     * Delete a message once it has been successfully processed.
     * @param receiptHandle  The `ReceiptHandle` from `receiveMessages()`.
     */
    deleteMessage(receiptHandle: string, queueUrl?: string): Promise<DeleteMessageCommandOutput>;
    /**
     * Extend (or reduce) the visibility timeout of an in-flight message.
     * @param receiptHandle  The `ReceiptHandle` from `receiveMessages()`.
     * @param timeoutSeconds New visibility timeout in seconds (0–43200).
     */
    changeVisibility(receiptHandle: string, timeoutSeconds: number, queueUrl?: string): Promise<void>;
    /**
     * Fetch queue attributes (e.g. approximate message count).
     * @param attributes  Attribute names to fetch. Defaults to all.
     */
    getAttributes(attributes?: QueueAttributeName[], queueUrl?: string): Promise<Record<string, string>>;
    /**
     * Purge all messages from the queue (use with caution!).
     */
    purge(queueUrl?: string): Promise<void>;
}
/** Convenience singleton accessor */
export declare const simpleQueueService: SimpleQueueService;
//# sourceMappingURL=SimpleQueueService.d.ts.map