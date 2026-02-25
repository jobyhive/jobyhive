# ──────────────────────────────────────────────
# Stage 1: base — Node 22 + pnpm
# ──────────────────────────────────────────────
FROM node:22-slim AS base

RUN apt-get update && apt-get install -y \
    curl \
    findutils \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm@9

# ──────────────────────────────────────────────
# Stage 2: deps — install all dependencies
# ──────────────────────────────────────────────
FROM base AS deps
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
# Copy .npmrc if you have one (omit if not)
COPY .npmrc ./
COPY apps/engine/package.json ./apps/engine/
COPY apps/web/package.json ./apps/web/
COPY packages/ ./packages/
RUN find packages -type f -not -name 'package.json' -delete

# Shamefully hoist = flat node_modules, no symlinks, Docker-safe
RUN pnpm install --frozen-lockfile

# ──────────────────────────────────────────────
# Stage 3: builder — build all applications
# ──────────────────────────────────────────────
FROM deps AS builder
WORKDIR /app

ENV CI=true
ENV NEXT_TELEMETRY_DISABLED=1

# Copy full source on top — node_modules already exist from deps stage
COPY . .

RUN pnpm build

# ──────────────────────────────────────────────
# Stage 4: engine — production runner
# ──────────────────────────────────────────────
FROM node:22-slim AS engine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app /app
EXPOSE 4000
CMD ["node", "apps/engine/dist/index.js"]

# ──────────────────────────────────────────────
# Stage 5: web — production runner
# ──────────────────────────────────────────────
FROM node:22-slim AS web
WORKDIR /app
ENV NODE_ENV=production
RUN npm install -g pnpm@9
COPY --from=builder /app /app
EXPOSE 3000
CMD ["pnpm", "--filter", "web", "start"]