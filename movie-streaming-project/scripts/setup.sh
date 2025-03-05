#!/bin/bash

# Movie Streaming Platform Setup Script
# Automates project initialization and environment setup

# Color Codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project Configuration
PROJECT_NAME="movie-streaming-backend"
REPO_URL="https://github.com/yourusername/movie-streaming-backend.git"
NODE_VERSION="18.x"

# Logging Functions
log() {
    echo -e "${GREEN}[SETUP] ${1}${NC}"
}

warn() {
    echo -e "${YELLOW}[WARNING] ${1}${NC}"
}

error() {
    echo -e "${RED}[ERROR] ${1}${NC}"
    exit 1
}

# Check System Requirements
check_system_requirements() {
    log "Checking system requirements..."

    # Check OS
    OSTYPE=$(uname -s)
    case "$OSTYPE" in
        Linux*)     OS="Linux";;
        Darwin*)    OS="macOS";;
        MINGW*)     OS="Windows";;
        *)          error "Unsupported operating system";;
    esac

    log "Detected OS: ${OS}"

    # Check required tools
    TOOLS=("git" "curl" "wget")
    for tool in "${TOOLS[@]}"; do
        if ! command -v "$tool" &> /dev/null; then
            error "$tool is not installed"
        fi
    done
}

# Install Node.js and npm
install_nodejs() {
    log "Installing Node.js ${NODE_VERSION}..."

    case "$OS" in
        Linux*)
            # Use NVM for Node.js installation
            if ! command -v nvm &> /dev/null; then
                log "Installing NVM..."
                curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
                
                # Source NVM
                export NVM_DIR="$HOME/.nvm"
                [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
                [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"
            fi

            nvm install "${NODE_VERSION}"
            nvm use "${NODE_VERSION}"
            ;;

        macOS*)
            # Use Homebrew for macOS
            if ! command -v brew &> /dev/null; then
                /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            fi
            brew install node@"${NODE_VERSION}"
            ;;

        Windows*)
            # Use Chocolatey for Windows
            if ! command -v choco &> /dev/null; then
                warn "Chocolatey not found. Please install Chocolatey first."
                return 1
            fi
            choco install nodejs-lts
            ;;
    esac

    log "Node.js and npm installed successfully"
}

# Clone Repository
clone_repository() {
    log "Cloning project repository..."
    
    if [ -d "${PROJECT_NAME}" ]; then
        warn "Project directory already exists. Skipping clone."
        return 0
    fi

    git clone "${REPO_URL}" "${PROJECT_NAME}"
    cd "${PROJECT_NAME}" || error "Failed to change directory"
}

# Install Project Dependencies
install_dependencies() {
    log "Installing project dependencies..."
    
    npm install
    npm install -g pm2 nodemon jest
}

# Create Environment Configuration
create_environment() {
    log "Creating environment configuration..."

    # Check if config.env exists
    if [ ! -f "config.env" ]; then
        cat > config.env << EOL
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE=mongodb://localhost:27017/movie_streaming
DATABASE_PASSWORD=

# Authentication
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=90d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=
EMAIL_PASSWORD=

# Security
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=3600000
EOL
        log "Generated default config.env"
    else
        warn "config.env already exists. Skipping generation."
    fi
}

# Install MongoDB (Optional)
install_mongodb() {
    log "Setting up MongoDB..."

    case "$OS" in
        Linux*)
            # Ubuntu/Debian installation
            wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
            echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
            sudo apt-get update
            sudo apt-get install -y mongodb-org
            sudo systemctl start mongod
            ;;

        macOS*)
            brew tap mongodb/brew
            brew install mongodb-community
            brew services start mongodb-community
            ;;

        Windows*)
            choco install mongodb
            ;;
    esac
}

# Development Environment Setup
setup_dev_environment() {
    log "Configuring development environment..."

    # Git hooks
    npm run prepare

    # Install pre-commit hooks
    if [ -f ".husky/pre-commit" ]; then
        chmod +x .husky/pre-commit
    fi
}

# Run Initial Tests
run_initial_tests() {
    log "Running initial tests..."
    npm test
}

# Main Setup Function
main() {
    check_system_requirements
    install_nodejs
    clone_repository
    install_dependencies
    create_environment
    install_mongodb
    setup_dev_environment
    run_initial_tests

    log "🚀 Project setup complete!"
    log "Next steps:"
    log "1. Update config.env with your specific configurations"
    log "2. Run 'npm run start:dev' to start the development server"
}

# Execute main setup function
main

exit 0