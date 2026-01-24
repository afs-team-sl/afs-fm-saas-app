# =============================================================================
# STAGE 1: Dependencies - Install production dependencies
# =============================================================================
FROM node:20-alpine AS dependencies

# Install OpenSSL for Prisma (required on Alpine Linux)
RUN apk add --no-cache openssl

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# =============================================================================
# STAGE 2: Builder - Build the NestJS application
# =============================================================================
FROM node:20-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/prisma ./prisma

# Copy source code and config files
COPY . .

# Build the application
RUN npm run build

# =============================================================================
# STAGE 3: Production - Create the final lightweight image
# =============================================================================
FROM node:20-alpine AS production

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl dumb-init

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

# Switch to non-root user
USER nestjs

# Expose the application port (Azure will map this automatically)
EXPOSE 80

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "dist/main"]
