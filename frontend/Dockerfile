# ==========================================
# Stage 1: Build the React application
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package*.json ./
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ==========================================
# Stage 2: Serve with Node.js serve package
# ==========================================
FROM node:20-alpine AS production

WORKDIR /app

# Install serve package globally
RUN npm install -g serve

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S reactuser -u 1001 && \
    chown -R reactuser:nodejs ./dist

# Switch to non-root user
USER reactuser

# Expose port 80
EXPOSE 80

# Start the application with serve
CMD ["serve", "-s", "dist", "-l", "80"]
