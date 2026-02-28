# @repo/eslint-config

Shared ESLint configurations for the Joby monorepo.

## Overview

This package provides consistent linting rules across all applications and packages in the repository. It includes configurations tailored for different environments:

- `base`: General TypeScript rules.
- `next`: Specialized rules for Next.js applications.
- `react-internal`: Rules for internal React libraries.

## Usage

Extend these configurations in your package's `.eslintrc.js` or `package.json`:

```json
{
  "extends": ["@repo/eslint-config/base"]
}
```

## Available Configurations

| Name | File | Description |
|------|------|-------------|
| Base | `base.js` | Core linting logic for TypeScript projects. |
| Next.js | `next.js` | Rules for Next.js projects including Accessibility and Hooks. |
| React Internal | `react-internal.js` | Rules for shared UI libraries. |
