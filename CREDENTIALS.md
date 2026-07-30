# NutriZaria - Credentials & Configuration Reference

> **WARNING:** This file is for development reference only. Never commit real production secrets to version control. Use `.env` files (already in `.gitignore`) for actual credentials.

---

## Table of Contents

1. [Admin Panel Access](#1-admin-panel-access)
2. [Database (PostgreSQL)](#2-database-postgresql)
3. [Backend API (Nest.js)](#3-backend-api-nestjs)
4. [JWT Authentication](#4-jwt-authentication)
5. [Stripe Payments](#5-stripe-payments)
6. [Cloudinary (Image Storage)](#6-cloudinary-image-storage)
7. [Firebase (Phone Auth)](#7-firebase-phone-auth)
8. [Frontend (Nuxt 3)](#8-frontend-nuxt-3)
9. [Docker Services](#9-docker-services)
10. [Environment Variables Quick Reference](#10-environment-variables-quick-reference)
11. [API Endpoints Reference](#11-api-endpoints-reference)

---

## 1. Admin Panel Access

| Field | Value |
|-------|-------|
| **URL** | `http://localhost:3000/admin` |
| **Email** | `admin@nutrizaria.com` |
| **Password** | `AdminPass123!` |
| **Role** | `SUPER_ADMIN` |
| **Passphrase** | Set via `ADMIN_PASSPHRASE` env variable (optional) |

### Creating Additional Admin Users

```sql
-- Run in PostgreSQL after backend is running
INSERT INTO "User" (id, email, password, name, role, "emailVerified", "isActive", "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  'newadmin@nutrizaria.com',
  '$2b$10$hashed_password_here',
  'New Admin',
  'ADMIN',
  true,
  true,
  NOW(),
  NOW()
);
```

Or via API:
```bash
# First login as super admin, then update user role
curl -X PUT http://localhost:4000/api/admin/users/{userId}/role \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"role": "ADMIN"}'
```

---

## 2. Database (PostgreSQL)

### Development

| Field | Value |
|-------|-------|
| **Host** | `localhost` |
| **Port** | `5432` |
| **Database** | `nutrizaria` |
| **Username** | `postgres` |
| **Password** | `password` |
| **Connection URL** | `postgresql://postgres:password@localhost:5432/nutrizaria?schema=public` |

### Docker

| Field | Value |
|-------|-------|
| **Container Name** | `nutrizaria-postgres-1` |
| **Image** | `postgres:15-alpine` |
| **Volume** | `postgres_data` (persistent) |
| **Health Check** | `pg_isready -U postgres` every 5s |

### Prisma Studio (Visual DB Browser)

```bash
cd backend
npx prisma studio
# Opens at http://localhost:5555
```

---

## 3. Backend API (Nest.js)

| Field | Value |
|-------|-------|
| **Base URL** | `http://localhost:4000/api` |
| **Swagger Docs** | `http://localhost:4000/api/docs` |
| **Port** | `4000` (dev) / `3000` (Docker) |
| **CORS Origin** | `http://localhost:3000` |
| **Rate Limit** | 100 requests per 60 seconds |

### Test Credentials (API)

```bash
# Register a new user
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Test123!", "name": "Test User"}'

# Login and get JWT token
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@nutrizaria.com", "password": "AdminPass123!"}'

# Response:
# {
#   "data": {
#     "accessToken": "eyJhbGciOiJIUzI1NiIs...",
#     "user": { "id": "uuid", "email": "admin@nutrizaria.com", "role": "SUPER_ADMIN" }
#   }
# }
```

---

## 4. JWT Authentication

| Field | Value |
|-------|-------|
| **Secret Key** | `nutrizaria-dev-jwt-secret-key-2024` (dev) |
| **Expires In** | `7d` (7 days) |
| **Algorithm** | `HS256` (default) |
| **Token Location** | `Authorization: Bearer {token}` header |
| **Cookie Name** | `auth_token` (frontend) |

### Token Payload Structure

```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "CUSTOMER|ADMIN|SUPER_ADMIN",
  "iat": 1700000000,
  "exp": 1700604800
}
```

### Generating a Production Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 5. Stripe Payments

### Test Mode Credentials

| Field | Value |
|-------|-------|
| **Publishable Key** | `pk_test_...` (from Stripe Dashboard) |
| **Secret Key** | `sk_test_...` (from Stripe Dashboard) |
| **Webhook Secret** | `whsec_...` (from Stripe Dashboard > Webhooks) |
| **API Version** | `2024-09-30.acacia` |

### Stripe Test Card Numbers

| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | Payment succeeds |
| `4000 0000 0000 9995` | Insufficient funds |
| `4000 0000 0000 0002` | Card declined |
| `4000 0000 0000 0127` | Requires 3D Secure |

**Expiry:** Any future date (e.g. `12/30`)
**CVC:** Any 3 digits (e.g. `123`)
**Zip:** Any 5 digits (e.g. `1200`)

### Setup Instructions

1. Create account at [stripe.com](https://stripe.com)
2. Go to Developers > API keys
3. Copy Publishable key and Secret key
4. Go to Developers > Webhooks > Add endpoint
5. Set URL to `http://localhost:4000/api/payments/webhook`
6. Copy the signing secret

---

## 6. Cloudinary (Image Storage)

| Field | Value |
|-------|-------|
| **Cloud Name** | Your cloud name from Cloudinary dashboard |
| **API Key** | Your API key |
| **API Secret** | Your API secret |
| **Upload Folder** | `nutrizaria` |
| **Max File Size** | 5 MB |
| **Allowed Formats** | `jpg`, `jpeg`, `png`, `gif`, `webp`, `avif` |

### Setup Instructions

1. Create account at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard
3. Copy Cloud Name, API Key, and API Secret
4. Add to `.env` file

### Image Transformations (Auto-applied)

```
Quality: auto
Format: auto (webp/avif)
Max Width: 800px
Crop: limit
```

---

## 7. Firebase (Phone Auth)

| Field | Value |
|-------|-------|
| **API Key** | `AIzaSyBxd8k-eThZX0qpAUUlQ1Yp5TzE5jXm9q8` |
| **Auth Domain** | `nutrizaria-27ac1.firebaseapp.com` |
| **Project ID** | `nutrizaria-27ac1` |
| **Storage Bucket** | `nutrizaria-27ac1.firebasestorage.app` |
| **Messaging Sender ID** | `589188719972` |
| **App ID** | `1:589188719972:web:81fb73b34f84ef4e184671` |
| **Measurement ID** | `G-P37VV5JMNK` |

> **Note:** Firebase is currently used only for phone OTP authentication on the frontend. The backend uses JWT-based auth.

---

## 8. Frontend (Nuxt 3)

| Field | Value |
|-------|-------|
| **Dev URL** | `http://localhost:3000` |
| **API Base URL** | `http://localhost:4000/api` |
| **Currency** | `bdt` (Bangladeshi Taka) |
| **Currency Symbol** | `Tk` |
| **Free Delivery Threshold** | Orders >= 2000 Tk |
| **Delivery Fee** | 80 Tk |

### Runtime Config

```env
API_BASE_URL=http://localhost:4000/api
STRIPE_PUBLISHABLE_KEY=pk_test_...
CHECKOUT_CURRENCY=bdt
CHECKOUT_CURRENCY_SYMBOL=Tk
ADMIN_PASSPHRASE=your-passphrase-here
```

---

## 9. Docker Services

### Docker Compose Architecture

```
┌──────────────────┐     ┌──────────────────┐
│   Frontend       │     │   Backend        │
│   Nuxt 3         │────>│   Nest.js        │
│   Port: 3000     │     │   Port: 4000     │
└──────────────────┘     └────────┬─────────┘
                                  │
                         ┌────────▼─────────┐
                         │   PostgreSQL     │
                         │   Port: 5432     │
                         └──────────────────┘
```

### Commands

```bash
# Start all services
docker-compose up -d

# Start only database
docker-compose up -d postgres

# View logs
docker-compose logs -f backend

# Stop all services
docker-compose down

# Stop and remove volumes (DELETES DATA)
docker-compose down -v

# Rebuild backend
docker-compose up -d --build backend
```

---

## 10. Environment Variables Quick Reference

### Backend (`backend/.env`)

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/nutrizaria?schema=public"

# JWT
JWT_SECRET=nutrizaria-dev-jwt-secret-key-2024
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# App
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Admin Seed
ADMIN_EMAIL=admin@nutrizaria.com
ADMIN_PASSWORD=AdminPass123!
```

### Frontend (`.env`)

```env
API_BASE_URL=http://localhost:4000/api
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
CHECKOUT_CURRENCY=bdt
CHECKOUT_CURRENCY_SYMBOL=Tk
ADMIN_PASSPHRASE=
```

---

## 11. API Endpoints Reference

### Public (No Auth)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login, returns JWT |
| `GET` | `/api/products` | List products (paginated) |
| `GET` | `/api/products/:slug` | Get single product |
| `GET` | `/api/products/search?q=` | Search products |
| `GET` | `/api/categories` | List categories |
| `GET` | `/api/categories/:slug` | Category with products |
| `GET` | `/api/blogs` | List published blogs |
| `GET` | `/api/blogs/:slug` | Get single blog post |
| `GET` | `/api/faqs` | List active FAQs |

### Protected (Bearer Token Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/auth/profile` | Get current user profile |
| `GET` | `/api/cart` | Get user's cart |
| `POST` | `/api/cart/items` | Add item to cart |
| `PUT` | `/api/cart/items/:id` | Update cart item quantity |
| `DELETE` | `/api/cart/items/:id` | Remove cart item |
| `DELETE` | `/api/cart` | Clear entire cart |
| `GET` | `/api/favorites` | List favorites |
| `POST` | `/api/favorites/:productId` | Toggle favorite |
| `POST` | `/api/orders` | Create new order |
| `GET` | `/api/orders` | List user's orders |
| `GET` | `/api/orders/:id` | Get order details |
| `POST` | `/api/payments/create-intent` | Create Stripe payment intent |

### Admin (ADMIN or SUPER_ADMIN Role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/dashboard` | Dashboard statistics |
| `GET` | `/api/admin/products` | List all products (incl. inactive) |
| `GET` | `/api/admin/products/:id` | Get product by ID |
| `POST` | `/api/admin/products` | Create product |
| `PUT` | `/api/admin/products/:id` | Update product |
| `DELETE` | `/api/admin/products/:id` | Delete product |
| `GET` | `/api/admin/categories` | List all categories |
| `POST` | `/api/admin/categories` | Create category |
| `PUT` | `/api/admin/categories/:id` | Update category |
| `DELETE` | `/api/admin/categories/:id` | Delete category |
| `GET` | `/api/admin/orders` | List all orders |
| `GET` | `/api/admin/orders/:id` | Get order details |
| `PUT` | `/api/admin/orders/:id/status` | Update order status |
| `PUT` | `/api/admin/orders/:id/payment` | Update payment status |
| `GET` | `/api/admin/blogs` | List all blog posts |
| `POST` | `/api/admin/blogs` | Create blog post |
| `PUT` | `/api/admin/blogs/:id` | Update blog post |
| `DELETE` | `/api/admin/blogs/:id` | Delete blog post |
| `GET` | `/api/admin/faqs` | List all FAQs |
| `POST` | `/api/admin/faqs` | Create FAQ |
| `PUT` | `/api/admin/faqs/:id` | Update FAQ |
| `DELETE` | `/api/admin/faqs/:id` | Delete FAQ |
| `POST` | `/api/admin/uploads/image` | Upload image (multipart) |
| `GET` | `/api/admin/users` | List all users |
| `PUT` | `/api/admin/users/:id/role` | Update user role |
| `GET` | `/api/admin/settings` | Get all settings |
| `PUT` | `/api/admin/settings` | Update a setting |

---

## Quick Start Checklist

- [ ] PostgreSQL running (`docker-compose up -d postgres`)
- [ ] Backend `.env` configured with all credentials
- [ ] Database migrated (`npx prisma migrate dev --name init`)
- [ ] Database seeded (`npm run prisma:seed`)
- [ ] Backend running (`npm run start:dev`)
- [ ] Frontend `.env` configured with `API_BASE_URL`
- [ ] Frontend running (`npm run dev`)
- [ ] Admin panel accessible at `http://localhost:3000/admin`
- [ ] API docs accessible at `http://localhost:4000/api/docs`
- [ ] Stripe test keys configured (for checkout testing)
- [ ] Cloudinary configured (for image uploads)

---

## Security Notes

- **Never** commit `.env` files to git (already in `.gitignore`)
- **Always** use environment variables for secrets
- **Rotate** JWT secrets periodically in production
- **Use** strong passwords for admin accounts
- **Enable** Stripe webhook signature verification in production
- **Restrict** CORS origins to your frontend domain in production
- **Use** HTTPS in production for all services
- **Backup** PostgreSQL database regularly
