/**
 * SimpleEmailService (SES)
 *
 * Singleton wrapper around `@aws-sdk/client-ses`.
 *
 * Connection is created once; subsequent calls to `getInstance()` return the
 * same object.
 *
 * Config is sourced exclusively from `@repo/system-config`.
 */
import { SESClient, SendEmailCommand, SendRawEmailCommand, } from '@aws-sdk/client-ses';
import { config } from '@repo/system-config';
import { Service } from './Service.js';
// ─── Service ─────────────────────────────────────────────────────────────────
export class SimpleEmailService extends Service {
    // ── Singleton ────────────────────────────────────────────────────────────
    static _instance = null;
    static getInstance() {
        if (!SimpleEmailService._instance) {
            SimpleEmailService._instance = new SimpleEmailService();
        }
        return SimpleEmailService._instance;
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
        this._client = new SESClient({
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
            throw new Error('[SimpleEmailService] Not connected. Call connect() first.');
        }
        return this._client;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // API surface
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Send a plain-text and/or HTML email.
     *
     * @example
     * await ses.sendEmail({
     *   to: 'user@example.com',
     *   subject: 'Hello from Joby!',
     *   text: 'Plain text body',
     *   html: '<h1>HTML body</h1>',
     * });
     */
    async sendEmail(options) {
        const sender = options.from ?? config.SES_FROM_EMAIL;
        if (!sender) {
            throw new Error('[SimpleEmailService] No sender address. Set SES_FROM_EMAIL or pass `from` in options.');
        }
        const toAddresses = Array.isArray(options.to) ? options.to : [options.to];
        const body = {};
        if (options.text) {
            body.Text = { Charset: 'UTF-8', Data: options.text };
        }
        if (options.html) {
            body.Html = { Charset: 'UTF-8', Data: options.html };
        }
        if (!body.Text && !body.Html) {
            throw new Error('[SimpleEmailService] At least one of `text` or `html` must be provided.');
        }
        const input = {
            Source: sender,
            Destination: {
                ToAddresses: toAddresses,
                CcAddresses: options.cc,
                BccAddresses: options.bcc,
            },
            Message: {
                Subject: { Charset: 'UTF-8', Data: options.subject },
                Body: body,
            },
            ReplyToAddresses: options.replyTo,
        };
        return this.client.send(new SendEmailCommand(input));
    }
    /**
     * Send a raw MIME email (e.g. with attachments).
     * @param rawMessage  Complete MIME message as a Uint8Array or string.
     */
    async sendRawEmail(rawMessage) {
        const data = typeof rawMessage === 'string'
            ? new TextEncoder().encode(rawMessage)
            : rawMessage;
        await this.client.send(new SendRawEmailCommand({ RawMessage: { Data: data } }));
    }
}
/** Convenience singleton accessor */
export const simpleEmailService = SimpleEmailService.getInstance();
