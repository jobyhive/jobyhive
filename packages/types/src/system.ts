export type NODE_ENV_TYPES = 'development' | 'production' | 'test';

export interface SystemConfig {
    PORT: number;
    ENGINE_PORT: number;
    NODE_ENV: NODE_ENV_TYPES;

    TELEGRAM_BOT_ACCESS_TOKEN: string;
    TELEGRAM_BOT_API: string;

    // ── AWS credentials (shared across all AWS services) ────────────────────
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
    AWS_REGION: string;

    // ── Elasticsearch (Elastic Cloud or self-hosted) ──────────────────────────
    ELASTICSEARCH_URL: string;
    ELASTICSEARCH_API_KEY: string;

    // ── ElasticCache / Redis ──────────────────────────────────────────────────
    REDIS_URL: string;

    // ── Amazon Simple Email Service (SES) ────────────────────────────────────
    SES_FROM_EMAIL: string;

    // ── Amazon Simple Queue Service (SQS) ────────────────────────────────────
    SQS_QUEUE_URL: string;

    // ── Amazon Bedrock ────────────────────────────────────────────────────────
    BEDROCK_MODEL_ID: string;
}
