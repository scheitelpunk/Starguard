# Lightweight Python ML service for STARGUARD
FROM python:3.11-alpine

# Create app user
RUN addgroup -g 1000 starguard && adduser -u 1000 -G starguard -s /bin/sh -D starguard

# Install system dependencies
RUN apk add --no-cache \
    dumb-init \
    gcc \
    musl-dev \
    linux-headers \
    curl \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Copy ML requirements
COPY ml/requirements.txt ./

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt \
    && pip cache purge

# Copy ML source code
COPY ml/ ./
COPY scripts/ml_healthcheck.py ./scripts/

# Create necessary directories
RUN mkdir -p models logs tmp \
    && chown -R starguard:starguard /app \
    && chmod -R 755 /app \
    && chmod -R 777 models logs tmp

# Switch to non-root user
USER starguard

# Expose ML service port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD python scripts/ml_healthcheck.py || exit 1

# Use dumb-init for proper signal handling
ENTRYPOINT [\"dumb-init\", \"--\"]

# Start ML service
CMD [\"python\", \"detector.py\"]