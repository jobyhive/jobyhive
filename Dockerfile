# ──────────────────────────────────────────────
# Stage 1: base — Amazon Linux 2 + Node 22 + pnpm
# ──────────────────────────────────────────────
FROM amazonlinux:2023 AS base

# Install Node.js 22 via NodeSource and essential tools
RUN curl -fsSL https://rpm.nodesource.com/setup_22.x | bash - && \
    dnf install -y nodejs && \
    npm install -g pnpm@10.18.0 && \
    dnf clean all

# ──────────────────────────────────────────────
# Stage 2: deps — install all dependencies
# ──────────────────────────────────────────────
FROM base AS deps
WORKDIR /app

# Copy only manifest files first for layer caching
COPY package.json pnpm-lock.yaml .npmrc ./

# Install all deps (including devDependencies needed for the build)
RUN pnpm install --frozen-lockfile

# ──────────────────────────────────────────────
# Stage 3: builder — compile TypeScript
# ──────────────────────────────────────────────
FROM deps AS builder
WORKDIR /app

# Copy the rest of the source
COPY . .

# Build: tsc outputs to ./dist
RUN pnpm build

# ──────────────────────────────────────────────
# Stage 4: runner — lean production image
# ──────────────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Install only production dependencies
COPY package.json pnpm-lock.yaml .npmrc ./
RUN pnpm install --frozen-lockfile --prod

COPY --from=builder /app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/src/index.js"]