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
        // 1. Storage
        const storage = new sst.aws.Bucket("Storage");

        // 2. Database
        const table = new sst.aws.Dynamo("Database", {
            fields: {
                pk: "string",
                sk: "string",
            },
            primaryIndex: { hashKey: "pk", rangeKey: "sk" },
        });

        // 3. Backend (Engine)
        const engine = new sst.aws.Function("Engine", {
            handler: "apps/engine/src/lambda.handler",
            link: [storage, table],
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
            environment: {
                NODE_ENV: "production",
                // In prod, these should be real AWS values
                S3_BUCKET: storage.name,
                DYNAMODB_TABLE: table.name,
            },
        });

        // 4. Frontend (Web)
        const web = new sst.aws.Nextjs("Web", {
            path: "apps/web",
            link: [storage, table],
            environment: {
                NEXT_PUBLIC_API_URL: engine.url,
            },
        });

        return {
            engineUrl: engine.url,
            webUrl: web.url,
        };
    },
});
