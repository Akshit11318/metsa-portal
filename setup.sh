#!/bin/bash

###############################################################################
# MetSA Portal - Setup Script
# This script initializes the database and creates default admin accounts
# with secure randomly generated passwords
###############################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to generate secure 12-character alphanumeric password
generate_password() {
    cat /dev/urandom | tr -dc 'A-Za-z0-9' | fold -w 12 | head -n 1
}

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

# Main setup function
main() {
    print_header "MetSA Portal - Initial Setup"
    
    # Check if we're in the right directory
    if [ ! -f "backend/package.json" ]; then
        print_error "Please run this script from the project root directory"
        exit 1
    fi
    
    # Navigate to backend directory
    cd backend
    
    print_info "Installing backend dependencies..."
    npm install
    print_success "Backend dependencies installed"
    
    # Generate Prisma client
    print_info "Generating Prisma client..."
    npx prisma generate
    print_success "Prisma client generated"
    
    # Check if database exists and backup if it does
    if [ -f "prisma/dev.db" ]; then
        BACKUP_NAME="prisma/dev.db.backup.$(date +%Y%m%d_%H%M%S)"
        print_warning "Existing database found. Creating backup at $BACKUP_NAME"
        cp prisma/dev.db "$BACKUP_NAME"
    fi
    
    # Reset database (drop all tables and recreate)
    print_info "Resetting database and applying migrations..."
    npx prisma migrate reset --force --skip-seed
    print_success "Database reset complete"
    
    # Generate secure passwords for default accounts
    print_header "Creating Default Admin Accounts"
    
    ADMIN_PASSWORD=$(generate_password)
    CORE_PASSWORD=$(generate_password)
    MEMBER_PASSWORD=$(generate_password)
    
    # Create .env file with secure JWT secret if it doesn't exist
    if [ ! -f ".env" ]; then
        print_info "Creating .env file..."
        JWT_SECRET=$(cat /dev/urandom | tr -dc 'A-Za-z0-9!@#$%^&*()_+-=' | fold -w 64 | head -n 1)
        cat > .env << EOF
# Server Configuration
NODE_ENV=production
PORT=5000

# Database
DATABASE_URL="file:./dev.db"

# JWT Secret (randomly generated)
JWT_SECRET=${JWT_SECRET}

# Default Year
DEFAULT_YEAR=2025

# CORS - Production domain
CORS_ORIGIN=https://metsa.kryptolo121.xyz

# CSRF Protection
CSRF_ENABLED=true
CSRF_SECRET=$(cat /dev/urandom | tr -dc 'A-Za-z0-9!@#$%^&*()_+-=' | fold -w 32 | head -n 1)
EOF
        print_success ".env file created with secure secrets"
    else
        print_warning ".env file already exists. Please update CORS_ORIGIN and CSRF settings manually if needed."
    fi
    
    # Create custom seed script with generated passwords
    print_info "Creating accounts with secure passwords..."
    
    cat > prisma/setup-seed.js << 'SEED_SCRIPT'
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    const adminPassword = process.env.ADMIN_PASSWORD;
    const corePassword = process.env.CORE_PASSWORD;
    const memberPassword = process.env.MEMBER_PASSWORD;
    
    // Hash passwords
    const adminHash = await bcrypt.hash(adminPassword, 10);
    const coreHash = await bcrypt.hash(corePassword, 10);
    const memberHash = await bcrypt.hash(memberPassword, 10);
    
    // Create admin user
    const admin = await prisma.user.create({
        data: {
            username: 'admin',
            email: 'admin@metsa.kryptolo121.xyz',
            password: adminHash,
            role: 'admin',
            core: 'Operations',
            isCore: true,
            year: '2025',
        },
    });
    console.log('Created admin user:', admin.username);
    
    // Create core user
    const core = await prisma.user.create({
        data: {
            username: 'core_member',
            email: 'core@metsa.kryptolo121.xyz',
            password: coreHash,
            role: 'user',
            core: 'Technical',
            isCore: true,
            year: '2025',
        },
    });
    console.log('Created core user:', core.username);
    
    // Create regular member
    const member = await prisma.user.create({
        data: {
            username: 'member',
            email: 'member@metsa.kryptolo121.xyz',
            password: memberHash,
            role: 'user',
            core: 'Events',
            isCore: false,
            year: '2025',
        },
    });
    console.log('Created member user:', member.username);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
SEED_SCRIPT
    
    # Run seed script with passwords as environment variables
    ADMIN_PASSWORD="$ADMIN_PASSWORD" CORE_PASSWORD="$CORE_PASSWORD" MEMBER_PASSWORD="$MEMBER_PASSWORD" node prisma/setup-seed.js
    print_success "Default accounts created"
    
    # Clean up temporary seed script
    rm -f prisma/setup-seed.js
    
    # Return to root directory
    cd ..
    
    # Setup frontend
    print_header "Setting Up Frontend"
    cd frontend
    
    print_info "Installing frontend dependencies..."
    npm install
    print_success "Frontend dependencies installed"
    
    # Create production .env file for frontend
    print_info "Creating frontend environment configuration..."
    cat > .env.production << EOF
VITE_API_URL=https://metsa.kryptolo121.xyz/api
VITE_APP_NAME=MetSA Portal
VITE_APP_DOMAIN=metsa.kryptolo121.xyz
EOF
    print_success "Frontend configuration created"
    
    cd ..
    
    # Create credentials file
    CREDENTIALS_FILE="credentials.txt"
    print_header "Setup Complete!"
    
    cat > "$CREDENTIALS_FILE" << EOF
═══════════════════════════════════════════════════════
  MetSA Portal - Default Account Credentials
═══════════════════════════════════════════════════════

ADMIN ACCOUNT
-------------
Username: admin
Email:    admin@metsa.kryptolo121.xyz
Password: ${ADMIN_PASSWORD}
Role:     Administrator
Core:     Operations

CORE MEMBER ACCOUNT
-------------------
Username: core_member
Email:    core@metsa.kryptolo121.xyz
Password: ${CORE_PASSWORD}
Role:     User (Core Member)
Core:     Technical

REGULAR MEMBER ACCOUNT
----------------------
Username: member
Email:    member@metsa.kryptolo121.xyz
Password: ${MEMBER_PASSWORD}
Role:     User (Regular Member)
Core:     Events

═══════════════════════════════════════════════════════
IMPORTANT SECURITY NOTES:
═══════════════════════════════════════════════════════

1. These passwords are randomly generated and secure
2. SAVE THIS FILE IN A SECURE LOCATION
3. Change these passwords after first login
4. Delete this file after saving credentials securely
5. JWT and CSRF secrets are stored in backend/.env
6. CSRF protection is enabled for production

Next Steps:
-----------
1. Save this credentials file securely
2. Review backend/.env for security settings
3. Run './run.sh' to start the application
4. Login with admin credentials
5. Change all default passwords immediately

Application will be available at:
https://metsa.kryptolo121.xyz

═══════════════════════════════════════════════════════
EOF
    
    print_success "Credentials saved to $CREDENTIALS_FILE"
    print_warning "IMPORTANT: Save this file securely and delete it after copying credentials!"
    
    echo ""
    print_info "Default accounts created:"
    echo -e "  ${GREEN}•${NC} admin (Administrator)"
    echo -e "  ${GREEN}•${NC} core_member (Core Member)"
    echo -e "  ${GREEN}•${NC} member (Regular Member)"
    echo ""
    print_info "Credentials file: ${GREEN}$CREDENTIALS_FILE${NC}"
    echo ""
    print_success "Setup complete! Run './run.sh' to start the application."
    echo ""
}

# Run main function
main
