export type NODE_ENV_TYPES = 'development' | 'production' | 'test';
export interface SystemConfig {
    PORT: number;
    ENGINE_PORT: number;
    NODE_ENV: NODE_ENV_TYPES;
    TELEGRAM_BOT_ACCESS_TOKEN: string;
    TELEGRAM_BOT_API: string;
    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
    AWS_REGION: string;
    ELASTICSEARCH_URL: string;
    ELASTICSEARCH_API_KEY: string;
    REDIS_URL: string;
    SES_FROM_EMAIL: string;
    SQS_QUEUE_URL: string;
    BEDROCK_MODEL_ID: string;
}
//# sourceMappingURL=system.d.ts.map