#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

# Ensure database file has correct permissions
if [ -f /app/prisma/dev.db ]; then
    chmod 666 /app/prisma/dev.db
    chmod 777 /app/prisma
fi

echo "Checking if database needs seeding..."
if [ ! -f /app/prisma/.seeded ]; then
    echo "Seeding database..."
    npx prisma db seed
    touch /app/prisma/.seeded
    echo "Database seeded successfully"
else
    echo "Database already seeded, skipping..."
fi

echo "Starting server..."
exec node src/server.js
