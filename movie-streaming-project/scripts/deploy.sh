#!/bin/bash

# Deployment Script for Movie Streaming Platform
# Make sure to run with: chmod +x deploy.sh

# Color codes for console output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="movie-streaming-backend"
REPO_URL="git@github.com:yourusername/movie-streaming-backend.git"
DEPLOY_DIR="/var/www/${PROJECT_NAME}"
BRANCH="main"

# Logging function
log() {
    echo -e "${GREEN}[DEPLOY] ${1}${NC}"
}

# Error handling function
error() {
    echo -e "${RED}[ERROR] ${1}${NC}"
    exit 1
}

# Validate environment
validate_environment() {
    log "Validating deployment environment..."
    
    # Check required tools
    command -v node >/dev/null 2>&1 || error "Node.js is not installed"
    command -v npm >/dev/null 2>&1 || error "npm is not installed"
    command -v git >/dev/null 2>&1 || error "Git is not installed"
    command -v pm2 >/dev/null 2>&1 || error "PM2 is not installed"

    # Check environment variables
    if [ -z "$DATABASE_URI" ]; then
        error "DATABASE_URI environment variable is not set"
    fi

    if [ -z "$JWT_SECRET" ]; then
        error "JWT_SECRET environment variable is not set"
    fi
}

# Prepare deployment directory
prepare_directory() {
    log "Preparing deployment directory..."
    
    # Create directory if not exists
    mkdir -p "${DEPLOY_DIR}"
    cd "${DEPLOY_DIR}" || error "Cannot change to deployment directory"
}

# Clone repository
clone_repository() {
    log "Cloning repository..."
    
    # Remove existing repository if exists
    rm -rf .git
    
    # Clone repository
    git clone "${REPO_URL}" .
    git checkout "${BRANCH}"
}

# Install dependencies
install_dependencies() {
    log "Installing dependencies..."
    
    # Clean npm cache and install
    npm cache clean --force
    npm install
}

# Configure environment
configure_environment() {
    log "Configuring environment..."
    
    # Create config.env file
    cat > config.env << EOL
PORT=3000
NODE_ENV=production
DATABASE=${DATABASE_URI}
DATABASE_PASSWORD=${DATABASE_PASSWORD}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=90d
EMAIL_USERNAME=${EMAIL_USERNAME}
EMAIL_PASSWORD=${EMAIL_PASSWORD}
EOL

    # Set correct permissions
    chmod 600 config.env
}

# Build application
build_application() {
    log "Building application..."
    
    # Run build script or transpile
    npm run build
}

# Start application with PM2
start_application() {
    log "Starting application with PM2..."
    
    # Stop existing process if running
    pm2 delete "${PROJECT_NAME}" || true
    
    # Start with PM2
    pm2 start server.js --name "${PROJECT_NAME}" \
        --log-date-format "YYYY-MM-DD HH:mm:ss" \
        --env production
    
    # Save PM2 process list
    pm2 save
}

# Backup database
backup_database() {
    log "Creating database backup..."
    
    BACKUP_DIR="/var/backups/${PROJECT_NAME}"
    mkdir -p "${BACKUP_DIR}"
    
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    BACKUP_FILE="${BACKUP_DIR}/db_backup_${TIMESTAMP}.gz"
    
    mongodump --uri="${DATABASE_URI}" | gzip > "${BACKUP_FILE}"
}

# Main deployment function
deploy() {
    log "Starting deployment for ${PROJECT_NAME}"
    
    validate_environment
    prepare_directory
    clone_repository
    install_dependencies
    configure_environment
    build_application
    backup_database
    start_application
    
    log "Deployment completed successfully! 🚀"
}

# Rollback function
rollback() {
    log "Rolling back to previous deployment..."
    
    # Implement rollback logic
    pm2 reload "${PROJECT_NAME}"
}

# Health check
health_check() {
    log "Running health check..."
    
    # Perform HTTP health check
    HEALTH_CHECK=$(curl -sS http://localhost:3000/health || echo "FAILED")
    
    if [[ "${HEALTH_CHECK}" == "OK" ]]; then
        log "Application is healthy ✅"
    else
        error "Health check failed ❌"
        rollback
    fi
}

# Command routing
case "$1" in
    deploy)
        deploy
        health_check
        ;;
    rollback)
        rollback
        ;;
    backup)
        backup_database
        ;;
    *)
        echo "Usage: $0 {deploy|rollback|backup}"
        exit 1
esac

exit 0