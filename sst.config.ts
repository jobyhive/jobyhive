/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
    app(input) {
        return {
            name: "joby",
            removal: input?.stage === "production" ? "retain" : "remove",
            home: "aws",
            providers: {
                aws: {
                    region: "us-east-1",
                },
            },
        };
    },
    async run() {
        // (Removed dotenv.config calls to prevent environment leakage)


        // 1. Backend (Engine)
        // Set up the backend engine as a serverless function with a direct URL access.
        const engine = new sst.aws.Function("Engine", {
            handler: "apps/engine/src/lambda.handler",
            url: true,
            // AI agent calls (Bedrock, ElasticSearch, Redis) can take 10-60s.
            // Default Lambda timeout is 3 seconds — way too short.
            timeout: "5 minutes",
            nodejs: {
                install: [
                    "express",
                    "serverless-http",
                    "node-telegram-bot-api",
                    "dotenv",
                    "@aws-sdk/client-bedrock-runtime",
                    "@aws-sdk/client-ses",
                    "@aws-sdk/client-sqs",
                    "@aws-sdk/credential-providers",
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
                APP_AWS_REGION: "us-east-1",
                ELASTICSEARCH_URL: "https://my-elasticsearch-project-f903ba.es.us-central1.gcp.elastic.cloud:443",
                ELASTICSEARCH_API_KEY: "WElMc2Vad0JSUWxqTTI2VUNmX2U6bjdsSzFUZ1JZRlE4TjdRZE5BNXltZw==",
                BEDROCK_MODEL_ID: "amazon.nova-lite-v1:0",
                TELEGRAM_BOT_ACCESS_TOKEN: "8355213023:AAEH52qJBmrJRcBHL9F7vOjXwnuLib4Dyog",
                REDIS_URL: "rediss://default:AaWWAAIncDE3NTNkOTQ0YzA4ZTc0YjI1YmYyYTRkYmI4ZmJiNTI0OXAxNDIzOTA@key-tarpon-42390.upstash.io:6379",
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
                APP_AWS_REGION: "us-east-1",
                ELASTICSEARCH_URL: "https://my-elasticsearch-project-f903ba.es.us-central1.gcp.elastic.cloud:443",
                ELASTICSEARCH_API_KEY: "WElMc2Vad0JSUWxqTTI2VUNmX2U6bjdsSzFUZ1JZRlE4TjdRZE5BNXltZw==",
                BEDROCK_MODEL_ID: "amazon.nova-lite-v1:0",
            },
        });

        return {
            engineUrl: "https://ai.jobyhive.com",
            webUrl: "https://jobyhive.com",
        };
    },
});
