# @repo/utils

Common helper functions and utility libraries used across the Joby monorepo.

## Overview

A collection of small, focused utility functions that don't fit into a specific domain-driven package. This avoids code duplication and ensures consistency in common operations.

## Categories

- **String Manipulation**: Slugification, formatting, etc.
- **Date Helpers**: Formatting and timezone adjustments.
- **Validation**: Generic schema-agnostic validators.
- **Async Helpers**: Retry logic, delay, and timeout patterns.

## Usage

```ts
import { slugify, wait } from "@repo/utils";

const url = slugify("Software Engineering Role");
await wait(1000);
```
