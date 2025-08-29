#!/bin/bash

# Docker Security Scanning Script for Starguard
# This script performs comprehensive security scanning of Docker images and containers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SCAN_RESULTS_DIR="/tmp/starguard-security-scan"
IMAGE_NAME="starguard:latest"
COMPOSE_FILE="docker-compose.production.yml"

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create results directory
mkdir -p "$SCAN_RESULTS_DIR"

print_status "Starting Docker security scan for Starguard..."

# 1. Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running or not accessible"
    exit 1
fi

print_status "Docker is running and accessible"

# 2. Check Docker version and security features
print_status "Checking Docker security configuration..."

DOCKER_VERSION=$(docker version --format '{{.Server.Version}}')
print_status "Docker version: $DOCKER_VERSION"

# Check for user namespace remapping
if docker info --format '{{.SecurityOptions}}' | grep -q "userns"; then
    print_status "User namespace remapping is enabled"
else
    print_warning "User namespace remapping is not enabled"
fi

# 3. Scan Docker images for vulnerabilities using Trivy (if available)
if command -v trivy > /dev/null 2>&1; then
    print_status "Scanning Docker image for vulnerabilities with Trivy..."
    
    if docker image inspect "$IMAGE_NAME" > /dev/null 2>&1; then
        trivy image --format json --output "$SCAN_RESULTS_DIR/trivy-scan.json" "$IMAGE_NAME"
        trivy image --severity HIGH,CRITICAL "$IMAGE_NAME" > "$SCAN_RESULTS_DIR/trivy-critical.txt"
        print_status "Trivy scan completed. Results saved to $SCAN_RESULTS_DIR/"
    else
        print_warning "Image $IMAGE_NAME not found. Building first..."
        docker build -f docker/Dockerfile.production -t "$IMAGE_NAME" .
        trivy image --format json --output "$SCAN_RESULTS_DIR/trivy-scan.json" "$IMAGE_NAME"
    fi
else
    print_warning "Trivy not installed. Installing..."
    # Install Trivy on Ubuntu/Debian
    if command -v apt-get > /dev/null 2>&1; then
        wget -qO - https://aquasecurity.github.io/trivy-repo/deb/public.key | sudo apt-key add -
        echo "deb https://aquasecurity.github.io/trivy-repo/deb $(lsb_release -sc) main" | sudo tee -a /etc/apt/sources.list.d/trivy.list
        sudo apt-get update && sudo apt-get install trivy -y
    fi
fi

# 4. Check Docker Bench Security (if available)
if command -v docker-bench-security > /dev/null 2>&1; then
    print_status "Running Docker Bench Security..."
    docker-bench-security > "$SCAN_RESULTS_DIR/docker-bench-security.txt" 2>&1
    print_status "Docker Bench Security scan completed"
else
    print_warning "Docker Bench Security not available. Running basic security checks..."
fi

# 5. Basic Docker security checks
print_status "Running basic Docker security checks..."

# Check for privileged containers
print_status "Checking for privileged containers..."
PRIVILEGED_CONTAINERS=$(docker ps --format "table {{.Names}}\t{{.Command}}" --filter "label=privileged=true" 2>/dev/null || echo "None")
echo "Privileged containers: $PRIVILEGED_CONTAINERS" > "$SCAN_RESULTS_DIR/privileged-containers.txt"

# Check container capabilities
print_status "Checking container capabilities..."
for container in $(docker ps -q 2>/dev/null); do
    CONTAINER_NAME=$(docker inspect --format '{{.Name}}' "$container" | sed 's/\///')
    echo "=== $CONTAINER_NAME ===" >> "$SCAN_RESULTS_DIR/container-capabilities.txt"
    docker inspect --format '{{.HostConfig.CapAdd}}' "$container" >> "$SCAN_RESULTS_DIR/container-capabilities.txt"
    docker inspect --format '{{.HostConfig.CapDrop}}' "$container" >> "$SCAN_RESULTS_DIR/container-capabilities.txt"
done

# Check for containers running as root
print_status "Checking for containers running as root..."
for container in $(docker ps -q 2>/dev/null); do
    CONTAINER_NAME=$(docker inspect --format '{{.Name}}' "$container" | sed 's/\///')
    USER=$(docker inspect --format '{{.Config.User}}' "$container")
    if [ -z "$USER" ] || [ "$USER" = "root" ] || [ "$USER" = "0" ]; then
        echo "$CONTAINER_NAME is running as root" >> "$SCAN_RESULTS_DIR/root-containers.txt"
    fi
done

# 6. Check Docker Compose security
print_status "Analyzing Docker Compose security..."
if [ -f "$COMPOSE_FILE" ]; then
    # Check for secrets in compose file
    if grep -i "password\|secret\|key" "$COMPOSE_FILE" > /dev/null 2>&1; then
        print_warning "Potential secrets found in $COMPOSE_FILE"
        grep -n -i "password\|secret\|key" "$COMPOSE_FILE" > "$SCAN_RESULTS_DIR/compose-secrets.txt"
    fi
    
    # Check for host network mode
    if grep -i "network_mode.*host" "$COMPOSE_FILE" > /dev/null 2>&1; then
        print_warning "Host network mode detected in $COMPOSE_FILE"
        echo "Host network mode found - this may pose security risks" > "$SCAN_RESULTS_DIR/host-network.txt"
    fi
    
    # Check for privileged mode
    if grep -i "privileged.*true" "$COMPOSE_FILE" > /dev/null 2>&1; then
        print_warning "Privileged mode detected in $COMPOSE_FILE"
        echo "Privileged containers found - review necessity" > "$SCAN_RESULTS_DIR/privileged-mode.txt"
    fi
fi

# 7. Check image layers for security issues
print_status "Analyzing image layers..."
if docker image inspect "$IMAGE_NAME" > /dev/null 2>&1; then
    # Check for large layers
    docker history --no-trunc --format "table {{.CreatedBy}}\t{{.Size}}" "$IMAGE_NAME" > "$SCAN_RESULTS_DIR/image-layers.txt"
    
    # Check for common security issues in layers
    docker history --no-trunc --format "{{.CreatedBy}}" "$IMAGE_NAME" | grep -E "(curl.*bash|wget.*bash|chmod 777)" > "$SCAN_RESULTS_DIR/layer-security-issues.txt" || echo "No obvious security issues found in layers"
fi

# 8. Network security check
print_status "Checking Docker network security..."
docker network ls --format "table {{.Name}}\t{{.Driver}}\t{{.Scope}}" > "$SCAN_RESULTS_DIR/networks.txt"

# Check for custom bridge networks (more secure than default)
CUSTOM_NETWORKS=$(docker network ls --filter driver=bridge --format "{{.Name}}" | grep -v bridge || echo "None")
echo "Custom bridge networks: $CUSTOM_NETWORKS" >> "$SCAN_RESULTS_DIR/networks.txt"

# 9. Check volume mounts for security issues
print_status "Checking volume mounts..."
for container in $(docker ps -q 2>/dev/null); do
    CONTAINER_NAME=$(docker inspect --format '{{.Name}}' "$container" | sed 's/\///')
    echo "=== $CONTAINER_NAME ===" >> "$SCAN_RESULTS_DIR/volume-mounts.txt"
    docker inspect --format '{{range .Mounts}}{{.Source}}:{{.Destination}}:{{.Mode}}{{"\n"}}{{end}}' "$container" >> "$SCAN_RESULTS_DIR/volume-mounts.txt"
done

# 10. Generate security report
print_status "Generating security report..."

cat > "$SCAN_RESULTS_DIR/security-report.md" << EOF
# Docker Security Scan Report for Starguard

**Scan Date:** $(date)
**Docker Version:** $DOCKER_VERSION

## Summary

This report contains the results of a comprehensive security scan of the Starguard Docker deployment.

## Scan Results

### 1. Image Vulnerabilities
- Trivy scan results: See trivy-scan.json
- Critical vulnerabilities: See trivy-critical.txt

### 2. Container Security
- Privileged containers: See privileged-containers.txt  
- Root containers: See root-containers.txt
- Container capabilities: See container-capabilities.txt

### 3. Configuration Security
- Docker Compose secrets: See compose-secrets.txt
- Network configuration: See networks.txt
- Volume mounts: See volume-mounts.txt

### 4. Image Security
- Layer analysis: See image-layers.txt
- Layer security issues: See layer-security-issues.txt

## Recommendations

1. **Keep base images updated** - Regularly update to latest versions
2. **Use non-root users** - Run containers with non-root users when possible
3. **Minimize capabilities** - Drop unnecessary capabilities and add only required ones
4. **Use secrets management** - Store sensitive data in Docker secrets or external services
5. **Network isolation** - Use custom networks instead of default bridge
6. **Regular scanning** - Implement automated security scanning in CI/CD pipeline

## Files Generated

EOF

ls -la "$SCAN_RESULTS_DIR/" >> "$SCAN_RESULTS_DIR/security-report.md"

print_status "Security scan completed!"
print_status "Results saved to: $SCAN_RESULTS_DIR/"
print_status "Review the security-report.md file for a summary of findings"

# Display critical issues if any
if [ -f "$SCAN_RESULTS_DIR/trivy-critical.txt" ] && [ -s "$SCAN_RESULTS_DIR/trivy-critical.txt" ]; then
    print_warning "Critical vulnerabilities found:"
    head -20 "$SCAN_RESULTS_DIR/trivy-critical.txt"
fi

if [ -f "$SCAN_RESULTS_DIR/root-containers.txt" ] && [ -s "$SCAN_RESULTS_DIR/root-containers.txt" ]; then
    print_warning "Containers running as root:"
    cat "$SCAN_RESULTS_DIR/root-containers.txt"
fi

print_status "Security scan complete. Review all files in $SCAN_RESULTS_DIR/ for detailed findings."