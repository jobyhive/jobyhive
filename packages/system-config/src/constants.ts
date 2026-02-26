import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { SystemConfig } from "@repo/types";
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ---------------------------------------------------------------------------
// Resolve the monorepo root and load the correct .env file based on NODE_ENV.
//
// Load order (later files do NOT override earlier ones):
//   1. .env.<environment>   – environment-specific values   (highest priority)
//   2. .env                 – shared baseline / local defaults (fallback)
//
// NODE_ENV is read directly from process.env here, before the config object
// is built, so that the right file is chosen on first import.
// ---------------------------------------------------------------------------
const rootDir = path.resolve(__dirname, '..', '..', '..');
const nodeEnvRaw = process.env['NODE_ENV'] ?? 'development';
const envFile = nodeEnvRaw === 'production' ? '.env.production' : '.env.development';

// Load the environment-specific file first (highest priority).
dotenv.config({ path: path.join(rootDir, envFile) });

// Load the base .env as a fallback; override:false means it will NOT
// overwrite values that the environment-specific file already set.
dotenv.config({ path: path.join(rootDir, '.env'), override: false });

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

const NODE_ENV_VALUE = process.env['NODE_ENV'] ?? '';
const validNodeEnvValues = ['development', 'production', 'test'] as const;
type NodeEnvValue = (typeof validNodeEnvValues)[number];

function parseNodeEnv(value: string): NodeEnvValue {
    if ((validNodeEnvValues as readonly string[]).includes(value)) {
        return value as NodeEnvValue;
    }
    return 'development';
}

const TELEGRAM_BOT_ACCESS_TOKEN = process.env['TELEGRAM_BOT_ACCESS_TOKEN'] ?? '';
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

    // ── Elasticsearch ─────────────────────────────────────────────────────────
    ELASTICSEARCH_URL: process.env['ELASTICSEARCH_URL'] ?? '',
    ELASTICSEARCH_API_KEY: process.env['ELASTICSEARCH_API_KEY'] ?? '',

    // ── Redis / ElasticCache ──────────────────────────────────────────────────
    REDIS_URL: process.env['REDIS_URL'] ?? '',

    // ── SES ───────────────────────────────────────────────────────────────────
    SES_FROM_EMAIL: process.env['SES_FROM_EMAIL'] ?? '',

    // ── SQS ───────────────────────────────────────────────────────────────────
    SQS_QUEUE_URL: process.env['SQS_QUEUE_URL'] ?? '',

    // ── Bedrock ───────────────────────────────────────────────────────────────
    BEDROCK_MODEL_ID: process.env['BEDROCK_MODEL_ID'] ?? '',
};

validateEnv(systemConfig);

// Re-export as `config` to match original usage pattern:
//   import { config } from '@repo/system-config';
export { systemConfig as config };
