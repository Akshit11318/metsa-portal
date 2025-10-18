#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma migrate deploy

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
