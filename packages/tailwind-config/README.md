# @repo/tailwind-config

Shared styling configuration and global CSS for the Joby project.

## Overview

This package centralizes the Tailwind CSS configuration, including:
- Brand colors and palette.
- Typography settings.
- Custom animations and utilities.
- Global CSS base styles.

## Usage

In your application's `tailwind.config.ts`:

```ts
import type { Config } from "tailwindcss";
import sharedConfig from "@repo/tailwind-config";

const config: Config = {
  content: [
    "./src/**/*.tsx",
    "../../packages/ui/src/**/*.tsx",
  ],
  presets: [sharedConfig],
};

export default config;
```

## Global CSS

Import the global styles in your app entry point (e.g., `layout.tsx` in Next.js):

```ts
import "@repo/tailwind-config/styles.css";
```
