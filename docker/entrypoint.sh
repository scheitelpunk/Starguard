#!/bin/sh

# Production entrypoint script for Starguard Security System
set -e

# Function to log messages
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ENTRYPOINT: $1"
}

log "Starting Starguard Security System..."

# Check if running as root (when privileged mode is needed)
if [ "$(id -u)" = "0" ]; then
    log "Running with privileged access for network monitoring"
    
    # Set up network monitoring capabilities
    if [ -n "$MONITOR_INTERFACE" ]; then
        log "Configuring network interface: $MONITOR_INTERFACE"
        # Ensure interface is up
        ip link set dev "$MONITOR_INTERFACE" up || true
    fi
    
    # Create necessary device nodes if they don't exist
    [ ! -c /dev/net/tun ] && {
        mkdir -p /dev/net
        mknod /dev/net/tun c 10 200
        chmod 600 /dev/net/tun
    }
    
    # Set capabilities for network monitoring
    setcap cap_net_raw,cap_net_admin+eip /usr/local/bin/node || true
    
    # Switch to starguard user for application execution
    log "Switching to starguard user"
    exec su-exec starguard "$0" "$@"
fi

# Validate environment variables
log "Validating environment configuration..."

# Check required environment variables
if [ -z "$NODE_ENV" ]; then
    export NODE_ENV="production"
fi

if [ -z "$PORT" ]; then
    export PORT="3000"
fi

if [ -z "$REDIS_URL" ]; then
    log "WARNING: REDIS_URL not set, using default"
    export REDIS_URL="redis://localhost:6379"
fi

# Wait for Redis to be available
log "Waiting for Redis connection..."
REDIS_HOST=$(echo "$REDIS_URL" | sed 's|redis://||' | cut -d: -f1)
REDIS_PORT=$(echo "$REDIS_URL" | sed 's|redis://||' | cut -d: -f2)
REDIS_PORT=${REDIS_PORT:-6379}

timeout 60 sh -c '
  until nc -z '"$REDIS_HOST"' '"$REDIS_PORT"'; do
    echo "Waiting for Redis at '"$REDIS_HOST"':'"$REDIS_PORT"'..."
    sleep 2
  done
'

if [ $? -ne 0 ]; then
    log "ERROR: Could not connect to Redis at $REDIS_HOST:$REDIS_PORT"
    exit 1
fi

log "Redis connection established"

# Initialize application directories
mkdir -p /app/logs /app/data /app/tmp
chmod 755 /app/logs /app/data /app/tmp

# Run database migrations if needed
if [ -f "/app/scripts/migrate.js" ]; then
    log "Running database migrations..."
    node /app/scripts/migrate.js
fi

# Initialize ML models if they exist
if [ -d "/app/ml/models" ] && [ -f "/app/scripts/init-models.js" ]; then
    log "Initializing ML models..."
    node /app/scripts/init-models.js
fi

# Set up log rotation
if command -v logrotate >/dev/null 2>&1; then
    log "Setting up log rotation..."
    cat > /tmp/logrotate.conf << EOF
/app/logs/*.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
    create 644 $(id -u) $(id -g)
}
EOF
    logrotate -f /tmp/logrotate.conf || true
fi

# Health check setup
log "Setting up health monitoring..."
export HEALTH_CHECK_ENDPOINT="http://localhost:$PORT/health"

# Performance monitoring setup
if [ "$ENABLE_MONITORING" = "true" ]; then
    log "Enabling performance monitoring..."
    export NODE_OPTIONS="--enable-source-maps --max-old-space-size=2048"
fi

# Security hardening
umask 022

# Signal handlers for graceful shutdown
trap 'log "Received SIGTERM, shutting down gracefully..."; kill -TERM $PID; wait $PID' TERM
trap 'log "Received SIGINT, shutting down gracefully..."; kill -INT $PID; wait $PID' INT

# Start the application
log "Starting Starguard application on port $PORT..."
log "Environment: $NODE_ENV"
log "Log level: $LOG_LEVEL"

# Execute the main application
if [ "$NODE_ENV" = "development" ]; then
    exec npm run dev &
else
    exec node /app/dist/server.js &
fi

PID=$!
log "Application started with PID $PID"

# Wait for the application to finish
wait $PID
EXIT_CODE=$?

log "Application exited with code $EXIT_CODE"
exit $EXIT_CODE