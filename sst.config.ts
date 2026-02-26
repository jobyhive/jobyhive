/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
    app(input) {
        return {
            name: "joby",
            removal: input?.stage === "production" ? "retain" : "remove",
            home: "aws",
        };
    },
    async run() {
        // 1. Backend (Engine)
        // Set up the backend engine as a serverless function with a direct URL access.
        const engine = new sst.aws.Function("Engine", {
            handler: "apps/engine/src/lambda.handler",
            url: true,
            nodejs: {
                install: [
                    "express",
                    "serverless-http",
                    "node-telegram-bot-api",
                    "dotenv",
                    "@aws-sdk/client-bedrock-runtime",
                    "@aws-sdk/client-ses",
                    "@aws-sdk/client-sqs",
                    "@elastic/elasticsearch",
                    "ioredis"
                ],
            },
            memory: "1024 MB", // Balanced for performance and cost
            permissions: [
                {
                    actions: ["bedrock:*", "ses:*", "sqs:*"],
                    resources: ["*"],
                },
            ],
            environment: {
                NODE_ENV: "production",
                // Renaming reserved AWS keys to avoid Lambda deployment errors.
                // The application will be updated to check these APP_ prefixed versions.
                APP_AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
                APP_AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
                APP_AWS_REGION: process.env.AWS_REGION || "us-east-1",
                ELASTICSEARCH_URL: process.env.ELASTICSEARCH_URL || "",
                ELASTICSEARCH_API_KEY: process.env.ELASTICSEARCH_API_KEY || "",
                BEDROCK_MODEL_ID: process.env.BEDROCK_MODEL_ID || "amazon.nova-lite-v1:0",
                TELEGRAM_BOT_ACCESS_TOKEN: process.env.TELEGRAM_BOT_ACCESS_TOKEN || "",
            },
        });

        // 2. Engine Router (Custom Subdomain)
        // Set up ai.jobyhive.com to route to the Engine function.
        const engineRouter = new sst.aws.Router("EngineRouter", {
            domain: {
                name: "ai.jobyhive.com",
                dns: sst.aws.dns(),
            },
            routes: {
                "/*": engine.url,
            },
        });

        // 3. Frontend (Web)
        // Set up the Next.js app on AWS Lambda with a custom domain on Route 53.
        const web = new sst.aws.Nextjs("Web", {
            path: "apps/web",
            domain: {
                name: "jobyhive.com",
                dns: sst.aws.dns(),
            },
            permissions: [
                {
                    actions: ["bedrock:*", "ses:*", "sqs:*"],
                    resources: ["*"],
                },
            ],
            environment: {
                NEXT_PUBLIC_API_URL: "https://ai.jobyhive.com",
                NODE_ENV: "production",
                // Consistently using APP_ prefixed versions to avoid Lambda reserved key conflicts.
                APP_AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
                APP_AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
                APP_AWS_REGION: process.env.AWS_REGION || "us-east-1",
                ELASTICSEARCH_URL: process.env.ELASTICSEARCH_URL || "",
                ELASTICSEARCH_API_KEY: process.env.ELASTICSEARCH_API_KEY || "",
                BEDROCK_MODEL_ID: process.env.BEDROCK_MODEL_ID || "amazon.nova-lite-v1:0",
            },
        });

        return {
            engineUrl: "https://ai.jobyhive.com",
            webUrl: "https://jobyhive.com",
        };
    },
});
