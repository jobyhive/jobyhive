# @repo/types

Global TypeScript type definitions for the Joby monorepo.

## Overview

Shared interfaces, types, and enums to maintain type safety across the entire stack—from backend services to the frontend UI.

## Organization

Types are generally organized by domain:
- `Job`: Types related to job postings and applications.
- `User`: Profile and authentication types.
- `Agent`: Configuration and state types for AI agents.

## Usage

Simply import the types you need:

```ts
import type { JobApplication, AgentState } from "@repo/types";
```

## Maintenance

Always update these types before making changes to API schemas or database structures to ensure the monorepo remains synchronized.
