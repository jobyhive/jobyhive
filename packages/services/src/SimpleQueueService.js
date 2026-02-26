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
import { SQSClient, SendMessageCommand, ReceiveMessageCommand, DeleteMessageCommand, GetQueueAttributesCommand, PurgeQueueCommand, ChangeMessageVisibilityCommand, } from '@aws-sdk/client-sqs';
import { config } from '@repo/system-config';
import { Service } from './Service.js';
// ─── Service ─────────────────────────────────────────────────────────────────
export class SimpleQueueService extends Service {
    // ── Singleton ────────────────────────────────────────────────────────────
    static _instance = null;
    static getInstance() {
        if (!SimpleQueueService._instance) {
            SimpleQueueService._instance = new SimpleQueueService();
        }
        return SimpleQueueService._instance;
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
        this._client = new SQSClient({
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
            throw new Error('[SimpleQueueService] Not connected. Call connect() first.');
        }
        return this._client;
    }
    resolveQueueUrl(override) {
        const url = override ?? config.SQS_QUEUE_URL;
        if (!url) {
            throw new Error('[SimpleQueueService] No queue URL. Set SQS_QUEUE_URL or pass `queueUrl` in options.');
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
    async sendMessage(options) {
        const queueUrl = this.resolveQueueUrl(options.queueUrl);
        const messageAttributes = options.attributes
            ? Object.fromEntries(Object.entries(options.attributes).map(([k, v]) => [
                k,
                { DataType: 'String', StringValue: v },
            ]))
            : undefined;
        return this.client.send(new SendMessageCommand({
            QueueUrl: queueUrl,
            MessageBody: options.body,
            DelaySeconds: options.delaySeconds,
            MessageGroupId: options.messageGroupId,
            MessageDeduplicationId: options.messageDeduplicationId,
            MessageAttributes: messageAttributes,
        }));
    }
    /**
     * Poll the queue for up to `maxMessages` messages.
     * Returns an empty array when the queue is empty.
     */
    async receiveMessages(options = {}) {
        const queueUrl = this.resolveQueueUrl(options.queueUrl);
        const response = await this.client.send(new ReceiveMessageCommand({
            QueueUrl: queueUrl,
            MaxNumberOfMessages: options.maxMessages ?? 1,
            VisibilityTimeout: options.visibilityTimeout ?? 30,
            WaitTimeSeconds: options.waitTimeSeconds ?? 0,
            AttributeNames: ['All'],
            MessageAttributeNames: ['All'],
        }));
        return response.Messages ?? [];
    }
    /**
     * Delete a message once it has been successfully processed.
     * @param receiptHandle  The `ReceiptHandle` from `receiveMessages()`.
     */
    async deleteMessage(receiptHandle, queueUrl) {
        return this.client.send(new DeleteMessageCommand({
            QueueUrl: this.resolveQueueUrl(queueUrl),
            ReceiptHandle: receiptHandle,
        }));
    }
    /**
     * Extend (or reduce) the visibility timeout of an in-flight message.
     * @param receiptHandle  The `ReceiptHandle` from `receiveMessages()`.
     * @param timeoutSeconds New visibility timeout in seconds (0–43200).
     */
    async changeVisibility(receiptHandle, timeoutSeconds, queueUrl) {
        await this.client.send(new ChangeMessageVisibilityCommand({
            QueueUrl: this.resolveQueueUrl(queueUrl),
            ReceiptHandle: receiptHandle,
            VisibilityTimeout: timeoutSeconds,
        }));
    }
    /**
     * Fetch queue attributes (e.g. approximate message count).
     * @param attributes  Attribute names to fetch. Defaults to all.
     */
    async getAttributes(attributes = ['All'], queueUrl) {
        const response = await this.client.send(new GetQueueAttributesCommand({
            QueueUrl: this.resolveQueueUrl(queueUrl),
            AttributeNames: attributes,
        }));
        return response.Attributes ?? {};
    }
    /**
     * Purge all messages from the queue (use with caution!).
     */
    async purge(queueUrl) {
        await this.client.send(new PurgeQueueCommand({ QueueUrl: this.resolveQueueUrl(queueUrl) }));
    }
}
/** Convenience singleton accessor */
export const simpleQueueService = SimpleQueueService.getInstance();
