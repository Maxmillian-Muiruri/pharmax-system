# PharmaOS - Clean Deployment Guide

## Project Status ✅

The project has been **reverted to a clean state** with all Railway-specific configurations removed. 

### What Was Removed
- ❌ `railway.json` - Railway deployment config
- ❌ `build.sh` - Railway build script  
- ❌ All Railway-specific modifications to package.json
- ❌ All Railway-specific modifications to server.js

### What Remains (Clean & Portable)
- ✅ `package.json` - Monorepo root with standard scripts
- ✅ `backend/package.json` - Clean backend config
- ✅ `backend/server.js` - Simple startup, no custom deployment logic
- ✅ All source code unchanged
- ✅ `.env.example` files for reference
- ✅ Prisma schema and migrations intact

---

## Local Development Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL running locally
- npm or yarn

### Step 1: Install Dependencies
```bash
cd pharma-os
npm install  # Installs monorepo workspaces
```

### Step 2: Set Up Environment Files

**Backend (.env)**
```bash
# backend/.env
DATABASE_URL="postgresql://postgres:admin@localhost:5432/pharmaos"
PORT=3000
CLIENT_URL="http://localhost:5173"
NODE_ENV="development"
LOW_STOCK_THRESHOLD=10
NEAR_EXPIRY_DAYS=7
JWT_SECRET="pharmaos_super_secret_jwt_key_2026_tech_vanguard"
JWT_EXPIRES_IN="7d"
```

**Frontend (.env)**
```bash
# frontend/.env
VITE_API_URL=http://localhost:3000/api
```

### Step 3: Run Database Migrations
```bash
cd backend
npx prisma migrate dev --name init
npm run seed  # Optional: populate test data
cd ..
```

### Step 4: Start Development Servers

**Option A: Separate terminals**
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

**Option B: Single command (if on Windows/PowerShell)**
```bash
npm run dev:backend-dev:frontend  # Runs both in parallel
```

### Verify It's Running
- Backend: http://localhost:3000 (API)
- Frontend: http://localhost:5173 (React app)
- Health check: http://localhost:3000/health

---

## Build for Production

### Generate Production Build
```bash
npm run build
```

This runs:
1. Frontend build (Vite compilation) → `frontend/dist/`
2. Backend build (Prisma generation) → `backend/.prisma/client/`

### Output Structure
```
frontend/dist/           # Static HTML/CSS/JS files
backend/                 # Ready to run with node server.js
```

---

## Deployment to Any Hosting Service

### Generic Deployment Steps

#### 1. Environment Configuration
Set these environment variables on your hosting platform:
```
DATABASE_URL          = postgresql://username:password@host:5432/dbname
PORT                  = 3000 (or auto-assigned)
NODE_ENV              = production
CLIENT_URL            = https://your-domain.com
VITE_API_URL          = https://your-domain.com/api
JWT_SECRET            = <your-secret-key>
JWT_EXPIRES_IN        = 7d
LOW_STOCK_THRESHOLD   = 10
NEAR_EXPIRY_DAYS      = 7
```

#### 2. Build Process
Your hosting platform should run:
```bash
npm install
npm run build
```

#### 3. Start Process
Your hosting platform should run:
```bash
npm run start
```

Which runs `npm start -w backend` → starts backend server on :3000

#### 4. Static Files
The backend serves frontend from `frontend/dist/` automatically (see `backend/src/app.js` for the static file serving configuration).

---

## Platform-Specific Examples

### Vercel
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".",
  "env": {
    "DATABASE_URL": "postgresql://...",
    "VITE_API_URL": "https://your-app.vercel.app/api"
  }
}
```

### Heroku
```bash
heroku config:set DATABASE_URL=postgresql://...
heroku config:set NODE_ENV=production
git push heroku main
```

### Render.com
```yaml
services:
  - type: web
    name: pharmaos
    env: node
    buildCommand: npm run build
    startCommand: npm run start
    envVars:
      - key: DATABASE_URL
        fromDatabase: true
```

### Docker (Any Platform)
```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY . .

RUN npm ci
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

### DigitalOcean App Platform
```yaml
name: pharmaos
services:
- name: api
  github:
    repo: Skillyme-Cohort-1/pharmaOS
    branch: main
  build_command: npm run build
  run_command: npm run start
  envs:
  - key: DATABASE_URL
    source: DATABASE
  - key: NODE_ENV
    value: production
```

---

## Project Structure

```
pharma-os/
├── package.json                 # Monorepo root (npm workspaces)
├── backend/
│   ├── package.json            # Backend scripts & dependencies
│   ├── server.js               # Entry point (clean, simple)
│   ├── src/
│   │   ├── app.js              # Express app (serves static files)
│   │   ├── routes/             # API endpoints
│   │   ├── controllers/        # Business logic
│   │   ├── middleware/         # Error handling, auth, etc.
│   │   ├── jobs/               # Cron jobs (expiry scanner)
│   │   └── utils/              # Utilities
│   ├── prisma/
│   │   ├── schema.prisma       # Database schema
│   │   └── migrations/         # Database migrations
│   ├── .env                    # Local development env (not committed)
│   └── .env.example            # Template for env vars
├── frontend/
│   ├── package.json            # Frontend scripts & dependencies
│   ├── src/
│   │   ├── App.jsx             # Main React component
│   │   ├── pages/              # Route components
│   │   ├── components/         # Reusable components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── services/           # API calls (Axios)
│   │   ├── context/            # Global state
│   │   └── utils/              # Utilities
│   ├── dist/                   # Built files (generated)
│   ├── .env                    # Local development env (not committed)
│   └── .env.example            # Template for env vars
└── docs/                       # Documentation
```

---

## Available Scripts

### Root Level
```bash
npm run dev:backend       # Run backend in dev mode (with nodemon)
npm run dev:frontend      # Run frontend in dev mode (with hot reload)
npm run build:backend     # Build backend (Prisma generate)
npm run build:frontend    # Build frontend (Vite)
npm run build             # Build both
npm run start:backend     # Start backend (production)
npm run start             # Same as start:backend
```

### Backend Only
```bash
cd backend
npm run dev              # Start with nodemon (hot reload)
npm run start            # Start production server
npm run build            # Generate Prisma client
npm run seed             # Populate database with test data
npx prisma migrate dev   # Create and apply migrations
npx prisma studio       # Open visual database browser
```

### Frontend Only
```bash
cd frontend
npm run dev              # Start dev server with hot reload
npm run build            # Build for production
npm run preview          # Preview production build locally
```

---

## Database Management

### First Time Setup
```bash
cd backend
npx prisma migrate dev --name init    # Creates initial migration
npm run seed                          # Populates test data
```

### Adding New Schema Changes
```bash
cd backend
npx prisma migrate dev --name feature_name  # Creates new migration
```

### Apply Migrations (Production)
```bash
cd backend
npx prisma migrate deploy              # Applies pending migrations
```

---

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running: `pg_isready -h localhost`
- Check DATABASE_URL format: `postgresql://user:password@localhost:5432/dbname`
- Verify database exists: `createdb pharmaos`

### Build Fails
- Ensure Node.js 18+ installed: `node --version`
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Prisma schema: `npx prisma validate`

### Frontend Can't Reach Backend
- Verify VITE_API_URL is correct (with `/api` at end)
- Check backend is running on expected port
- Verify CORS is enabled in `backend/src/app.js`

### Port Already in Use
```bash
# On Linux/Mac
lsof -i :3000
kill -9 <PID>

# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

---

## Security Notes

- ⚠️ Never commit `.env` files (already in `.gitignore`)
- ⚠️ Use strong JWT_SECRET in production (generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- ⚠️ Set `NODE_ENV=production` on production servers
- ⚠️ Use HTTPS in production (hosting platform provides this)
- ⚠️ Rotate JWT secrets periodically

---

## Next Steps

1. **Test Locally** - Ensure everything works on your machine
2. **Choose Hosting** - Pick your deployment platform
3. **Set Environment Variables** - Configure for your platform
4. **Deploy** - Push to your hosting service
5. **Monitor** - Check logs and health checks

For specific hosting platform help, refer to their documentation or ask your DevOps team.

---

**Project Status:** ✅ Clean, portable, ready for any deployment  
**Last Updated:** 2026-04-04  
**Maintainers:** Tech Vanguard Team
