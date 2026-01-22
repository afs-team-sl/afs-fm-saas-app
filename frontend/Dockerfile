# =============================================================================
# STAGE 1: Dependencies - Install production dependencies
# =============================================================================
FROM node:20-alpine AS dependencies

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# =============================================================================
# STAGE 2: Builder - Build the React/Vite application
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build the application
# Note: Environment variables will be baked into the build
# For Azure Static Web Apps, use App Settings to set VITE_* variables before build
RUN npm run build

# =============================================================================
# STAGE 3: Production - Serve with Nginx
# =============================================================================
FROM nginx:alpine AS production

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
