#!/bin/bash
# Production startup script for Render deployment
# This script ensures database schema is synced and default users exist before starting the server

set -e  # Exit on error

echo "🚀 Starting PharmaOS backend deployment..."

# Step 1: Sync database schema with Prisma schema
echo "📊 Syncing database schema..."
npx prisma db push --accept-data-loss

# Step 2: Seed or update demo data
echo "👤 Checking for existing users..."
USER_COUNT=$(node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.user.count().then(count => {
  console.log(count);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
")

if [ "$USER_COUNT" -eq 0 ]; then
  echo "🌱 No users found. Seeding demo data..."
  npm run seed
else
  echo "✅ Found $USER_COUNT existing users. Updating demo data..."
  npm run update-demo
fi

# Step 3: Start the server
echo "🔧 Starting server..."
node server.js
