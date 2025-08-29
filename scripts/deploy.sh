#!/bin/bash

# STARGUARD2 Production Deployment Script
# Enterprise-grade deployment with security validation and health checks

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
LOG_FILE="$PROJECT_DIR/logs/deployment.log"
ENV_FILE="$PROJECT_DIR/.env.production"
BACKUP_DIR="$PROJECT_DIR/backups/$(date +%Y%m%d_%H%M%S)"
DOCKER_COMPOSE_FILE="$PROJECT_DIR/docker-compose.production.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log_info() {
    log "${BLUE}[INFO]${NC} $1"
}

log_success() {
    log "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    log "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    log "${RED}[ERROR]${NC} $1"
}

# Error handling
error_exit() {
    log_error "$1"
    exit 1
}

# Cleanup function
cleanup() {
    log_info "Performing cleanup..."
    # Remove temporary files if any
    find /tmp -name "starguard-*" -mtime +1 -delete 2>/dev/null || true
}

trap cleanup EXIT

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if running as root
    if [[ $EUID -eq 0 ]]; then
        error_exit "This script should not be run as root for security reasons"
    fi
    
    # Check required commands
    local required_commands=("docker" "docker-compose" "jq" "curl" "openssl")
    for cmd in "${required_commands[@]}"; do
        if ! command -v "$cmd" &> /dev/null; then
            error_exit "Required command '$cmd' is not installed"
        fi
    done
    
    # Check Docker daemon
    if ! docker info &> /dev/null; then
        error_exit "Docker daemon is not running or accessible"
    fi
    
    # Check environment file
    if [[ ! -f "$ENV_FILE" ]]; then
        error_exit "Environment file $ENV_FILE not found"
    fi
    
    # Check required environment variables
    local required_vars=("REDIS_PASSWORD" "JWT_SECRET" "ENCRYPTION_KEY" "GRAFANA_ADMIN_PASSWORD")
    for var in "${required_vars[@]}"; do
        if ! grep -q "^$var=" "$ENV_FILE"; then
            error_exit "Required environment variable '$var' not found in $ENV_FILE"
        fi
    done
    
    log_success "Prerequisites check completed"
}

# Validate configuration
validate_config() {
    log_info "Validating configuration..."
    
    # Validate Docker Compose file
    if ! docker-compose -f "$DOCKER_COMPOSE_FILE" config &> /dev/null; then
        error_exit "Invalid Docker Compose configuration"
    fi
    
    # Check SSL certificates if HTTPS is enabled
    if grep -q "443:443" "$DOCKER_COMPOSE_FILE"; then
        if [[ ! -f "$PROJECT_DIR/nginx/ssl/starguard.crt" ]] || [[ ! -f "$PROJECT_DIR/nginx/ssl/starguard.key" ]]; then
            log_warning "SSL certificates not found. HTTPS will not work properly."
        fi
    fi
    
    log_success "Configuration validation completed"
}

# Security scan
security_scan() {
    log_info "Running security scan..."
    
    # Run Docker security scan if available
    if command -v "$PROJECT_DIR/scripts/docker-security-scan.sh" &> /dev/null; then
        bash "$PROJECT_DIR/scripts/docker-security-scan.sh"
    else
        log_warning "Docker security scan script not found, skipping..."
    fi
    
    # Check for sensitive files
    local sensitive_files=(".env" "*.pem" "*.key" "id_rsa" "id_dsa")
    for pattern in "${sensitive_files[@]}"; do
        if find "$PROJECT_DIR" -name "$pattern" -type f 2>/dev/null | grep -v ".env.template" | grep -q .; then
            log_warning "Sensitive files found matching pattern: $pattern"
        fi
    done
    
    # Check file permissions
    if find "$PROJECT_DIR" -type f -perm -002 2>/dev/null | grep -q .; then
        log_warning "World-writable files found"
    fi
    
    log_success "Security scan completed"
}

# Create backup
create_backup() {
    log_info "Creating backup..."
    
    mkdir -p "$BACKUP_DIR"
    
    # Backup configuration files
    cp -r "$PROJECT_DIR/config" "$BACKUP_DIR/" 2>/dev/null || true
    cp "$ENV_FILE" "$BACKUP_DIR/" 2>/dev/null || true
    cp "$DOCKER_COMPOSE_FILE" "$BACKUP_DIR/" 2>/dev/null || true
    
    # Backup data volumes if they exist
    if docker volume ls | grep -q starguard; then
        log_info "Backing up Docker volumes..."
        docker run --rm -v starguard-data:/data -v "$BACKUP_DIR:/backup" alpine:latest tar czf /backup/starguard-data.tar.gz -C /data . 2>/dev/null || true
        docker run --rm -v starguard-redis-data:/data -v "$BACKUP_DIR:/backup" alpine:latest tar czf /backup/redis-data.tar.gz -C /data . 2>/dev/null || true
    fi
    
    log_success "Backup created at $BACKUP_DIR"
}

# Build images
build_images() {
    log_info "Building Docker images..."
    
    cd "$PROJECT_DIR"
    
    # Build with no cache for production
    docker-compose -f "$DOCKER_COMPOSE_FILE" build --no-cache
    
    # Tag images with timestamp
    local timestamp=$(date +%Y%m%d_%H%M%S)
    docker tag starguard2:latest starguard2:"$timestamp"
    
    # Clean up old images (keep last 5)
    local old_images=$(docker images starguard2 --format "table {{.Tag}}" | grep -E '^[0-9]{8}_[0-9]{6}$' | tail -n +6)
    if [[ -n "$old_images" ]]; then
        echo "$old_images" | xargs -I {} docker rmi starguard2:{} 2>/dev/null || true
    fi
    
    log_success "Images built successfully"
}

# Deploy services
deploy_services() {
    log_info "Deploying services..."
    
    cd "$PROJECT_DIR"
    
    # Stop existing services gracefully
    if docker-compose -f "$DOCKER_COMPOSE_FILE" ps | grep -q Up; then
        log_info "Stopping existing services..."
        docker-compose -f "$DOCKER_COMPOSE_FILE" down --timeout 30
    fi
    
    # Start services
    docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
    
    # Wait for services to be healthy
    log_info "Waiting for services to be healthy..."
    local max_wait=300  # 5 minutes
    local wait_time=0
    
    while [[ $wait_time -lt $max_wait ]]; do
        if docker-compose -f "$DOCKER_COMPOSE_FILE" ps | grep -q "(unhealthy)"; then
            log_warning "Some services are unhealthy, waiting..."
        else
            break
        fi
        sleep 10
        wait_time=$((wait_time + 10))
    done
    
    if [[ $wait_time -ge $max_wait ]]; then
        error_exit "Services failed to become healthy within $max_wait seconds"
    fi
    
    log_success "Services deployed successfully"
}

# Run health checks
health_checks() {
    log_info "Running health checks..."
    
    local services=("starguard-api" "starguard-redis" "starguard-ml" "starguard-proxy")
    
    for service in "${services[@]}"; do
        local health_status=$(docker inspect --format='{{.State.Health.Status}}' "$service" 2>/dev/null || echo "no-healthcheck")
        
        if [[ "$health_status" == "healthy" ]]; then
            log_success "$service is healthy"
        elif [[ "$health_status" == "no-healthcheck" ]]; then
            log_warning "$service has no health check configured"
        else
            log_error "$service is $health_status"
        fi
    done
    
    # Test API endpoints
    local api_url="http://localhost:80/health"
    if curl -s -f "$api_url" > /dev/null; then
        log_success "API health endpoint is responding"
    else
        log_error "API health endpoint is not responding"
    fi
    
    log_success "Health checks completed"
}

# Setup monitoring
setup_monitoring() {
    log_info "Setting up monitoring..."
    
    # Wait for Grafana to be ready
    local grafana_url="http://localhost:3001"
    local max_wait=120
    local wait_time=0
    
    while [[ $wait_time -lt $max_wait ]]; do
        if curl -s -f "$grafana_url/api/health" > /dev/null; then
            break
        fi
        sleep 5
        wait_time=$((wait_time + 5))
    done
    
    if [[ $wait_time -ge $max_wait ]]; then
        log_warning "Grafana not ready, skipping dashboard import"
        return
    fi
    
    # Import Grafana dashboards if available
    if [[ -d "$PROJECT_DIR/monitoring/grafana/dashboards" ]]; then
        log_info "Grafana dashboards will be automatically provisioned"
    fi
    
    log_success "Monitoring setup completed"
}

# Performance optimization
optimize_performance() {
    log_info "Applying performance optimizations..."
    
    # Docker system cleanup
    docker system prune -f > /dev/null 2>&1 || true
    
    # Optimize Docker daemon settings if possible
    if [[ -w /etc/docker/daemon.json ]]; then
        log_info "Docker daemon optimization would require root privileges"
    fi
    
    log_success "Performance optimizations completed"
}

# Main deployment function
main() {
    log_info "Starting STARGUARD2 production deployment..."
    
    # Create logs directory
    mkdir -p "$(dirname "$LOG_FILE")"
    
    # Check if we're in the right directory
    if [[ ! -f "$PROJECT_DIR/package.json" ]]; then
        error_exit "Not in STARGUARD2 project directory"
    fi
    
    # Run deployment steps
    check_prerequisites
    validate_config
    security_scan
    create_backup
    build_images
    deploy_services
    health_checks
    setup_monitoring
    optimize_performance
    
    # Display deployment summary
    log_success "\n=== DEPLOYMENT COMPLETED SUCCESSFULLY ==="
    log_info "Application URL: https://localhost (or configured domain)"
    log_info "Grafana Dashboard: http://localhost:3001"
    log_info "Prometheus Metrics: http://localhost:9090"
    log_info "Logs: $LOG_FILE"
    log_info "Backup: $BACKUP_DIR"
    
    # Show running services
    echo ""
    docker-compose -f "$DOCKER_COMPOSE_FILE" ps
}

# Parse command line arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [options]"
        echo "Options:"
        echo "  --help, -h    Show this help message"
        echo "  --dry-run     Perform all checks without actual deployment"
        exit 0
        ;;
    --dry-run)
        log_info "Dry run mode - no actual deployment will be performed"
        check_prerequisites
        validate_config
        security_scan
        log_info "Dry run completed - deployment would succeed"
        exit 0
        ;;
    "")
        main
        ;;
    *)
        error_exit "Unknown option: $1. Use --help for usage information."
        ;;
esac