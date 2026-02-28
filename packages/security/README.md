# @repo/security

Security utilities and cryptographic functions for the Joby platform.

## Overview

A package dedicated to ensuring data integrity and security through standardized cryptographic implementations.

## Utilities

- **Keccak-256**: SHA-3 family hashing algorithm, often used for unique identifier generation and blockchain-compatible hashing.

## Usage

```ts
import { keccak256 } from "@repo/security";

const hash = keccak256("input-string");
```

## Security Standards

All implementations follow industry-standard cryptographic practices to ensure the safety of user data and system identifiers.
