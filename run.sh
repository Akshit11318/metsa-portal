#!/bin/bash

###############################################################################
# MetSA Portal - Run Script
# Simple Docker management for localhost deployment
###############################################################################

set -e  # Exit on any error

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Check if docker compose is available
if docker compose version &> /dev/null 2>&1; then
    COMPOSE="docker compose"
elif command -v docker-compose &> /dev/null; then
    COMPOSE="docker-compose"
else
    echo -e "${RED}Error: Docker Compose not found${NC}"
    exit 1
fi

# Main commands
case "${1:-start}" in
    start)
        echo -e "${BLUE}Starting MetSA Portal...${NC}"
        $COMPOSE up -d --build
        echo ""
        echo -e "${GREEN}✓ Application started!${NC}"
        echo ""
        echo "Access at: http://localhost:4556"
        echo ""
        echo "Commands:"
        echo "  ./run.sh logs    - View logs"
        echo "  ./run.sh status  - Check status"
        echo "  ./run.sh stop    - Stop services"
        ;;
    
    stop)
        echo -e "${BLUE}Stopping services...${NC}"
        $COMPOSE down
        echo -e "${GREEN}✓ Stopped${NC}"
        ;;
    
    restart)
        echo -e "${BLUE}Restarting...${NC}"
        $COMPOSE restart
        echo -e "${GREEN}✓ Restarted${NC}"
        ;;
    
    logs)
        $COMPOSE logs -f --tail=100
        ;;
    
    status)
        $COMPOSE ps
        ;;
    
    build)
        echo -e "${BLUE}Rebuilding images...${NC}"
        $COMPOSE build
        echo -e "${GREEN}✓ Built${NC}"
        ;;
    
    clean)
        echo -e "${BLUE}Cleaning up...${NC}"
        $COMPOSE down -v
        docker rmi metsa-portal-backend metsa-portal-frontend 2>/dev/null || true
        echo -e "${GREEN}✓ Cleaned${NC}"
        ;;
    
    *)
        echo "MetSA Portal - Run Script"
        echo ""
        echo "Usage: ./run.sh [command]"
        echo ""
        echo "Commands:"
        echo "  start    - Start services (default)"
        echo "  stop     - Stop services"
        echo "  restart  - Restart services"
        echo "  logs     - View logs"
        echo "  status   - Show status"
        echo "  build    - Rebuild images"
        echo "  clean    - Remove everything"
        ;;
esac
