# @repo/typescript-config

Shared TypeScript configurations for the Joby monorepo.

## Overview

Centralized `tsconfig.json` bases to ensure consistent compilation settings across the project. 

## Configurations

- `base.json`: The foundation for all packages.
- `nextjs.json`: Optimized for Next.js applications.
- `react-library.json`: Optimized for shared React component libraries.

## Usage

In your project's `tsconfig.json`, extend the appropriate configuration:

```json
{
  "extends": "@repo/typescript-config/base.json",
  "compilerOptions": {
    "outDir": "dist"
  },
  "include": ["src"]
}
```
