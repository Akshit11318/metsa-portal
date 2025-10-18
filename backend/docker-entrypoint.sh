#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

echo "Checking if database needs seeding..."
# Check if users exist by trying to count them
USER_COUNT=$(node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.count()
  .then(count => { console.log(count); process.exit(0); })
  .catch(() => { console.log(0); process.exit(0); });
" 2>/dev/null || echo "0")

if [ "$USER_COUNT" = "0" ]; then
    echo "Database is empty. Seeding database..."
    npx prisma db seed
    echo "Database seeded successfully"
else
    echo "Database already has $USER_COUNT users, skipping seed..."
fi

echo "Starting server..."
exec node src/server.js
