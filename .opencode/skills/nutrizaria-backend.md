# NutriZaria Backend & Admin Panel - Complete E-Commerce Skill

## Overview
Transform the static NutriZaria frontend into a full dynamic e-commerce platform using Nest.js, PostgreSQL, and Prisma ORM. This skill covers backend API development, admin panel creation, and frontend integration.

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Backend Setup (Nest.js + PostgreSQL)](#backend-setup)
3. [Database Schema (Prisma)](#database-schema)
4. [Authentication & Authorization](#authentication)
5. [API Endpoints](#api-endpoints)
6. [Admin Panel Features](#admin-panel)
7. [File Upload & Image Management](#file-upload)
8. [Frontend Integration](#frontend-integration)
9. [Deployment & Docker](#deployment)
10. [Migration Strategy](#migration-strategy)

---

## 1. Architecture Overview <a name="architecture-overview"></a>

### Current State
- **Frontend**: Nuxt 3 + Vue 3 + Pinia + TailwindCSS
- **Data**: Static JSON in `stores/data.js` (94 products, 12 categories, 10 FAQs)
- **Storage**: LocalStorage for cart, favorites, orders
- **Auth**: Firebase (basic)
- **Payment**: Stripe integration

### Target State
```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Nuxt 3 App    │ ◄─────► │  Nest.js API    │ ◄─────► │   PostgreSQL    │
│   (Frontend)    │  REST   │   (Backend)     │  Prisma │   (Database)    │
└─────────────────┘         └─────────────────┘         └─────────────────┘
        │                           │
        │                           ├── Admin Panel (React/Vue)
        │                           ├── JWT Auth
        │                           ├── File Upload (S3/Cloudinary)
        │                           └── Stripe Webhooks
```

### Tech Stack
| Layer | Technology |
|-------|-----------|
| Backend Framework | Nest.js 10+ |
| Database | PostgreSQL 15+ |
| ORM | Prisma 5+ |
| Authentication | JWT + Passport |
| File Storage | Cloudinary / AWS S3 |
| API Documentation | Swagger |
| Validation | class-validator + class-transformer |
| Caching | Redis (optional) |
| Containerization | Docker + Docker Compose |

---

## 2. Backend Setup <a name="backend-setup"></a>

### Project Structure
```
backend/
├── src/
│   ├── admin/              # Admin panel module
│   │   ├── admin.controller.ts
│   │   ├── admin.service.ts
│   │   ├── admin.module.ts
│   │   └── dto/
│   ├── auth/               # Authentication module
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.module.ts
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts
│   │   │   └── roles.guard.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       └── register.dto.ts
│   ├── categories/         # Categories module
│   │   ├── categories.controller.ts
│   │   ├── categories.service.ts
│   │   ├── categories.module.ts
│   │   └── dto/
│   ├── products/           # Products module
│   │   ├── products.controller.ts
│   │   ├── products.service.ts
│   │   ├── products.module.ts
│   │   └── dto/
│   ├── orders/             # Orders module
│   │   ├── orders.controller.ts
│   │   ├── orders.service.ts
│   │   ├── orders.module.ts
│   │   └── dto/
│   ├── blogs/              # Blog module
│   │   ├── blogs.controller.ts
│   │   ├── blogs.service.ts
│   │   ├── blogs.module.ts
│   │   └── dto/
│   ├── faqs/               # FAQ module
│   │   ├── faqs.controller.ts
│   │   ├── faqs.service.ts
│   │   ├── faqs.module.ts
│   │   └── dto/
│   ├── uploads/            # File upload module
│   │   ├── uploads.controller.ts
│   │   ├── uploads.service.ts
│   │   └── uploads.module.ts
│   ├── payments/           # Payment/Stripe module
│   │   ├── payments.controller.ts
│   │   ├── payments.service.ts
│   │   └── payments.module.ts
│   ├── common/             # Shared utilities
│   │   ├── decorators/
│   │   ├── filters/
│   │   ├── interceptors/
│   │   └── pipes/
│   ├── app.module.ts
│   └── main.ts
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── test/
├── docker-compose.yml
├── Dockerfile
├── .env.example
├── package.json
└── tsconfig.json
```

### Initial Setup Commands
```bash
# Create Nest.js project
nest new nutrizaria-backend

# Install dependencies
npm install @nestjs/config @nestjs/jwt @nestjs/passport passport passport-jwt
npm install @prisma/client prisma
npm install class-validator class-transformer
npm install @nestjs/swagger swagger-ui-express
npm install bcrypt
npm install @nestjs/platform-express multer
npm install cloudinary @nestjs/axios
npm install stripe

# Initialize Prisma
npx prisma init

# Generate modules
nest generate module auth
nest generate module products
nest generate module categories
nest generate module orders
nest generate module blogs
nest generate module faqs
nest generate module uploads
nest generate module payments
nest generate module admin
```

### Environment Variables (.env)
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/nutrizaria?schema=public"

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# App
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:3001

# Admin
ADMIN_EMAIL=admin@nutrizaria.com
ADMIN_PASSWORD=AdminPass123!
```

---

## 3. Database Schema <a name="database-schema"></a>

### Prisma Schema (prisma/schema.prisma)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============ USER & AUTH ============

enum UserRole {
  CUSTOMER
  ADMIN
  SUPER_ADMIN
}

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  password      String
  name          String?
  phone         String?
  role          UserRole  @default(CUSTOMER)
  avatar        String?
  isActive      Boolean   @default(true)
  emailVerified Boolean   @default(false)
  lastLoginAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  addresses     Address[]
  orders        Order[]
  favorites     Favorite[]
  cart          Cart?
  reviews       Review[]

  @@index([email])
  @@index([role])
}

model Address {
  id         String  @id @default(uuid())
  userId     String
  user       User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  fullName   String
  phone      String
  address    String
  city       String
  country    String  @default("Bangladesh")
  postalCode String?
  isDefault  Boolean @default(false)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([userId])
}

// ============ CATALOG ============

model Category {
  id          String    @id @default(uuid())
  name        String    @unique
  slug        String    @unique
  image       String?
  description String?
  parentId    String?
  parent      Category? @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children    Category[] @relation("CategoryHierarchy")
  isActive    Boolean   @default(true)
  sortOrder   Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  products    Product[]

  @@index([slug])
  @@index([isActive])
}

model Product {
  id          String    @id @default(uuid())
  name        String
  slug        String    @unique
  description String    @db.Text
  price       Float
  comparePrice Float?   // For showing discounts
  unit        String    // e.g., "1kg", "500g"
  image       String
  images      String[]  // Additional images
  categoryId  String
  category    Category  @relation(fields: [categoryId], references: [id])
  benefits    String[]  @db.Text[]
  isActive    Boolean   @default(true)
  isFeatured  Boolean   @default(false)
  stock       Int       @default(100)
  sku         String?   @unique
  metaTitle   String?
  metaDescription String? @db.Text
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  orderItems  OrderItem[]
  favorites   Favorite[]
  cartItems   CartItem[]
  reviews     Review[]

  @@index([categoryId])
  @@index([slug])
  @@index([isActive, isFeatured])
  @@index([price])
  @@fulltext([name, description])
}

// ============ CART ============

model Cart {
  id        String     @id @default(uuid())
  userId    String     @unique
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  items     CartItem[]
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
}

model CartItem {
  id        String  @id @default(uuid())
  cartId    String
  cart      Cart    @relation(fields: [cartId], references: [id], onDelete: Cascade)
  productId String
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  quantity  Int     @default(1)

  @@unique([cartId, productId])
}

// ============ FAVORITES ============

model Favorite {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, productId])
  @@index([userId])
}

// ============ ORDERS ============

enum OrderStatus {
  PENDING
  CONFIRMED
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
  REFUNDED
}

enum PaymentMethod {
  CARD
  BKASH
  NAGAD
  COD
  BANK_TRANSFER
}

enum PaymentStatus {
  PENDING
  PROCESSING
  PAID
  FAILED
  REFUNDED
}

model Order {
  id              String        @id @default(uuid())
  orderNumber     String        @unique
  userId          String
  user            User          @relation(fields: [userId], references: [id])
  
  // Shipping
  shippingName    String
  shippingEmail   String
  shippingPhone   String
  shippingAddress String
  shippingCity    String
  shippingCountry String        @default("Bangladesh")
  shippingPostal  String?
  
  // Payment
  paymentMethod   PaymentMethod
  paymentStatus   PaymentStatus @default(PENDING)
  paymentRef      String?       // Transaction ID
  stripePaymentId String?
  
  // Totals
  subtotal        Float
  shippingCost    Float         @default(0)
  discount        Float         @default(0)
  total           Float
  
  // Status
  status          OrderStatus   @default(PENDING)
  notes           String?       @db.Text
  adminNotes      String?       @db.Text
  
  // Timestamps
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  paidAt          DateTime?
  shippedAt       DateTime?
  deliveredAt     DateTime?
  cancelledAt     DateTime?
  
  items           OrderItem[]

  @@index([userId])
  @@index([status])
  @@index([orderNumber])
  @@index([createdAt])
}

model OrderItem {
  id        String  @id @default(uuid())
  orderId   String
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  productId String
  product   Product @relation(fields: [productId], references: [id])
  
  name      String  // Snapshot at time of order
  price     Float
  quantity  Int
  unit      String
  
  @@index([orderId])
}

// ============ BLOG ============

model BlogPost {
  id          String   @id @default(uuid())
  title       String
  slug        String   @unique
  content     String   @db.Text
  excerpt     String?  @db.Text
  image       String?
  category    String
  author      String
  publishedAt DateTime?
  isPublished Boolean  @default(false)
  views       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([slug])
  @@index([isPublished])
  @@index([category])
}

// ============ FAQ ============

model Faq {
  id        String   @id @default(uuid())
  question  String
  answer    String   @db.Text
  sortOrder Int      @default(0)
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([isActive, sortOrder])
}

// ============ SETTINGS ============

model Setting {
  id        String   @id @default(uuid())
  key       String   @unique
  value     String   @db.Text
  type      String   @default("string") // string, number, boolean, json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ============ REVIEWS ============

model Review {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  rating    Int      // 1-5
  comment   String?  @db.Text
  isApproved Boolean @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, productId])
  @@index([productId])
}
```

### Seed Data (prisma/seed.ts)
```typescript
import { PrismaClient, UserRole, PaymentMethod } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('AdminPass123!', 10);
  await prisma.user.upsert({
    where: { email: 'admin@nutrizaria.com' },
    update: {},
    create: {
      email: 'admin@nutrizaria.com',
      password: adminPassword,
      name: 'Admin',
      role: UserRole.SUPER_ADMIN,
      emailVerified: true,
    },
  });

  // Create categories
  const categories = [
    { name: 'Vegetables', slug: 'vegetables', image: 'tomato.avif', sortOrder: 1 },
    { name: 'Spice', slug: 'spice', image: 'spices2.avif', sortOrder: 2 },
    { name: 'Meat', slug: 'meat', image: 'meat.avif', sortOrder: 3 },
    { name: 'Fish', slug: 'fish', image: 'salmon.avif', sortOrder: 4 },
    { name: 'Oil', slug: 'oil', image: 'olive-oil.avif', sortOrder: 5 },
    { name: 'Nuts', slug: 'nuts', image: 'nuts2.avif', sortOrder: 6 },
    { name: 'Fruit', slug: 'fruit', image: 'fruit2.avif', sortOrder: 7 },
    { name: 'Cheese', slug: 'cheese', image: 'cheese2.avif', sortOrder: 8 },
    { name: 'Dates', slug: 'dates', image: 'dates2.avif', sortOrder: 9 },
    { name: 'Dry Food', slug: 'dry-food', image: 'nuts2.avif', sortOrder: 10 },
    { name: 'Juice', slug: 'juice', image: 'fruit2.avif', sortOrder: 11 },
    { name: 'Honey', slug: 'honey', image: 'honey2.avif', sortOrder: 12 },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // Import products from existing data
  const products = [
    // ... (import all 94 products from stores/data.js)
    // Example:
    {
      name: 'Premium Dates',
      slug: 'premium-dates',
      image: 'dates.avif',
      categorySlug: 'dates',
      price: 1400,
      description: 'খেজুরে ফাইবার, ভিটামিন বি এবং আয়রন থাকে...',
      unit: '1 kg',
      benefits: [
        'খেজুর হল একটি জনপ্রিয় ফল...',
        // ...
      ],
    },
    // ... more products
  ];

  for (const prod of products) {
    const category = await prisma.category.findUnique({
      where: { slug: prod.categorySlug },
    });
    if (category) {
      await prisma.product.upsert({
        where: { slug: prod.slug },
        update: {},
        create: {
          name: prod.name,
          slug: prod.slug,
          image: prod.image,
          price: prod.price,
          description: prod.description,
          unit: prod.unit,
          benefits: prod.benefits,
          categoryId: category.id,
        },
      });
    }
  }

  // Create FAQs
  const faqs = [
    {
      question: 'NutriZaria কী?',
      answer: 'NutriZaria একটি অনলাইন প্ল্যাটফর্ম...',
      sortOrder: 1,
    },
    // ... more FAQs
  ];

  for (const faq of faqs) {
    await prisma.faq.create({ data: faq });
  }

  // Create blog posts
  const blogPosts = [
    {
      title: 'The Future of Organic Food in E-Commerce',
      slug: 'the-future-of-organic-food-in-e-commerce',
      category: 'Organic',
      author: 'Sarah Thompson',
      content: 'As consumers become more health-conscious...',
      image: '/images/blogs/organic-food.avif',
      isPublished: true,
      publishedAt: new Date('2024-10-01'),
    },
    // ... more posts
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    });
  }

  console.log('Seed completed!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## 4. Authentication & Authorization <a name="authentication"></a>

### Auth Module Structure

#### auth.module.ts
```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: { expiresIn: config.get('JWT_EXPIRES_IN', '7d') },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

#### auth.service.ts
```typescript
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
        phone: dto.phone,
      },
    });

    return this.generateTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return this.generateTokens(user);
  }

  private generateTokens(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwt.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async validateUser(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }
}
```

#### JWT Strategy
```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private config: ConfigService,
    private authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.authService.validateUser(payload.sub);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
```

#### Role Guards
```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
```

---

## 5. API Endpoints <a name="api-endpoints"></a>

### Public Endpoints (No Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products (with pagination, filters) |
| GET | `/api/products/:slug` | Get single product |
| GET | `/api/products/search?q=` | Search products |
| GET | `/api/categories` | List all categories |
| GET | `/api/categories/:slug/products` | Products by category |
| GET | `/api/blogs` | List blog posts |
| GET | `/api/blogs/:slug` | Get single blog post |
| GET | `/api/faqs` | List FAQs |
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/payments/create-intent` | Create Stripe payment intent |
| POST | `/api/payments/webhook` | Stripe webhook handler |

### Protected Endpoints (Auth Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/user/profile` | Get current user |
| PUT | `/api/user/profile` | Update profile |
| GET | `/api/user/addresses` | List addresses |
| POST | `/api/user/addresses` | Add address |
| GET | `/api/cart` | Get user cart |
| POST | `/api/cart/items` | Add to cart |
| PUT | `/api/cart/items/:id` | Update cart item |
| DELETE | `/api/cart/items/:id` | Remove from cart |
| GET | `/api/favorites` | List favorites |
| POST | `/api/favorites/:productId` | Toggle favorite |
| POST | `/api/orders` | Create order |
| GET | `/api/orders` | List user orders |
| GET | `/api/orders/:id` | Get order details |

### Admin Endpoints (Admin Role Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Dashboard stats |
| GET | `/api/admin/products` | List all products |
| POST | `/api/admin/products` | Create product |
| PUT | `/api/admin/products/:id` | Update product |
| DELETE | `/api/admin/products/:id` | Delete product |
| POST | `/api/admin/products/bulk` | Bulk import products |
| GET | `/api/admin/categories` | List categories |
| POST | `/api/admin/categories` | Create category |
| PUT | `/api/admin/categories/:id` | Update category |
| DELETE | `/api/admin/categories/:id` | Delete category |
| GET | `/api/admin/orders` | List all orders |
| PUT | `/api/admin/orders/:id/status` | Update order status |
| PUT | `/api/admin/orders/:id/payment` | Update payment status |
| GET | `/api/admin/blogs` | List all blog posts |
| POST | `/api/admin/blogs` | Create blog post |
| PUT | `/api/admin/blogs/:id` | Update blog post |
| DELETE | `/api/admin/blogs/:id` | Delete blog post |
| GET | `/api/admin/faqs` | List FAQs |
| POST | `/api/admin/faqs` | Create FAQ |
| PUT | `/api/admin/faqs/:id` | Update FAQ |
| DELETE | `/api/admin/faqs/:id` | Delete FAQ |
| POST | `/api/admin/uploads/image` | Upload image |
| GET | `/api/admin/settings` | Get settings |
| PUT | `/api/admin/settings` | Update settings |
| GET | `/api/admin/users` | List users |
| PUT | `/api/admin/users/:id/role` | Update user role |

### Products Controller Example
```typescript
import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, Request, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto, QueryProductDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'sort', required: false, enum: ['price_asc', 'price_desc', 'newest', 'name'] })
  findAll(@Query() query: QueryProductDto) {
    return this.productsService.findAll(query);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.productsService.findBySlug(slug);
  }

  @Get('search')
  search(@Query('q') query: string) {
    return this.productsService.search(query);
  }
}

@ApiTags('Admin - Products')
@ApiBearerAuth()
@Controller('admin/products')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
```

### Products Service Example
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto, UpdateProductDto, QueryProductDto } from './dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: QueryProductDto) {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      sort = 'newest',
      featured,
      minPrice,
      maxPrice,
    } = query;

    const where: any = { isActive: true };

    if (category) {
      where.category = { slug: category };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (featured !== undefined) {
      where.isFeatured = featured === 'true';
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const orderBy: any = {};
    switch (sort) {
      case 'price_asc': orderBy.price = 'asc'; break;
      case 'price_desc': orderBy.price = 'desc'; break;
      case 'name': orderBy.name = 'asc'; break;
      default: orderBy.createdAt = 'desc';
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { category: true },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findBySlug(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async search(query: string) {
    return this.prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { category: { name: { contains: query, mode: 'insensitive' } } },
        ],
      },
      include: { category: true },
      take: 20,
    });
  }

  async create(dto: CreateProductDto) {
    const category = await this.prisma.category.findUnique({
      where: { slug: dto.categorySlug },
    });
    if (!category) throw new NotFoundException('Category not found');

    return this.prisma.product.create({
      data: {
        ...dto,
        categoryId: category.id,
        slug: this.generateSlug(dto.name),
      },
      include: { category: true },
    });
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');

    return this.prisma.product.update({
      where: { id },
      data: dto,
      include: { category: true },
    });
  }

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    await this.prisma.product.delete({ where: { id } });
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
}
```

### DTOs
```typescript
// create-product.dto.ts
import { IsString, IsNumber, IsOptional, IsArray, IsBoolean, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  comparePrice?: number;

  @ApiProperty()
  @IsString()
  unit: string;

  @ApiProperty()
  @IsString()
  image: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  images?: string[];

  @ApiProperty()
  @IsString()
  categorySlug: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  benefits?: string[];

  @ApiProperty({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ default: 100 })
  @IsOptional()
  @IsNumber()
  stock?: number;
}

// query-product.dto.ts
import { IsOptional, IsString, IsNumberString } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryProductDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumberString()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumberString()
  limit?: number = 12;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'name';

  @IsOptional()
  @IsString()
  featured?: string;

  @IsOptional()
  @IsString()
  minPrice?: string;

  @IsOptional()
  @IsString()
  maxPrice?: string;
}
```

---

## 6. Admin Panel Features <a name="admin-panel"></a>

### Admin Dashboard Components

#### Dashboard Stats
```typescript
// admin.service.ts
async getDashboardStats() {
  const [
    totalProducts,
    totalOrders,
    totalRevenue,
    pendingOrders,
    recentOrders,
    topProducts,
  ] = await Promise.all([
    this.prisma.product.count({ where: { isActive: true } }),
    this.prisma.order.count(),
    this.prisma.order.aggregate({
      _sum: { total: true },
      where: { paymentStatus: 'PAID' },
    }),
    this.prisma.order.count({ where: { status: 'PENDING' } }),
    this.prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { items: true, user: true },
    }),
    this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    }),
  ]);

  return {
    totalProducts,
    totalOrders,
    totalRevenue: totalRevenue._sum.total || 0,
    pendingOrders,
    recentOrders,
    topProducts,
  };
}
```

### Admin Panel UI (Vue/Nuxt Integration)

Create a new admin layout and pages in the Nuxt frontend:

```
pages/admin/
├── index.vue          # Dashboard with stats
├── products/
│   ├── index.vue      # Product list with CRUD
│   └── [id].vue       # Edit product
├── categories/
│   └── index.vue      # Category management
├── orders/
│   ├── index.vue      # Order list
│   └── [id].vue       # Order details
├── blogs/
│   ├── index.vue      # Blog list
│   └── [id].vue       # Edit blog
├── faqs/
│   └── index.vue      # FAQ management
├── settings/
│   └── index.vue      # Site settings
└── users/
    └── index.vue      # User management
```

### Admin API Composable (Frontend)
```typescript
// composables/useAdminApi.ts
export const useAdminApi = () => {
  const config = useRuntimeConfig();
  const baseURL = config.public.apiBase || 'http://localhost:3000/api';

  const { data: token } = useCookie('admin_token');

  const headers = computed(() => ({
    'Content-Type': 'application/json',
    ...(token.value && { Authorization: `Bearer ${token.value}` }),
  }));

  const fetchApi = async (endpoint: string, options: any = {}) => {
    return $fetch(`${baseURL}${endpoint}`, {
      ...options,
      headers: { ...headers.value, ...options.headers },
    });
  };

  // Products
  const getProducts = (params?: any) => fetchApi('/admin/products', { params });
  const createProduct = (data: any) => fetchApi('/admin/products', { method: 'POST', body: data });
  const updateProduct = (id: string, data: any) => fetchApi(`/admin/products/${id}`, { method: 'PUT', body: data });
  const deleteProduct = (id: string) => fetchApi(`/admin/products/${id}`, { method: 'DELETE' });

  // Categories
  const getCategories = () => fetchApi('/admin/categories');
  const createCategory = (data: any) => fetchApi('/admin/categories', { method: 'POST', body: data });
  const updateCategory = (id: string, data: any) => fetchApi(`/admin/categories/${id}`, { method: 'PUT', body: data });
  const deleteCategory = (id: string) => fetchApi(`/admin/categories/${id}`, { method: 'DELETE' });

  // Orders
  const getOrders = (params?: any) => fetchApi('/admin/orders', { params });
  const updateOrderStatus = (id: string, status: string) =>
    fetchApi(`/admin/orders/${id}/status`, { method: 'PUT', body: { status } });
  const updatePaymentStatus = (id: string, status: string) =>
    fetchApi(`/admin/orders/${id}/payment`, { method: 'PUT', body: { status } });

  // Blogs
  const getBlogs = () => fetchApi('/admin/blogs');
  const createBlog = (data: any) => fetchApi('/admin/blogs', { method: 'POST', body: data });
  const updateBlog = (id: string, data: any) => fetchApi(`/admin/blogs/${id}`, { method: 'PUT', body: data });
  const deleteBlog = (id: string) => fetchApi(`/admin/blogs/${id}`, { method: 'DELETE' });

  // FAQs
  const getFaqs = () => fetchApi('/admin/faqs');
  const createFaq = (data: any) => fetchApi('/admin/faqs', { method: 'POST', body: data });
  const updateFaq = (id: string, data: any) => fetchApi(`/admin/faqs/${id}`, { method: 'PUT', body: data });
  const deleteFaq = (id: string) => fetchApi(`/admin/faqs/${id}`, { method: 'DELETE' });

  // Upload
  const uploadImage = (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return $fetch(`${baseURL}/admin/uploads/image`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token.value}` },
      body: formData,
    });
  };

  return {
    getProducts, createProduct, updateProduct, deleteProduct,
    getCategories, createCategory, updateCategory, deleteCategory,
    getOrders, updateOrderStatus, updatePaymentStatus,
    getBlogs, createBlog, updateBlog, deleteBlog,
    getFaqs, createFaq, updateFaq, deleteFaq,
    uploadImage,
  };
};
```

---

## 7. File Upload & Image Management <a name="file-upload"></a>

### Cloudinary Integration
```typescript
// uploads.service.ts
import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadsService {
  constructor(private config: ConfigService) {
    cloudinary.config({
      cloud_name: config.get('CLOUDINARY_CLOUD_NAME'),
      api_key: config.get('CLOUDINARY_API_KEY'),
      api_secret: config.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadImage(file: Express.Multer.File, folder = 'nutrizaria') {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          transformation: [
            { quality: 'auto', fetch_format: 'auto' },
            { width: 800, crop: 'limit' },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
          });
        }
      ).end(file.buffer);
    });
  }

  async deleteImage(publicId: string) {
    return cloudinary.uploader.destroy(publicId);
  }
}
```

### Upload Controller
```typescript
import {
  Controller, Post, UseInterceptors, UploadedFile, UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';

@Controller('admin/uploads')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@ApiBearerAuth()
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  @Post('image')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp|avif)$/)) {
        return cb(new Error('Only image files allowed'), false);
      }
      cb(null, true);
    },
  }))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    return this.uploadsService.uploadImage(file);
  }
}
```

---

## 8. Frontend Integration <a name="frontend-integration"></a>

### Replace Static Stores with API Calls

#### Updated Catalog Store
```typescript
// stores/catalog.ts
import { defineStore } from 'pinia';

export const useCatalogStore = defineStore('catalog', {
  state: () => ({
    products: [] as Product[],
    categories: [] as Category[],
    faqs: [] as Faq[],
    loading: false,
    error: null as string | null,
    pagination: { page: 1, total: 0, totalPages: 0 },
  }),

  getters: {
    productById: (state) => (id: string) =>
      state.products.find((p) => p.id === id),
    productsByCategory: (state) => (slug: string) =>
      state.products.filter((p) => p.category?.slug === slug),
    featuredProducts: (state) =>
      state.products.filter((p) => p.isFeatured).slice(0, 8),
  },

  actions: {
    async fetchProducts(params?: any) {
      this.loading = true;
      try {
        const response = await $fetch('/api/products', { params });
        this.products = response.items;
        this.pagination = response.meta;
      } catch (error) {
        this.error = 'Failed to load products';
      } finally {
        this.loading = false;
      }
    },

    async fetchCategories() {
      try {
        this.categories = await $fetch('/api/categories');
      } catch (error) {
        this.error = 'Failed to load categories';
      }
    },

    async fetchFaqs() {
      try {
        this.faqs = await $fetch('/api/faqs');
      } catch (error) {
        this.error = 'Failed to load FAQs';
      }
    },
  },
});
```

#### Updated Cart Store (API-backed)
```typescript
// stores/cart.ts
import { defineStore } from 'pinia';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
    isCartOpen: false,
    loading: false,
  }),

  getters: {
    totalItems: (state) => state.items.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice: (state) =>
      state.items.reduce((sum, item) => sum + item.price * item.quantity, 0),
  },

  actions: {
    async fetchCart() {
      const { data: token } = useCookie('auth_token');
      if (!token.value) return;

      try {
        const cart = await $fetch('/api/cart', {
          headers: { Authorization: `Bearer ${token.value}` },
        });
        this.items = cart.items;
      } catch (error) {
        console.error('Failed to fetch cart');
      }
    },

    async addToCart(productId: string, quantity = 1) {
      const { data: token } = useCookie('auth_token');
      if (!token.value) {
        // Fallback to localStorage for guests
        this.addToLocalCart(productId, quantity);
        return;
      }

      try {
        await $fetch('/api/cart/items', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token.value}` },
          body: { productId, quantity },
        });
        await this.fetchCart();
      } catch (error) {
        console.error('Failed to add to cart');
      }
    },

    async updateQuantity(itemId: string, quantity: number) {
      const { data: token } = useCookie('auth_token');
      if (!token.value) return;

      try {
        await $fetch(`/api/cart/items/${itemId}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token.value}` },
          body: { quantity },
        });
        await this.fetchCart();
      } catch (error) {
        console.error('Failed to update cart');
      }
    },

    async removeFromCart(itemId: string) {
      const { data: token } = useCookie('auth_token');
      if (!token.value) return;

      try {
        await $fetch(`/api/cart/items/${itemId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token.value}` },
        });
        await this.fetchCart();
      } catch (error) {
        console.error('Failed to remove from cart');
      }
    },

    toggleCart() {
      this.isCartOpen = !this.isCartOpen;
    },
  },
});
```

### Nuxt Config Updates
```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  // ... existing config
  runtimeConfig: {
    public: {
      apiBase: process.env.API_BASE_URL || 'http://localhost:3000/api',
      stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      checkoutCurrency: process.env.CHECKOUT_CURRENCY || 'bdt',
      currencySymbol: process.env.CHECKOUT_CURRENCY_SYMBOL || 'Tk',
    },
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  },
});
```

---

## 9. Deployment & Docker <a name="deployment"></a>

### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: nutrizaria
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/nutrizaria
      JWT_SECRET: your-production-secret
      REDIS_URL: redis://redis:6379
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started
    volumes:
      - ./backend/uploads:/app/uploads

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    environment:
      API_BASE_URL: http://backend:3000/api
    ports:
      - "3001:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
  redis_data:
```

### Backend Dockerfile
```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
RUN npx prisma generate

COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
```

---

## 10. Migration Strategy <a name="migration-strategy"></a>

### Phase 1: Backend Foundation (Week 1-2)
1. Set up Nest.js project structure
2. Configure PostgreSQL and Prisma
3. Create database schema and run migrations
4. Seed initial data from `stores/data.js`
5. Implement auth module with JWT

### Phase 2: Core API (Week 3-4)
1. Products CRUD API
2. Categories CRUD API
3. Public endpoints for frontend
4. File upload service
5. API documentation with Swagger

### Phase 3: Admin Panel (Week 5-6)
1. Admin authentication
2. Product management UI
3. Category management UI
4. Order management UI
5. Blog and FAQ management

### Phase 4: Frontend Integration (Week 7-8)
1. Replace static stores with API calls
2. Update cart to use API (with localStorage fallback)
3. Update checkout flow
4. Implement user authentication
5. Testing and bug fixes

### Phase 5: Advanced Features (Week 9-10)
1. Stripe webhook integration
2. Email notifications
3. Order tracking
4. Analytics dashboard
5. Performance optimization

### Data Migration Script
```typescript
// scripts/migrate-data.ts
import { PrismaClient } from '@prisma/client';
import { products, categories, faqs } from '../stores/data.js';

const prisma = new PrismaClient();

async function migrate() {
  console.log('Starting migration...');

  // Migrate categories
  for (const cat of categories) {
    await prisma.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        image: cat.image,
      },
    });
  }
  console.log(`Migrated ${categories.length} categories`);

  // Migrate products
  for (const prod of products) {
    const category = await prisma.category.findFirst({
      where: { slug: prod.category },
    });
    if (category) {
      await prisma.product.create({
        data: {
          name: prod.name,
          slug: prod.name.toLowerCase().replace(/\s+/g, '-'),
          image: prod.image,
          price: prod.price,
          description: prod.description,
          unit: prod.unit,
          benefits: prod.benefits,
          categoryId: category.id,
        },
      });
    }
  }
  console.log(`Migrated ${products.length} products`);

  // Migrate FAQs
  for (let i = 0; i < faqs.length; i++) {
    await prisma.faq.create({
      data: {
        question: faqs[i].question,
        answer: faqs[i].answer,
        sortOrder: i + 1,
      },
    });
  }
  console.log(`Migrated ${faqs.length} FAQs`);

  console.log('Migration complete!');
}

migrate()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## Quick Start Commands

```bash
# 1. Start PostgreSQL
docker-compose up -d postgres

# 2. Run migrations
cd backend
npx prisma migrate dev --name init

# 3. Seed database
npm run seed

# 4. Start backend
npm run start:dev

# 5. Start frontend
cd ..
npm run dev

# 6. Access admin panel
# http://localhost:3001/admin
# Login: admin@nutrizaria.com / AdminPass123!
```

---

## API Documentation

After starting the backend, access Swagger docs at:
```
http://localhost:3000/api/docs
```

---

## Security Checklist

- [ ] Use environment variables for all secrets
- [ ] Enable CORS only for frontend domain
- [ ] Implement rate limiting on auth endpoints
- [ ] Validate all inputs with DTOs
- [ ] Sanitize file uploads
- [ ] Use HTTPS in production
- [ ] Implement request logging
- [ ] Set up database backups
- [ ] Enable Stripe webhook signature verification
- [ ] Implement password complexity rules

---

## Performance Optimization

1. **Database Indexing**: Already included in Prisma schema
2. **Caching**: Use Redis for frequently accessed data
3. **Pagination**: Always paginate list endpoints
4. **Image Optimization**: Use Cloudinary transformations
5. **API Compression**: Enable gzip in Nest.js
6. **Connection Pooling**: Configure Prisma connection pool

---

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

---

## Monitoring & Logging

```typescript
// Add to app.module.ts
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

WinstonModule.forRoot({
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        winston.format.simple(),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/combined.log',
    }),
  ],
}),
```

---

This skill provides a complete blueprint for transforming NutriZaria from a static frontend to a full-featured dynamic e-commerce platform with a powerful admin panel.
