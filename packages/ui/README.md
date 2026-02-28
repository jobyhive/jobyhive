# @repo/ui

Internal Design System and Component Library for the Joby platform.

## Overview

A collection of high-quality, reusable React components built with **React 19** and **Tailwind CSS**. These components ensure visual consistency across all Joby web applications.

## Components

- **Button**: Highly configurable interactive buttons.
- **Card**: Container components for structured content.
- **Code**: Stylized blocks for displaying code snippets.

## Usage

```tsx
import { Button, Card } from "@repo/ui";

export default function Page() {
  return (
    <Card title="Agent Status">
      <p>Your agent is currently searching for roles.</p>
      <Button onClick={() => alert("Stopping...")}>Stop Agent</Button>
    </Card>
  );
}
```

## Styling

Styles are injected via `@repo/tailwind-config`. Make sure your application's Tailwind configuration includes the UI package in its `content` path.

## Local Development

To add a new component:
```bash
pnpm turbo gen react-component
```
