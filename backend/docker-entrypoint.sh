#!/bin/sh
set -e

# Supabase 直接接続: DATABASE_URL は Secret Manager から注入済み
# Cloud SQL Proxy は使用しないため URL 書き換え不要

echo "Running database migrations..."
npx prisma migrate deploy --schema=./prisma/schema.prisma

echo "Seeding database..."
node dist/prisma/seed.js

echo "Starting application..."
exec node dist/main.js

