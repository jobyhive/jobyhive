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
import { type SendEmailCommandOutput } from '@aws-sdk/client-ses';
import { Service } from './Service.js';
export interface SendEmailOptions {
    /** Recipient email address(es). */
    to: string | string[];
    /** Email subject line. */
    subject: string;
    /** Plain-text body (at least one of `text` / `html` is required). */
    text?: string;
    /** HTML body. */
    html?: string;
    /** Override the configured `SES_FROM_EMAIL` for this message. */
    from?: string;
    /** Reply-to addresses. */
    replyTo?: string[];
    /** CC addresses. */
    cc?: string[];
    /** BCC addresses. */
    bcc?: string[];
}
export declare class SimpleEmailService extends Service {
    private static _instance;
    static getInstance(): SimpleEmailService;
    private _client;
    private constructor();
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    private get client();
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
    sendEmail(options: SendEmailOptions): Promise<SendEmailCommandOutput>;
    /**
     * Send a raw MIME email (e.g. with attachments).
     * @param rawMessage  Complete MIME message as a Uint8Array or string.
     */
    sendRawEmail(rawMessage: Uint8Array | string): Promise<void>;
}
/** Convenience singleton accessor */
export declare const simpleEmailService: SimpleEmailService;
//# sourceMappingURL=SimpleEmailService.d.ts.map