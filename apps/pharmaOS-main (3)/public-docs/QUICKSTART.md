# 🚀 PharmaOS - Quick Start Reference

## Local Development (5 Minutes Setup)

```bash
# 1. Install dependencies
npm install

# 2. Set up .env files (copy from .env.example)
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Set up database
cd backend
npx prisma migrate dev --name init
npm run seed
cd ..

# 4. Start services
npm run dev:backend     # Terminal 1
npm run dev:frontend    # Terminal 2
```

**URLs:**
- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- API: http://localhost:3000/api
- Health: http://localhost:3000/health

---

## Production Build

```bash
npm run build           # Builds both frontend and backend
npm run start           # Starts the server
```

---

## Deploy to Any Platform

### 1. Set Environment Variables
```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
PORT=3000
NODE_ENV=production
CLIENT_URL=https://your-domain.com
VITE_API_URL=https://your-domain.com/api
JWT_SECRET=<your-secret>
```

### 2. Run Build Command
```bash
npm install
npm run build
```

### 3. Run Start Command
```bash
npm run start
```

---

## Platform-Specific Commands

### Vercel
```bash
# Uses package.json build/start automatically
vercel deploy
```

### Heroku
```bash
heroku create
heroku config:set DATABASE_URL=postgresql://...
git push heroku main
```

### Render
```bash
# Set in dashboard:
# Build: npm run build
# Start: npm run start
```

### Docker
```bash
docker build -t pharmaos .
docker run -p 3000:3000 -e DATABASE_URL=... pharmaos
```

---

## Key Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev:backend` | Backend dev (hot reload) |
| `npm run dev:frontend` | Frontend dev (hot reload) |
| `npm run build:backend` | Build backend |
| `npm run build:frontend` | Build frontend |
| `npm run build` | Build both |
| `npm run start` | Start production server |
| `npm run seed` | Populate test data |

---

## Project Structure

```
pharma-os/
├── backend/              # Express API + Prisma
│   ├── src/app.js       # Serves static frontend
│   ├── server.js        # Entry point
│   └── prisma/          # Database schema
├── frontend/            # React app
│   └── src/             # React components
└── docs/                # Documentation
```

---

## Environment Variables

| Variable | Example | Required |
|----------|---------|----------|
| DATABASE_URL | `postgresql://localhost/pharmaos` | ✅ |
| PORT | `3000` | No (default: 3000) |
| NODE_ENV | `development` or `production` | No |
| CLIENT_URL | `http://localhost:5173` | Dev only |
| VITE_API_URL | `http://localhost:3000/api` | ✅ Frontend |
| JWT_SECRET | Random 32 chars | ✅ Production |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Port 3000 in use | `lsof -i :3000 && kill -9 <PID>` |
| DB connection fails | Check `DATABASE_URL` format |
| Prisma schema error | Run `npx prisma validate` |
| Frontend shows old API URL | Set `VITE_API_URL` correctly |
| Build fails | Delete `node_modules` and run `npm install` |

---

## Documentation

- **Detailed Setup:** See `DEPLOYMENT_GUIDE.md`
- **Platform Guides:** See `DEPLOYMENT_GUIDE.md` (Platform-Specific Examples section)
- **Troubleshooting:** See `DEPLOYMENT_GUIDE.md`
- **Full Status:** See `RESET_COMPLETE.md`

---

## What's Included

✅ React 18 frontend with Vite  
✅ Express backend with Prisma ORM  
✅ PostgreSQL database  
✅ JWT authentication  
✅ API routes for products, orders, analytics, etc.  
✅ Database migrations setup  
✅ Seed data included  
✅ Error handling & validation  
✅ CORS configured  
✅ Static file serving (frontend from backend)  

---

## Project Status

✅ Clean (no platform-specific code)  
✅ Platform-agnostic (deploy anywhere)  
✅ Production-ready  
✅ Locally testable  
✅ Well-documented  

---

**Need help?** Check `DEPLOYMENT_GUIDE.md` for comprehensive instructions.
