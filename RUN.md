# NutriZaria - Complete Setup & Run Guide

## Prerequisites

- **Node.js** 20+
- **npm** or **yarn**
- **PostgreSQL** 15+ (or Docker)
- **Docker** (optional, for containerized deployment)

---

## Quick Start (Development)

### 1. Start PostgreSQL Database

```bash
# Option A: Docker (Recommended)
docker compose up -d postgres

# Option B: Local PostgreSQL
# Ensure PostgreSQL is running on port 5432 (or 5433 if changed)
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed database with sample data
npx prisma db seed

# Build the project
npm run build

# Start backend in development mode
npm run start:dev

# OR for production
npm run start:prod
```

Backend runs on: **http://localhost:3000**
Swagger docs: **http://localhost:3000/api/docs**

### 3. Frontend Setup

```bash
# In project root
cd /home/mir/2026projects/nutrizaria

# Install dependencies
npm install

# Start frontend in development mode
npm run dev
```

Frontend runs on: **http://localhost:3000**

---

## Configuration

### Backend Environment Variables (`backend/.env`)

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5433/nutrizaria?schema=public"

# JWT
JWT_SECRET=nutrizaria-dev-jwt-secret-key-2024
JWT_EXPIRES_IN=7d

# Stripe (use test keys for development)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# App
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Admin seed credentials
ADMIN_EMAIL=admin@nutrizaria.com
ADMIN_PASSWORD=AdminPass123!
```

### Frontend Environment Variables (`.env`)

```env
API_BASE_URL=http://localhost:3000/api
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
CHECKOUT_CURRENCY=bdt
CHECKOUT_CURRENCY_SYMBOL=Tk
ADMIN_PASSPHRASE=
```

---

## Production Deployment

### Deployment Architecture

```
┌──────────────┐       ┌──────────────────────────────┐
│   Vercel     │       │          Railway              │
│  (Frontend)  │ ◄──── │  ┌─────────────────────────┐  │
│              │  API  │  │   Backend (NestJS)       │  │
│  Nuxt 3 SSR  │ calls │  │   port $PORT             │  │
│              │       │  └────────┬────────────────┘  │
└──────────────┘       │           │                   │
                       │  ┌────────▼────────────────┐  │
                       │  │   PostgreSQL (managed)   │  │
                       │  │   port 5432              │  │
                       │  └─────────────────────────┘  │
                       └──────────────────────────────┘
```

### Option A: Railway (Backend) + Vercel (Frontend) — Recommended

#### 1. Vercel — Frontend

1. Push repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → Import your GitHub repo
3. Settings:
   - **Framework Preset**: Nuxt.js
   - **Root Directory**: `./` (project root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.output`
4. Environment Variables (Settings → Environment Variables):
   ```
   API_BASE_URL=https://your-backend.up.railway.app/api
   CHECKOUT_CURRENCY=bdt
   CHECKOUT_CURRENCY_SYMBOL=Tk
   ADMIN_PASSPHRASE=
   META_PIXEL_ID=
   ```
5. Deploy → Vercel auto-deploys on every push to `main`

#### 2. Railway — Backend + Database

1. Go to [railway.app](https://railway.app) → **Start New Project**
2. **Provision PostgreSQL**: Click **+ New** → **Database** → **Add PostgreSQL**
3. **Add Backend Service**: Click **+ New** → **GitHub Repo** → Select your repo
   - **Root Directory**: `backend`
   - Railway auto-detects the `Dockerfile` and builds
 4. Environment Variables (for the backend service):
   ```
   DATABASE_URL=    ← Railway fills this from the Postgres plugin
   JWT_SECRET=      ← generate a strong random secret
   JWT_EXPIRES_IN=7d
   NODE_ENV=production
   FRONTEND_URL=    ← your Vercel URL (e.g. https://nutrizaria.vercel.app)
   ADMIN_EMAIL=admin@nutrizaria.com
   ADMIN_PASSWORD=  ← set a strong password

   # REQUIRED for uploaded images to survive redeploys.
   # Create a free account at https://cloudinary.com → Dashboard, then copy:
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```
   > Railway's filesystem is **ephemeral** — it is wiped on every deploy. Without
   > Cloudinary, images are stored in a local `uploads/` folder and **break after each
   > redeploy** (the DB keeps the old `/uploads/...` URL, but the file is gone).
   > The backend logs a warning at startup when Cloudinary is not configured.
5. Once deployed, run migrations and seed once:
   ```bash
   # Open Railway shell for the backend service
   # Run inside the container:
   npx prisma migrate deploy
   npx prisma db seed

   # One-time: migrate any images uploaded before Cloudinary was enabled
   # (run BEFORE your next deploy wipes the local uploads folder):
   npm run migrate:uploads
   ```

Railway auto-deploys on every push to the connected branch. No extra CI config needed.

#### 3. Connect Frontend to Backend

After backend deploys, Railway gives you a URL like `https://backend-production-xxxx.up.railway.app`. Update Vercel's `API_BASE_URL` to this value and redeploy.

### Option B: Full Docker Compose (VPS)

```bash
# On your VPS with Docker installed:
git clone https://github.com/your-org/nutrizaria.git
cd nutrizaria

# Create .env files with production values
cp backend/.env.example backend/.env
# Edit backend/.env with production values

# Start everything
docker compose up -d --build

# Initial setup (one-time)
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed
```

### CI/CD Pipeline

The repo includes GitHub Actions workflows:

| Workflow | Trigger | What it does |
|----------|---------|-------------|
| `ci.yml` | Push to `main`/`develop` | Lint + build backend & frontend; deploys backend to Railway via CLI on `main` |
| `pr-checks.yml` | PR to `main` | Lint + build checks for both apps |

**Secrets to set in GitHub repository:**
- `RAILWAY_TOKEN` — Generate in Railway Dashboard → Settings → Tokens (only needed if using Railway deploy step in CI)

> Vercel recommends using its **native GitHub integration** (Settings → Git) instead of deploying via Actions. It's simpler and gives you preview deployments for every PR.

---

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@nutrizaria.com | AdminPass123! |

---

## API Endpoints Summary

### Public Endpoints
- `GET /api/products` - List products (pagination, filters)
- `GET /api/products/:slug` - Get single product
- `GET /api/products/search?q=` - Search products
- `GET /api/categories` - List categories
- `GET /api/categories/:slug` - Category with products
- `GET /api/blogs` - List published blogs
- `GET /api/blogs/:slug` - Get blog post
- `GET /api/faqs` - List FAQs
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login (returns JWT)
- `POST /api/payments/create-intent` - Create Stripe payment intent

### Protected Endpoints (Bearer Token)
- `GET /api/auth/profile` - Get current user
- `GET /api/cart` - Get user's cart
- `POST /api/cart/items` - Add to cart
- `PUT /api/cart/items/:id` - Update cart item
- `DELETE /api/cart/items/:id` - Remove cart item
- `GET /api/favorites` - List favorites
- `POST /api/favorites/:productId` - Toggle favorite
- `POST /api/orders` - Create order
- `GET /api/orders` - List user's orders

### Admin Endpoints (ADMIN/SUPER_ADMIN Role)
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET/POST /api/admin/products` - Product CRUD
- `GET/POST /api/admin/categories` - Category CRUD
- `GET /api/admin/orders` - All orders
- `PUT /api/admin/orders/:id/status` - Update order status
- `PUT /api/admin/orders/:id/payment` - Update payment status
- `GET/POST /api/admin/users` - User management
- `PUT /api/admin/users/:id` - Update user role/status
- `GET/POST /api/admin/blogs` - Blog management
- `GET/POST /api/admin/faqs` - FAQ management
- `GET /api/admin/settings` - Get settings
- `PUT /api/admin/settings` - Update setting
- `GET /api/admin/activity-logs` - Activity logs
- `GET /api/admin/notifications` - Admin notifications
- `GET /api/admin/permissions` - Role permissions
- `GET /api/admin/analytics` - Analytics reports

---

## Testing Admin Login

```bash
# Login via API
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@nutrizaria.com", "password": "AdminPass123!"}'

# Response includes accessToken - use in Authorization header:
# Authorization: Bearer <accessToken>

# Test admin endpoint
curl -H "Authorization: Bearer <accessToken>" \
  http://localhost:3000/api/admin/dashboard
```

---

## Database Management

```bash
# Open Prisma Studio (visual DB browser)
npx prisma studio

# Reset database (careful - deletes all data)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name migration_name

# Deploy migrations in production
npx prisma migrate deploy

# View migration status
npx prisma migrate status
```

---

## Common Issues & Solutions

### Port 5432 already in use
```bash
# Change docker-compose.yml port mapping to 5433:5432
# Update DATABASE_URL in backend/.env to use port 5433
```

### bcrypt module not found
```bash
cd backend
npm rebuild bcrypt
```

### Prisma client not generated
```bash
npx prisma generate
```

### Database connection refused
```bash
# Ensure PostgreSQL is running
docker compose up -d postgres
# or
sudo systemctl start postgresql
```

### Frontend can't connect to API
- Check `API_BASE_URL` in frontend `.env`
- Ensure backend is running on port 3000
- Check CORS settings in `backend/src/main.ts`

---

## Project Structure

```
nutrizaria/
├── backend/                 # Nest.js API
│   ├── src/
│   │   ├── admin/          # Admin module (dashboard, users, settings)
│   │   ├── auth/           # JWT authentication
│   │   ├── products/       # Products CRUD
│   │   ├── categories/     # Categories CRUD
│   │   ├── orders/         # Orders management
│   │   ├── blogs/          # Blog posts
│   │   ├── faqs/           # FAQs
│   │   ├── cart/           # Shopping cart
│   │   ├── favorites/      # User favorites
│   │   ├── payments/       # Stripe integration
│   │   ├── uploads/        # Cloudinary uploads
│   │   └── common/         # Guards, decorators, filters
│   └── prisma/             # Database schema & migrations
│
├── pages/                   # Nuxt 3 pages
│   ├── admin/              # Admin panel pages
│   ├── products/           # Product pages
│   └── ...
├── components/             # Vue components
├── stores/                 # Pinia stores
├── composables/            # Vue composables
└── plugins/                # Nuxt plugins
```

---

## Running All Services Together

### Development (3 terminals)

```bash
# Terminal 1: Database
docker compose up -d postgres

# Terminal 2: Backend
cd backend && npm run start:dev

# Terminal 3: Frontend
npm run dev
```

### Production (single command)

```bash
docker compose up -d --build
```

---

## Access URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3000/api |
| Swagger Docs | http://localhost:3000/api/docs |
| Admin Panel | http://localhost:3000/admin |
| Prisma Studio | http://localhost:5555 (run `npx prisma studio`) |

---

## Admin Panel Access

1. Go to **http://localhost:3000/admin**
2. Login with: **admin@nutrizaria.com** / **AdminPass123!**
3. Features available:
   - Dashboard with stats
   - Products management (CRUD, bulk actions)
   - Categories management
   - Orders with status workflow
   - Users management (roles, status, password reset)
   - Blog posts management
   - FAQs management
   - Settings & role permissions
   - Activity logs

---

## License

Private - NutriZaria Project