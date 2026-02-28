# @repo/services

Core infrastructure services for the Joby platform, primarily wrapping AWS resources.

## Services Included

| Service | Description | AWS Backend |
|---------|-------------|-------------|
| `BedrockService` | LLM interactions and embedding generation. | AWS Bedrock |
| `SimpleQueueService` | Asynchronous message processing. | AWS SQS |
| `SimpleEmailService` | Transactional email delivery. | AWS SES |
| `ElasticSearchService` | Vector search and document indexing. | OpenSearch/ElasticSearch |
| `ElasticCacheService` | High-performance caching. | Redis/ElastiCache |

## Usage Examples

### SQS Example
```ts
import { SimpleQueueService } from "@repo/services";

const sqs = new SimpleQueueService();
await sqs.sendMessage({ body: "Process this application" });
```

### Bedrock Example
```ts
import { BedrockService } from "@repo/services";

const ai = new BedrockService();
const result = await ai.invokeModel("amazon.nova-pro-v1:0", prompt);
```

## Features

- **Standardized Interfaces**: All services inherit from a shared `Service` base class.
- **Environment Aware**: Automatically configures based on SST environment variables.
- **Type Safe**: Fully typed requests and responses.
