#!/bin/bash

# MetSA Portal Backend Setup Script
# This script sets up the backend environment and database

echo "╔════════════════════════════════════════════╗"
echo "║  MetSA Portal Backend Setup Script        ║"
echo "╚════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ npm version: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📄 Creating .env file from .env.example..."
    cp .env.example .env
    echo "✅ .env file created"
    echo "⚠️  Please update the JWT_SECRET in .env file before running in production"
else
    echo "✅ .env file already exists"
fi
echo ""

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma Client"
    exit 1
fi

echo "✅ Prisma Client generated successfully"
echo ""

# Run migrations
echo "🗄️  Running database migrations..."
npx prisma migrate deploy

if [ $? -ne 0 ]; then
    echo "⚠️  Migration failed, trying to create database..."
    npx prisma migrate dev --name init
fi

echo "✅ Database migrations completed"
echo ""

# Seed database
echo "🌱 Seeding database with initial data..."
node prisma/seed.js

if [ $? -ne 0 ]; then
    echo "❌ Failed to seed database"
    exit 1
fi

echo "✅ Database seeded successfully"
echo ""

echo "╔════════════════════════════════════════════╗"
echo "║  Setup completed successfully! 🎉         ║"
echo "╚════════════════════════════════════════════╝"
echo ""
echo "📌 Next steps:"
echo "   1. Review and update .env file (especially JWT_SECRET)"
echo "   2. Run 'npm run dev' to start development server"
echo "   3. Run 'npm start' to start production server"
echo ""
echo "📝 Default login credentials:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "📚 For more information, check README.md and API_DOCS.md"
echo ""
