# Multi-stage build for laptop-optimized STARGUARD
FROM node:18-alpine AS base

# Create app user for security
RUN addgroup -g 1000 starguard && adduser -u 1000 -G starguard -s /bin/sh -D starguard

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    dumb-init \
    python3 \
    py3-pip \
    build-base \
    sqlite \
    curl \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package*.json ./
COPY backend/tsconfig.json ./backend/

# Install Node.js dependencies
FROM base AS dependencies
RUN npm ci --only=production && npm cache clean --force

# Development dependencies for building
FROM base AS build-deps
RUN npm ci && npm cache clean --force
COPY backend/ ./backend/
COPY frontend/ ./frontend/
COPY scripts/ ./scripts/
RUN npm run build

# Production image
FROM base AS production

# Copy production dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy built application
COPY --from=build-deps /app/dist ./dist
COPY --from=build-deps /app/package*.json ./

# Copy configuration and scripts
COPY config/ ./config/
COPY scripts/ ./scripts/
COPY ml/ ./ml/

# Create necessary directories with proper permissions
RUN mkdir -p data logs ml/models tmp \
    && chown -R starguard:starguard /app \
    && chmod -R 755 /app \
    && chmod -R 777 data logs tmp

# Install Python ML dependencies
RUN cd ml && pip3 install --no-cache-dir -r requirements.txt

# Switch to non-root user
USER starguard

# Expose ports
EXPOSE 3000 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node scripts/healthcheck.js || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT [\"dumb-init\", \"--\"]

# Start command
CMD [\"node\", \"dist/server.js\"]