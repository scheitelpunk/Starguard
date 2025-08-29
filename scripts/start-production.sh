#!/bin/bash

# STARGUARD2 Production Startup Script
# This script initializes the complete STARGUARD security system

set -e

echo "🚀 Starting STARGUARD2 Production Deployment"
echo "=========================================="

# Check if running as root (required for network monitoring)
if [[ $EUID -ne 0 ]]; then
   echo "❌ This script must be run as root for network monitoring capabilities"
   exit 1
fi

# Set production environment
export NODE_ENV=production
export PORT=4000
export HOST=0.0.0.0

echo "📦 Installing dependencies..."
npm install

echo "🔨 Building application..."
npm run build

echo "🐳 Starting Docker production environment..."
docker-compose -f docker-compose.production.yml up -d

echo "⏳ Waiting for services to initialize..."
sleep 10

echo "🔍 Checking service health..."
curl -f http://localhost:4000/health || {
    echo "❌ Health check failed"
    exit 1
}

echo "✅ STARGUARD2 Production Deployment Complete!"
echo "🌐 API available at: http://localhost:4000"
echo "📚 Documentation at: http://localhost:4000/docs"
echo "🔗 WebSocket endpoint: ws://localhost:4000/api/quantum/ws"
echo "Ω OMEGA Protocol: ws://localhost:4000/api/omega/stream"

# Keep container running
echo "🔄 Monitoring container status..."
docker-compose -f docker-compose.production.yml logs -f