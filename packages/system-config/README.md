# @repo/system-config

Centralized configuration management for the Joby infrastructure.

## Overview

This package handles environment variable resolution, global constants, and system-wide settings. It ensures that the application behaves correctly across `development`, `staging`, and `production` environments.

## Constants

Most configurations are defined in `src/constants.ts`. This includes:
- API Endpoints
- AWS Region settings
- Feature flags
- Database names/tables

## Usage

```ts
import { CONFIG } from "@repo/system-config";

console.log(CONFIG.AWS_REGION);
```
