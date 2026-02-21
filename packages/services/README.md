# `@repo/services`

Reusable singleton service clients for the Joby monorepo. Each service wraps its underlying SDK, opens **one connection** per process, and reads all config from [`@repo/system-config`](../system-config).

---

## Installation

Add to your package's `package.json`:

```json
{
  "dependencies": {
    "@repo/services": "workspace:*"
  }
}
```

Then call `connect()` **once** at application startup before using any service.

---

## Services

### `Service` (abstract base)

**Purpose:** Base class every service extends. Enforces a consistent lifecycle.

```typescript
import { Service } from '@repo/services';

class MyService extends Service {
  async connect() { /* open connection */ this._connected = true; }
  async disconnect() { /* close connection */ this._connected = false; }
}

const svc = new MyService();
console.log(svc.isConnected()); // false
await svc.connect();
console.log(svc.isConnected()); // true
```

---

### `ElasticSearchService`

**Purpose:** Full-text search & document storage via Elastic Cloud (or self-hosted Elasticsearch).

**Required env:**
```dotenv
ELASTICSEARCH_URL=https://my-project.es.us-central1.gcp.elastic.cloud:443
ELASTICSEARCH_API_KEY=your-api-key
```

```typescript
import { elasticSearchService } from '@repo/services';

await elasticSearchService.connect();

// Index a document
await elasticSearchService.index('jobs', 'job-123', {
  title: 'Software Engineer',
  company: 'Acme',
  location: 'Remote',
});

// Search
const hits = await elasticSearchService.search('jobs', {
  match: { title: 'engineer' },
}, { size: 5 });

// Check existence
const found = await elasticSearchService.exists('jobs', 'job-123');

// Delete
await elasticSearchService.delete('jobs', 'job-123');

// Bulk index
await elasticSearchService.bulkIndex('jobs', [
  { _id: 'a', title: 'Frontend Dev' },
  { _id: 'b', title: 'Backend Dev' },
]);
```

---

### `ElasticCacheService`

**Purpose:** Fast key-value caching via Redis (or Amazon ElastiCache).

**Required env:**
```dotenv
REDIS_URL=redis://localhost:6379
# For ElastiCache (TLS): rediss://clustercfg.my-cache.abc.use1.cache.amazonaws.com:6379
```

```typescript
import { elasticCacheService } from '@repo/services';

await elasticCacheService.connect();

// Store with TTL (seconds)
await elasticCacheService.set('session:user-1', JSON.stringify({ role: 'admin' }), 3600);

// Retrieve
const raw = await elasticCacheService.get('session:user-1');
const session = raw ? JSON.parse(raw) : null;

// setEx (explicit TTL required)
await elasticCacheService.setEx('otp:user-1', 300, '481623');

// Check / delete
const exists = await elasticCacheService.exists('otp:user-1');
await elasticCacheService.del('otp:user-1');

// Counter
await elasticCacheService.incr('api:rate-limit:user-1');

// TTL remaining
const ttl = await elasticCacheService.ttl('session:user-1');
```

---

### `SimpleEmailService`

**Purpose:** Send transactional emails via Amazon SES.

**Required env:**
```dotenv
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
SES_FROM_EMAIL=noreply@yourdomain.com
```

```typescript
import { simpleEmailService } from '@repo/services';

await simpleEmailService.connect();

// Send a text + HTML email
await simpleEmailService.sendEmail({
  to: 'candidate@example.com',
  subject: 'Your application was submitted!',
  text: 'We received your application.',
  html: '<h1>We received your application.</h1>',
  cc: ['recruiter@company.com'],
});

// Send raw MIME (e.g. with attachments)
await simpleEmailService.sendRawEmail(mimeBuffer);
```

---

### `SimpleQueueService`

**Purpose:** Reliable background job dispatch and consumption via Amazon SQS.

**Required env:**
```dotenv
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
SQS_QUEUE_URL=https://sqs.us-east-1.amazonaws.com/123456789/my-queue
```

```typescript
import { simpleQueueService } from '@repo/services';

await simpleQueueService.connect();

// Enqueue a job
await simpleQueueService.sendMessage({
  body: JSON.stringify({ type: 'JOB_MATCH', userId: 'u-1' }),
  delaySeconds: 0,
});

// Poll for messages (long-poll)
const messages = await simpleQueueService.receiveMessages({
  maxMessages: 5,
  waitTimeSeconds: 20,
});

for (const msg of messages) {
  console.log(JSON.parse(msg.Body!));
  // Acknowledge (delete) after processing
  await simpleQueueService.deleteMessage(msg.ReceiptHandle!);
}

// Queue stats
const attrs = await simpleQueueService.getAttributes(['ApproximateNumberOfMessages']);
console.log('Depth:', attrs['ApproximateNumberOfMessages']);

// Extend processing window
await simpleQueueService.changeVisibility(msg.ReceiptHandle!, 60);
```

---

### `BedrockService`

**Purpose:** AI text generation using **Amazon Nova** via AWS Bedrock. Supports single-turn, multi-turn conversation, and real-time streaming.

**Required env:**
```dotenv
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
BEDROCK_MODEL_ID=amazon.nova-lite-v1:0   # optional — this is the default
```

```typescript
import { bedrockService } from '@repo/services';

await bedrockService.connect();

// Quick one-shot question
const answer = await bedrockService.ask(
  'Give me 3 tips to improve this CV.',
  'You are a professional career advisor.',
);

// Full response with metadata
const result = await bedrockService.invoke({
  prompt: 'Extract the skills from this job description: …',
  systemPrompt: 'Return valid JSON only.',
  inferenceConfig: { maxTokens: 512, temperature: 0.3 },
});
console.log(result.text);

// Streaming (real-time output)
for await (const chunk of bedrockService.invokeStream({
  prompt: 'Write a cover letter for this role…',
})) {
  process.stdout.write(chunk);
}

// Multi-turn conversation
const result2 = await bedrockService.invoke({
  history: [
    { role: 'user',      content: [{ text: 'My name is Ahmed.' }] },
    { role: 'assistant', content: [{ text: 'Nice to meet you, Ahmed!' }] },
  ],
  prompt: 'What is my name?',
});
```

---

## Environment variables summary

| Variable | Service | Default |
|---|---|---|
| `ELASTICSEARCH_URL` | ElasticSearch | _(required)_ |
| `ELASTICSEARCH_API_KEY` | ElasticSearch | _(required)_ |
| `REDIS_URL` | ElasticCache | `redis://localhost:6379` |
| `AWS_REGION` | SES, SQS, Bedrock | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | SES, SQS, Bedrock | _(required in prod)_ |
| `AWS_SECRET_ACCESS_KEY` | SES, SQS, Bedrock | _(required in prod)_ |
| `SES_FROM_EMAIL` | SES | _(required)_ |
| `SQS_QUEUE_URL` | SQS | _(required)_ |
| `BEDROCK_MODEL_ID` | Bedrock | `amazon.nova-lite-v1:0` |
