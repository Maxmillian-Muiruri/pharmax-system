# PharmaOS Database Setup Guide

PharmaOS requires PostgreSQL database to run. Follow one of the options below to set up your database.

---

## Quick Start Checklist

- [ ] Install PostgreSQL (choose one option below)
- [ ] Create database named `pharmaos`
- [ ] Update `backend/.env` with correct DATABASE_URL
- [ ] Run migrations: `cd backend && npx prisma migrate dev --name init`
- [ ] Seed database: `cd backend && npm run seed`

---

## Option 1: Docker (Recommended - Easiest) ⭐

If you have Docker Desktop installed, this is the quickest way.

### Step 1: Install Docker Desktop (if not installed)

Download from: https://www.docker.com/products/docker-desktop/

### Step 2: Run PostgreSQL Container

Open Command Prompt or PowerShell and run:

```bash
docker run --name pharmaos-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=pharmaos -p 5432:5432 -d postgres:15
```

### Step 3: Verify Database is Running

```bash
docker ps
```

You should see `pharmaos-db` in the list.

### Step 4: Update backend/.env

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pharmaos"
```

### Useful Docker Commands

```bash
# Stop the database
docker stop pharmaos-db

# Start the database
docker start pharmaos-db

# View logs
docker logs pharmaos-db

# Remove the database (deletes all data!)
docker rm -f pharmaos-db
```

**Pros:** 
- No installation needed
- Easy to start/stop
- Isolated from your system
- Can delete and recreate easily

**Cons:**
- Requires Docker Desktop
- Database resets if container is removed

---

## Option 2: PostgreSQL Official Installer (Traditional)

### Step 1: Download PostgreSQL

Visit: https://www.postgresql.org/download/windows/

Download and run the installer for **PostgreSQL 15** or **16**.

### Step 2: Run Installer

1. Run the downloaded installer
2. Keep default installation directory
3. **Important:** Remember the password you set for `postgres` user (default superuser)
4. Keep default port: `5432`
5. Select default locale (English)
6. Complete installation

### Step 3: Create Database

Open **pgAdmin** (installed with PostgreSQL) or use command line:

**Using pgAdmin:**
1. Open pgAdmin 4
2. Connect to PostgreSQL (use password you set)
3. Right-click "Databases" → Create → Database
4. Name: `pharmaos`
5. Click Save

**Using Command Line:**
```bash
# Navigate to PostgreSQL bin folder
cd "C:\Program Files\PostgreSQL\15\bin"

# Create database
psql -U postgres -c "CREATE DATABASE pharmaos;"
```

### Step 4: Update backend/.env

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/pharmaos"
```

Replace `YOUR_PASSWORD` with the password you set during installation.

### Step 5: Verify Connection

```bash
cd backend
npx prisma db pull
```

If successful, you'll see the database schema.

---

## Option 3: EnterpriseDB Installer (with pgAdmin GUI)

### Step 1: Download

Visit: https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

Download PostgreSQL 15 or 16 for Windows.

### Step 2: Install

1. Run the installer
2. Accept default components (includes pgAdmin)
3. Set password for `postgres` user
4. Keep port `5432`
5. Complete installation

### Step 3: Create Database via pgAdmin

1. Open pgAdmin 4 (from Start menu)
2. Expand "Servers" → "PostgreSQL 15"
3. Right-click "Databases" → Create → Database
4. Database name: `pharmaos`
5. Owner: `postgres`
6. Click Save

### Step 4: Update backend/.env

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/pharmaos"
```

---

## After Database Setup

### 1. Run Migrations

```bash
cd backend
npx prisma migrate dev --name init
```

Expected output:
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "pharmaos"

Applying migration `20260401000000_init`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20260401000000_init/
    └─ migration.sql

Your database is now in sync with your schema.
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Seed Database

```bash
npm run seed
```

Expected output:
```
🌱 Starting seed...
🗑️  Cleared existing data
✅ Created 24 products
✅ Created 16 orders
✅ Created 7 transactions
✅ Created alerts for expired and near-expiry products
🎉 Seed complete!
```

### 4. Start Backend

```bash
npm run dev
```

Expected output:
```
🚀 PharmaOS API running on port 3000
📊 Environment: development
🔗 Health check: http://localhost:3000/health
[EXPIRY SCAN] Scheduler started - runs daily at midnight
```

### 5. Verify Backend

Open browser: http://localhost:3000/health

Should return:
```json
{
  "status": "ok",
  "timestamp": "2026-04-01T10:00:00.000Z"
}
```

---

## Troubleshooting

### Error: Can't reach database server at localhost:5432

**Cause:** PostgreSQL service is not running.

**Solution (Docker):**
```bash
docker start pharmaos-db
```

**Solution (Installed PostgreSQL):**
1. Press `Win + R`, type `services.msc`
2. Find "postgresql-x64-15" service
3. Right-click → Start

### Error: Database "pharmaos" does not exist

**Solution:**
```bash
# Using psql
psql -U postgres
CREATE DATABASE pharmaos;
\q
```

### Error: Authentication failed for user "postgres"

**Solution:** Update `DATABASE_URL` in `backend/.env` with correct password.

### Port 5432 already in use

**Solution:** Another service is using port 5432. Either:
1. Stop the other service, or
2. Change PostgreSQL port in postgresql.conf, or
3. Use Docker with different port: `-p 5433:5432`

---

## Environment Variables Reference

### backend/.env

```env
# Database connection
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pharmaos"

# Server port
PORT=3000

# Frontend URL (for CORS)
CLIENT_URL="http://localhost:5173"

# Environment
NODE_ENV="development"

# Business logic thresholds
LOW_STOCK_THRESHOLD=10
NEAR_EXPIRY_DAYS=7
```

---

## Database Schema

PharmaOS uses 4 tables:

1. **Product** - Inventory items
2. **Order** - Customer orders
3. **Transaction** - Financial records
4. **Alert** - System notifications

Tables are created automatically by Prisma migrations.

---

## Next Steps

After database setup is complete:

1. ✅ Verify backend starts without errors
2. ✅ Check health endpoint responds
3. ✅ Start frontend: `cd frontend && npm run dev`
4. ✅ Open http://localhost:5173 in browser
5. ✅ Verify dashboard shows data from seeded database

---

**Need Help?**

- Check `README.md` for full setup instructions
- Check `API.md` for API documentation
- Check `STATUS.md` for implementation details

**PharmaOS** - Tech Vanguard © 2026
