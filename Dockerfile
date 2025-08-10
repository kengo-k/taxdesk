# imageTagsOnTagPushed: ["{tag}", "latest"]
# imageTagsOnBranchPushed: null
# imageTagsOnPullRequest: null

# Build stage
FROM node:21.7.3-bullseye AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client and build
RUN npx prisma generate && npm run build

# Production stage
FROM node:21.7.3-bullseye-slim AS runner

WORKDIR /app

# Install PostgreSQL client
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/schema.prisma ./schema.prisma

USER nextjs

CMD ["npm", "start"]
