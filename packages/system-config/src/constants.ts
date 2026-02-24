import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { SystemConfig } from "@repo/types";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Resolve the monorepo root .env from the current file's location.
// This ensures the .env is found regardless of where the process is started.
// ---------------------------------------------------------------------------
const rootEnvPath = path.resolve(__dirname, '..', '..', '..', '.env');

dotenv.config({ path: rootEnvPath });

// ---------------------------------------------------------------------------
// Runtime validation helpers
// ---------------------------------------------------------------------------

/**
 * Required variables that MUST be set before the process starts in production.
 * Missing values here will throw at import time (fail-fast).
 */
const REQUIRED_IN_PRODUCTION: (keyof SystemConfig)[] = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AMAZON_PARTNER_TAG',
];

function validateEnv(cfg: SystemConfig): void {
    if (cfg.NODE_ENV !== 'production') return;

    const missing = REQUIRED_IN_PRODUCTION.filter((key) => {
        const value = cfg[key];
        return typeof value === 'string' && value.trim() === '';
    });

    if (missing.length > 0) {
        throw new Error(
            `[system-config] Missing required environment variables in production:\n  ${missing.join(', ')}\n` +
            `Make sure your root .env or deployment environment defines them.`,
        );
    }
}

// ---------------------------------------------------------------------------
// Config object
// ---------------------------------------------------------------------------

const NODE_ENV_VALUE = process.env['NODE_ENV'] ?? 'development';
const validNodeEnvValues = ['development', 'production', 'test'] as const;
type NodeEnvValue = (typeof validNodeEnvValues)[number];

function parseNodeEnv(value: string): NodeEnvValue {
    if ((validNodeEnvValues as readonly string[]).includes(value)) {
        return value as NodeEnvValue;
    }
    return 'development';
}

const TELEGRAM_BOT_ACCESS_TOKEN = process.env['TELEGRAM_BOT_ACCESS_TOKEN'] ?? '8355213023:AAEH52qJBmrJRcBHL9F7vOjXwnuLib4Dyog';
export const systemConfig: SystemConfig = {
    PORT: parseInt(process.env['PORT'] ?? '4000', 10),
    NODE_ENV: parseNodeEnv(NODE_ENV_VALUE),
    ENGINE_PORT: parseInt(process.env['ENGINE_PORT'] ?? '4000', 10),

    TELEGRAM_BOT_ACCESS_TOKEN,
    TELEGRAM_BOT_API: `https://api.telegram.org/bot${TELEGRAM_BOT_ACCESS_TOKEN}`,
    // ── AWS credentials ───────────────────────────────────────────────────────
    AWS_ACCESS_KEY_ID: process.env['AWS_ACCESS_KEY_ID'] ?? '',
    AWS_SECRET_ACCESS_KEY: process.env['AWS_SECRET_ACCESS_KEY'] ?? '',
    AWS_REGION: process.env['AWS_REGION'] ?? 'us-east-1',

    // ── Amazon Associates / PA API ────────────────────────────────────────────
    AMAZON_PARTNER_TAG: process.env['AMAZON_PARTNER_TAG'] ?? '',
    AMAZON_HOST: process.env['AMAZON_HOST'] ?? 'webservices.amazon.com',
    AMAZON_MARKETPLACE: process.env['AMAZON_MARKETPLACE'] ?? 'www.amazon.com',

    // ── Elasticsearch ─────────────────────────────────────────────────────────
    ELASTICSEARCH_URL: process.env['ELASTICSEARCH_URL'] ?? '',
    ELASTICSEARCH_API_KEY: process.env['ELASTICSEARCH_API_KEY'] ?? '',

    // ── Redis / ElasticCache ──────────────────────────────────────────────────
    REDIS_URL: process.env['REDIS_URL'] ?? 'redis://localhost:6379',

    // ── SES ───────────────────────────────────────────────────────────────────
    SES_FROM_EMAIL: process.env['SES_FROM_EMAIL'] ?? '',

    // ── SQS ───────────────────────────────────────────────────────────────────
    SQS_QUEUE_URL: process.env['SQS_QUEUE_URL'] ?? '',

    // ── Bedrock ───────────────────────────────────────────────────────────────
    BEDROCK_MODEL_ID: process.env['BEDROCK_MODEL_ID'] ?? 'amazon.nova-lite-v1:0',
};

validateEnv(systemConfig);

// Re-export as `config` to match original usage pattern:
//   import { config } from '@repo/system-config';
export { systemConfig as config };
