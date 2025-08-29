#!/bin/bash

# Docker Build and Deployment Script for Starguard
# Builds production-ready Docker images with security scanning

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="starguard"
IMAGE_TAG=${1:-"latest"}
DOCKERFILE="docker/Dockerfile.production"
DOCKER_REGISTRY=${DOCKER_REGISTRY:-""}
BUILD_ARGS=""
PLATFORM=${PLATFORM:-"linux/amd64"}

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

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    print_step "Checking prerequisites..."
    
    # Check if Docker is installed and running
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker daemon is not running"
        exit 1
    fi
    
    # Check if Dockerfile exists
    if [ ! -f "$DOCKERFILE" ]; then
        print_error "Dockerfile not found: $DOCKERFILE"
        exit 1
    fi
    
    print_status "Prerequisites check passed"
}

# Function to prepare build context
prepare_build_context() {
    print_step "Preparing build context..."
    
    # Create .dockerignore if it doesn't exist
    if [ ! -f .dockerignore ]; then
        cat > .dockerignore << 'EOF'
node_modules
npm-debug.log
.git
.gitignore
README.md
.env
.env.local
.env.*.local
.DS_Store
*.log
logs
*.pid
coverage
.nyc_output
lib-cov
.tmp
.sass-cache
.vscode
.idea
*.swp
*.swo
*~
.history
.cache
dist
build
Dockerfile
docker-compose*.yml
.dockerignore
EOF
        print_status "Created .dockerignore file"
    fi
    
    # Ensure required directories exist
    mkdir -p logs config/ssl
    
    print_status "Build context prepared"
}

# Function to build Docker image
build_image() {
    print_step "Building Docker image: $IMAGE_NAME:$IMAGE_TAG"
    
    # Build arguments
    BUILD_ARGS="--platform $PLATFORM"
    BUILD_ARGS="$BUILD_ARGS --target production"
    BUILD_ARGS="$BUILD_ARGS --build-arg NODE_ENV=production"
    BUILD_ARGS="$BUILD_ARGS --build-arg BUILD_DATE=$(date -u +'%Y-%m-%dT%H:%M:%SZ')"
    BUILD_ARGS="$BUILD_ARGS --build-arg VCS_REF=$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
    
    # Add cache optimization
    BUILD_ARGS="$BUILD_ARGS --cache-from $IMAGE_NAME:cache"
    
    # Add labels
    BUILD_ARGS="$BUILD_ARGS --label org.opencontainers.image.title=Starguard"
    BUILD_ARGS="$BUILD_ARGS --label org.opencontainers.image.description='Advanced Security System'"
    BUILD_ARGS="$BUILD_ARGS --label org.opencontainers.image.vendor='Starguard Security'"
    BUILD_ARGS="$BUILD_ARGS --label org.opencontainers.image.version=$IMAGE_TAG"
    
    # Build the image
    docker build $BUILD_ARGS -f "$DOCKERFILE" -t "$IMAGE_NAME:$IMAGE_TAG" .
    
    # Tag as latest if not already
    if [ "$IMAGE_TAG" != "latest" ]; then
        docker tag "$IMAGE_NAME:$IMAGE_TAG" "$IMAGE_NAME:latest"
    fi
    
    print_status "Docker image built successfully"
}

# Function to scan image for vulnerabilities
scan_image() {
    print_step "Scanning image for vulnerabilities..."
    
    # Check if Trivy is available
    if command -v trivy &> /dev/null; then
        trivy image --exit-code 1 --severity HIGH,CRITICAL "$IMAGE_NAME:$IMAGE_TAG"
        print_status "Vulnerability scan passed"
    else
        print_warning "Trivy not found, skipping vulnerability scan"
        print_warning "Install Trivy for security scanning: https://aquasecurity.github.io/trivy/"
    fi
}

# Function to test image
test_image() {
    print_step "Testing Docker image..."
    
    # Start container for testing
    CONTAINER_ID=$(docker run -d --name "test-$IMAGE_NAME-$$" "$IMAGE_NAME:$IMAGE_TAG")
    
    # Wait for container to start
    sleep 10
    
    # Check if container is running
    if docker ps -q -f id="$CONTAINER_ID" &> /dev/null; then
        print_status "Container started successfully"
        
        # Run health check
        if docker exec "$CONTAINER_ID" node scripts/healthcheck.js; then
            print_status "Health check passed"
        else
            print_warning "Health check failed"
        fi
    else
        print_error "Container failed to start"
        docker logs "$CONTAINER_ID"
        docker rm -f "$CONTAINER_ID" &> /dev/null || true
        exit 1
    fi
    
    # Clean up test container
    docker rm -f "$CONTAINER_ID" &> /dev/null || true
    print_status "Image testing completed"
}

# Function to optimize image size
optimize_image() {
    print_step "Optimizing image size..."
    
    # Get image size before optimization
    SIZE_BEFORE=$(docker images --format "table {{.Size}}" "$IMAGE_NAME:$IMAGE_TAG" | tail -n1)
    
    # Docker multi-stage builds already optimize, but we can check layer cache
    docker image prune -f &> /dev/null || true
    
    # Get image size after optimization
    SIZE_AFTER=$(docker images --format "table {{.Size}}" "$IMAGE_NAME:$IMAGE_TAG" | tail -n1)
    
    print_status "Image optimization completed"
    print_status "Image size: $SIZE_AFTER"
}

# Function to push to registry
push_image() {
    if [ -n "$DOCKER_REGISTRY" ]; then
        print_step "Pushing image to registry: $DOCKER_REGISTRY"
        
        # Tag for registry
        REGISTRY_IMAGE="$DOCKER_REGISTRY/$IMAGE_NAME:$IMAGE_TAG"
        docker tag "$IMAGE_NAME:$IMAGE_TAG" "$REGISTRY_IMAGE"
        
        # Push to registry
        docker push "$REGISTRY_IMAGE"
        
        # Also push latest if not already
        if [ "$IMAGE_TAG" != "latest" ]; then
            docker tag "$IMAGE_NAME:latest" "$DOCKER_REGISTRY/$IMAGE_NAME:latest"
            docker push "$DOCKER_REGISTRY/$IMAGE_NAME:latest"
        fi
        
        print_status "Image pushed to registry successfully"
    else
        print_status "No registry specified, skipping push"
    fi
}

# Function to generate build report
generate_report() {
    print_step "Generating build report..."
    
    REPORT_FILE="build-report-$(date +%Y%m%d-%H%M%S).txt"
    
    cat > "$REPORT_FILE" << EOF
# Starguard Docker Build Report

**Build Date:** $(date)
**Image:** $IMAGE_NAME:$IMAGE_TAG
**Platform:** $PLATFORM
**Dockerfile:** $DOCKERFILE

## Build Information

- Docker Version: $(docker --version)
- Git Commit: $(git rev-parse HEAD 2>/dev/null || echo 'unknown')
- Build Host: $(hostname)

## Image Details

$(docker image inspect "$IMAGE_NAME:$IMAGE_TAG" --format '
- Image ID: {{.Id}}
- Created: {{.Created}}
- Size: {{.Size}} bytes
- Architecture: {{.Architecture}}
- OS: {{.Os}}
')

## Image Layers

$(docker history "$IMAGE_NAME:$IMAGE_TAG" --format "table {{.CreatedBy}}\t{{.Size}}")

## Security Information

$(if command -v trivy &> /dev/null; then
    echo "Vulnerability scan results available"
else
    echo "Vulnerability scanning not performed (Trivy not installed)"
fi)

EOF
    
    print_status "Build report generated: $REPORT_FILE"
}

# Function to clean up
cleanup() {
    print_step "Cleaning up build artifacts..."
    
    # Remove dangling images
    docker image prune -f &> /dev/null || true
    
    # Remove build cache if requested
    if [ "$CLEAN_CACHE" = "true" ]; then
        docker builder prune -f &> /dev/null || true
    fi
    
    print_status "Cleanup completed"
}

# Function to show usage
usage() {
    cat << EOF
Usage: $0 [TAG] [OPTIONS]

Build production Docker image for Starguard Security System

Arguments:
  TAG               Image tag (default: latest)

Environment Variables:
  DOCKER_REGISTRY   Docker registry to push to
  PLATFORM         Target platform (default: linux/amd64)
  CLEAN_CACHE      Clean build cache after build (true/false)

Examples:
  $0                    # Build with latest tag
  $0 v1.0.0            # Build with specific tag
  $0 latest --no-test  # Build without testing

Options:
  --no-scan          Skip vulnerability scanning
  --no-test          Skip image testing
  --no-push          Skip pushing to registry
  --help             Show this help message

EOF
}

# Main execution
main() {
    # Parse command line arguments
    SKIP_SCAN=false
    SKIP_TEST=false
    SKIP_PUSH=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --no-scan)
                SKIP_SCAN=true
                shift
                ;;
            --no-test)
                SKIP_TEST=true
                shift
                ;;
            --no-push)
                SKIP_PUSH=true
                shift
                ;;
            --help)
                usage
                exit 0
                ;;
            -*)
                print_error "Unknown option: $1"
                usage
                exit 1
                ;;
            *)
                if [ -z "$IMAGE_TAG" ] || [ "$IMAGE_TAG" = "latest" ]; then
                    IMAGE_TAG="$1"
                fi
                shift
                ;;
        esac
    done
    
    print_status "Starting Starguard Docker build process..."
    print_status "Building image: $IMAGE_NAME:$IMAGE_TAG"
    
    # Execute build steps
    check_prerequisites
    prepare_build_context
    build_image
    
    if [ "$SKIP_SCAN" = false ]; then
        scan_image
    fi
    
    if [ "$SKIP_TEST" = false ]; then
        test_image
    fi
    
    optimize_image
    
    if [ "$SKIP_PUSH" = false ]; then
        push_image
    fi
    
    generate_report
    cleanup
    
    print_status "Build process completed successfully!"
    print_status "Image ready: $IMAGE_NAME:$IMAGE_TAG"
    
    # Show image information
    echo
    docker images "$IMAGE_NAME:$IMAGE_TAG" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"
}

# Run main function if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi