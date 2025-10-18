#!/bin/bash

###############################################################################
# MetSA Portal - Run Script
# This script builds and runs the application in Docker with Cloudflare Tunnel
###############################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="metsa.kryptolo121.xyz"
APP_PORT="4556"

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "\n${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}\n"
}

# Function to check if docker-compose is available
check_docker_compose() {
    print_info "Checking Docker Compose installation..."
    
    if docker compose version &> /dev/null; then
        COMPOSE_CMD="docker compose"
    elif command -v docker-compose &> /dev/null; then
        COMPOSE_CMD="docker-compose"
    else
        print_error "Docker Compose is not installed. Please install Docker Compose."
        echo "Visit: https://docs.docker.com/compose/install/"
        exit 1
    fi
    
    print_success "Docker Compose is available"
}

# Function to build Docker images
build_images() {
    print_header "Building Docker Images"
    
    print_info "Building backend image..."
    $COMPOSE_CMD build backend
    print_success "Backend image built"
    
    print_info "Building frontend image..."
    $COMPOSE_CMD build frontend
    print_success "Frontend image built"
}

# Function to start services
start_services() {
    print_header "Starting Services"
    
    print_info "Starting Docker containers..."
    $COMPOSE_CMD up -d
    
    print_success "All services started"
    echo ""
    print_info "Services running:"
    $COMPOSE_CMD ps
}

# Function to show logs
show_logs() {
    print_header "Service Logs"
    print_info "Showing recent logs (Ctrl+C to exit)..."
    echo ""
    $COMPOSE_CMD logs -f --tail=50
}

# Function to stop services
stop_services() {
    print_header "Stopping Services"
    print_info "Stopping Docker containers..."
    $COMPOSE_CMD down
    print_success "All services stopped"
}

# Function to restart services
restart_services() {
    stop_services
    start_services
}

# Function to view status
show_status() {
    print_header "Service Status"
    $COMPOSE_CMD ps
    echo ""
    print_info "To view logs: ./run.sh logs"
    print_info "To stop services: ./run.sh stop"
    print_info "To restart services: ./run.sh restart"
}

# Function to show help
show_help() {
    cat << EOF
MetSA Portal - Run Script

Usage: ./run.sh [COMMAND]

Commands:
  start       Build and start all services (default)
  stop        Stop all services
  restart     Restart all services
  logs        View service logs (follow mode)
  status      Show service status
  build       Rebuild Docker images
  clean       Stop services and remove containers, volumes, and images
  help        Show this help message

Examples:
  ./run.sh              # Start all services
  ./run.sh logs         # View logs
  ./run.sh restart      # Restart all services
  ./run.sh clean        # Clean up everything

Environment:
  Local Port: $APP_PORT
  Domain: $DOMAIN
  
Note: Configure your Cloudflare tunnel to forward to http://localhost:$APP_PORT

EOF
}

# Function to clean up everything
clean_all() {
    print_header "Cleaning Up"
    print_warning "This will remove all containers, volumes, and images!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cleanup cancelled"
        exit 0
    fi
    
    print_info "Stopping and removing containers..."
    $COMPOSE_CMD down -v
    
    print_info "Removing Docker images..."
    docker rmi metsa-portal-backend metsa-portal-frontend 2>/dev/null || true
    
    print_success "Cleanup complete"
}

# Main script
main() {
    # Parse command
    COMMAND=${1:-start}
    
    case $COMMAND in
        start)
            print_header "MetSA Portal - Starting Application"
            check_docker
            check_docker_compose
            build_images
            start_services
            echo ""
            print_success "Application is running!"
            echo ""
            print_info "Local access: ${GREEN}http://localhost:$APP_PORT${NC}"
            print_info "Your Cloudflare tunnel should forward to: ${GREEN}http://localhost:$APP_PORT${NC}"
            print_info "Public URL: ${GREEN}https://$DOMAIN${NC}"
            echo ""
            print_info "Useful commands:"
            echo "  ./run.sh logs      - View service logs"
            echo "  ./run.sh status    - Check service status"
            echo "  ./run.sh stop      - Stop all services"
            echo ""
            ;;
        stop)
            stop_services
            ;;
        restart)
            restart_services
            ;;
        logs)
            show_logs
            ;;
        status)
            show_status
            ;;
        build)
            check_docker
            check_docker_compose
            build_images
            ;;
        clean)
            clean_all
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "Unknown command: $COMMAND"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
