# PharmaOS Setup Guide

## Prerequisites

Before running PharmaOS, ensure you have the following installed:

- **Node.js** v18 or higher ([Download](https://nodejs.org/))
- **PostgreSQL** v14 or higher ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn** package manager

## Database Setup

### Option 1: Local PostgreSQL

1. **Install PostgreSQL** if not already installed
2. **Create a database** for PharmaOS:
   ```sql
   CREATE DATABASE pharmaos;
   ```
3. **Update the `.env` file** in the `backend` folder:
   ```env
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/pharmaos"
   ```

### Option 2: PostgreSQL Docker (Recommended for Development)

```bash
docker run --name pharmaos-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=pharmaos \
  -p 5432:5432 \
  -d postgres:15
```

Then update backend `.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pharmaos"
```

## Installation Steps

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Run database migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Seed the database with sample data
npm run seed

# Start the development server
npm run dev
```

The backend will start on `http://localhost:3000`

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on `http://localhost:5173`

## Verify Installation

1. **Backend Health Check**: Open `http://localhost:3000/health` in your browser
   - Should return: `{"status":"ok","timestamp":"..."}`

2. **Frontend**: Open `http://localhost:5173` in your browser
   - Should see the PharmaOS Dashboard with data

3. **API Testing**: All API endpoints are available at `http://localhost:3000/api/*`

## Default Credentials

This is an internal pharmacy system without authentication. All features are accessible upon opening the application.

## Sample Data

The seed script creates:
- **24 Products** across multiple categories
  - 10+ Active products
  - 5 Near-expiry products
  - 5 Expired products
  - 3 Out-of-stock products
- **16 Orders** (5 pending, 3 processing, 7 completed, 1 cancelled)
- **7 Transactions** (from completed orders)
- **Alerts** for expired and near-expiry products

## Troubleshooting

### Database Connection Error

**Error**: `Can't reach database server at localhost:5432`

**Solution**:
1. Ensure PostgreSQL service is running
2. Check if port 5432 is not blocked by firewall
3. Verify DATABASE_URL in `.env` has correct credentials

### Prisma Client Errors

**Error**: `@prisma/client` not found

**Solution**:
```bash
cd backend
npx prisma generate
```

### Port Already in Use

**Error**: `Port 3000 is already in use`

**Solution**:
- Change `PORT` in backend `.env` to another port (e.g., 3001)
- Update `VITE_API_URL` in frontend `.env` accordingly

## Development Commands

### Backend
```bash
npm run dev      # Start development server
npm run seed     # Seed database
npm start        # Start production server
```

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Next Steps

1. **Explore the Dashboard** - View KPIs, charts, and alerts
2. **Manage Inventory** - Add, edit, delete products
3. **Create Orders** - Test the order lifecycle
4. **Run Expiry Scan** - Click "Run Expiry Scan" on dashboard
5. **Try Prompt Search** - Use natural language queries on dashboard
6. **Import Data** - Upload a CSV file with product data

## Support

For issues or questions, refer to:
- `docs/PRD.md` - Product Requirements Document
- `docs/design.md` - UI/UX Design Specifications
- `docs/TASKS.md` - Implementation Tasks

---

**PharmaOS** - The operational backbone of the modern pharmacy.
