# @repo/logging

Standardized logging infrastructure for Joby applications and services.

## Overview

A wrapper around logging libraries (like Pino or Winston) to ensure consistent log formats across all services, making debugging and monitoring easier.

## Features

- **Structured Logging**: JSON output for better parser compatibility (e.g., CloudWatch, ELK).
- **Environment Context**: Automatically attaches service names and environment details.
- **Severity Levels**: Support for `DEBUG`, `INFO`, `WARN`, `ERROR`, and `FATAL`.

## Usage

```ts
import { Logger } from "@repo/logging";

const logger = new Logger("AgentService");
logger.info("Starting job search...");
```
