# Multi-Tenant SaaS E-Commerce Platform

A full-stack multi-tenant e-commerce platform where a superadmin manages vendor stores, each vendor gets their own white-label subdomain experience (login, dashboard, storefront), and customers can browse and shop from individual stores. The main domain is reserved for the superadmin portal only.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Architecture Overview](#architecture-overview)
4. [Authentication System](#authentication-system)
5. [Database Models](#database-models)
6. [API Endpoints](#api-endpoints)
7. [Frontend Pages & Routes](#frontend-pages--routes)
8. [Multi-Tenancy & Subdomain Routing](#multi-tenancy--subdomain-routing)
9. [Theme System](#theme-system)
10. [Image Upload (Cloudinary)](#image-upload-cloudinary)
11. [Environment Variables](#environment-variables)
12. [Setup & Running](#setup--running)
13. [User Flows](#user-flows)

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express 5 | REST API server |
| MongoDB + Mongoose 9 | Database & ODM |
| JWT (jsonwebtoken) | Authentication (access + refresh tokens) |
| bcryptjs | Password hashing |
| Cloudinary | Image storage (product images) |
| Multer | File upload handling (memory storage) |
| Helmet | Security headers |
| CORS | Cross-origin resource sharing |
| express-rate-limit | Rate limiting |
| express-validator | Request validation |
| cookie-parser | Parse httpOnly cookies |
| Morgan | HTTP request logging |
| Nodemailer | Email sending (vendor welcome emails) |
| Nodemon | Development auto-restart |

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 16 (App Router) | React framework with SSR |
| React 19 | UI library |
| TypeScript | Type safety |
| Tailwind CSS 4 | Utility-first styling |
| Zustand 5 | State management |
| Axios | HTTP client |
| Lucide React | Icon library |

---

## Project Structure

```
Multi-Tenant-Saas/
├── backend/
│   ├── .env                          # Environment variables
│   ├── package.json
│   └── src/
│       ├── server.js                 # Express app entry point
│       ├── config/
│       │   ├── mongodb.js            # MongoDB connection
│       │   ├── cloudinary.js         # Cloudinary configuration
│       │   └── themes.js             # 10 predefined color themes
│       ├── controllers/
│       │   ├── auth.controller.js    # Register, login, logout, refresh, change-password, getMe
│       │   ├── vendor.controller.js  # CRUD vendors (admin), public store lookup
│       │   └── product.controller.js # CRUD products (vendor), public store products
│       ├── middleware/
│       │   ├── auth.middleware.js     # JWT protect + role-based restrictTo
│       │   ├── upload.middleware.js   # Multer memory storage for image uploads
│       │   ├── tenant.middleware.js   # Resolve vendor from x-vendor-subdomain header
│       │   └── validate.middleware.js # express-validator error handler
│       ├── models/
│       │   ├── User.model.js         # User schema (superadmin, vendor, customer)
│       │   ├── Vendor.model.js       # Vendor store schema
│       │   └── Product.model.js      # Product schema
│       ├── routes/
│       │   ├── auth.routes.js        # /api/auth/*
│       │   ├── vendor.routes.js      # /api/admin/vendors/* (superadmin)
│       │   ├── vendorSelf.routes.js  # /api/vendor/* (vendor's own store/orders)
│       │   ├── product.routes.js     # /api/vendor/products/* (vendor CRUD)
│       │   ├── store.routes.js       # /api/store/:subdomain (public store lookup)
│       │   └── storeProduct.routes.js # /api/store/:subdomain/products (public)
│       ├── seeds/
│       │   └── superadmin.seed.js    # Seed superadmin user
│       └── utils/
│           ├── generateTokens.js     # JWT helpers, temp password generator
│           └── sendEmail.js          # Nodemailer email helpers
│
└── frontend/
    ├── package.json
    └── src/
        ├── middleware.ts              # Next.js subdomain detection & rewriting
        ├── config/
        │   └── themes.ts             # Theme colors (mirrors backend themes)
        ├── lib/
        │   └── axios.ts              # Axios instance with subdomain header + token refresh interceptors
        ├── store/
        │   └── authStore.ts          # Zustand auth state (user, isAuthenticated, isLoading, vendor info)
        ├── hooks/
        │   └── useAuth.ts            # Auth actions (login, register, logout, verifyOTP)
        ├── components/
        │   ├── providers/
        │   │   ├── AuthProvider.tsx   # Silent fetchMe on app load
        │   │   └── StoreProvider.tsx  # Store context for subdomain pages (theme, branding)
        │   └── guards/
        │       └── RouteGuard.tsx     # Protected route wrapper (redirects to /login)
        └── app/
            ├── layout.tsx             # Root layout with AuthProvider
            ├── page.tsx               # Landing page
            ├── (auth)/
            │   ├── login/page.tsx            # Superadmin-only login (Admin Portal)
            │   ├── register/page.tsx         # Customer registration (main domain)
            │   └── change-password/page.tsx  # Vendor first-login password change
            ├── (admin)/
            │   ├── layout.tsx                # Admin sidebar layout
            │   └── admin/
            │       ├── dashboard/page.tsx     # Admin dashboard
            │       └── vendors/
            │           ├── page.tsx           # Vendor list
            │           └── create/page.tsx    # Create new vendor
            ├── (vendor)/
            │   └── layout.tsx                # DEPRECATED — redirects to subdomain
            └── store/
                └── [subdomain]/
                    ├── layout.tsx            # Subdomain layout (StoreProvider + dynamic metadata)
                    ├── page.tsx              # Public storefront homepage
                    ├── login/page.tsx        # Dual-role login (vendor → /dashboard, customer → /)
                    ├── register/page.tsx     # Customer registration (themed, vendor-scoped)
                    ├── change-password/page.tsx # Themed vendor password change
                    └── dashboard/
                        ├── layout.tsx        # Vendor dashboard sidebar (themed)
                        ├── page.tsx          # Vendor dashboard (stats, orders, revenue chart)
                        ├── products/
                        │   ├── page.tsx      # Product list
                        │   └── create/page.tsx # Create product
                        ├── orders/page.tsx   # Orders (placeholder)
                        └── settings/page.tsx # Store settings (placeholder)
```

---

## Architecture Overview

```
    ┌────────────────────────────────────────────────────────────┐
    │                   Next.js Frontend                          │
    │                                                             │
    │  localhost:3000 (Main Domain)    vendor1.localhost:3000      │
    │  ┌──────────────────┐            ┌───────────────────────┐  │
    │  │  Admin Portal    │            │  White-Label Vendor   │  │
    │  │  (superadmin     │            │  ├── /login           │  │
    │  │   login only)    │            │  ├── /register        │  │
    │  │                  │            │  ├── /dashboard/*     │  │
    │  │  /admin/*        │            │  └── / (storefront)   │  │
    │  └──────────────────┘            └───────────────────────┘  │
    └───────────────────────────┬──────────────────────────────────┘
                                │ API calls (Axios + x-vendor-subdomain header)
                                │ httpOnly cookies
                                ▼
    ┌────────────────────────────────────────────────────────────┐
    │                  Express Backend                            │
    │                  localhost:5000                              │
    │                                                             │
    │  Tenant Middleware → resolves vendor from subdomain header  │
    │  Auth (domain-context enforcement) ─ Vendor ─ Products     │
    │  JWT                                 CRUD     CRUD         │
    └───────────────────────────┬──────────────────────────────────┘
                                │
                       ┌────────┴────────┐
                       │                 │
                       ▼                 ▼
                 ┌──────────┐     ┌──────────┐
                 │ MongoDB  │     │Cloudinary│
                 │ Atlas    │     │ (Images) │
                 └──────────┘     └──────────┘
```

### Domain Separation

| Domain | Who Can Access | Description |
|---|---|---|
| `localhost:3000` | **Superadmin only** | Admin portal — create vendors, manage platform |
| `vendor1.localhost:3000` | **Vendor + Customers** | White-label store — login, dashboard, register, storefront |

### Three User Roles

| Role | Access | Description |
|---|---|---|
| **Superadmin** | `localhost:3000/admin/*` | Manages the entire platform. Creates vendors, assigns themes and plans. Login only on main domain. |
| **Vendor** | `{subdomain}.localhost:3000/dashboard/*` | Manages their own white-label store. Adds products, views orders. Login only on their subdomain. |
| **Customer** | `{subdomain}.localhost:3000/*` | Browses vendor storefronts, registers, shops. Scoped to one vendor. |

---

## Authentication System

### Token Strategy
- **Access Token**: JWT stored in httpOnly cookie (15 min expiry)
- **Refresh Token**: JWT stored in database only (7 day expiry) — never sent to browser
- **Token Refresh**: Axios interceptor silently calls `/api/auth/refresh` on 401 responses

### Auth Flow
```
1. User logs in  ─────►  Backend validates credentials
                          ├── Domain-context enforcement:
                          │   ├── Main domain: only superadmin allowed
                          │   └── Subdomain: only vendor (owner) + customer (scoped)
                          ├── Sets accessToken as httpOnly cookie
                          ├── Stores refreshToken in DB (user.refreshToken)
                          └── Returns vendor info (subdomain, storeName, theme) for vendor users

2. API request   ─────►  Axios request interceptor adds x-vendor-subdomain header
                          ├── Cookie sent automatically (withCredentials: true)
                          ├── protect middleware verifies JWT
                          └── restrictTo middleware checks role

3. Token expired ─────►  Axios response interceptor catches 401
                          ├── Calls POST /api/auth/refresh
                          ├── Backend verifies DB refresh token
                          ├── Issues new access + refresh tokens (rotation)
                          └── Retries original request

4. Logout        ─────►  Clears cookie + nulls DB refresh token
```

### Domain-Context Login Enforcement
```
Main domain (localhost:3000):
  ├── Superadmin → allowed → /admin/dashboard
  ├── Vendor → REJECTED ("Please log in from your store URL")
  └── Customer → REJECTED ("Please log in from your store URL")

Subdomain (vendor1.localhost:3000):
  ├── Superadmin → REJECTED ("Admin accounts cannot log in from a store")
  ├── Vendor (owner of this store) → allowed → /dashboard
  ├── Vendor (different store) → REJECTED
  ├── Customer (scoped to this store) → allowed → /
  └── Customer (different store) → REJECTED
```

### Vendor First-Login Flow
```
1. Superadmin creates vendor ──► Auto-generates temp password
2. Branded welcome email sent (store name, theme colors, subdomain login URL)
3. Vendor goes to {subdomain}.localhost:3000/login, enters temp password
4. Backend returns 403 + requiresPasswordChange
5. Frontend redirects to /change-password?userId=xxx (themed page)
6. Vendor sets new password (8+ chars, uppercase, number)
7. Redirected to /login (stays on subdomain)
8. Vendor logs in with new password → redirected to /dashboard (on subdomain)
```

### Customer Registration Flow
```
1. Customer visits {subdomain}.localhost:3000/register
2. Fills in name, email, password, phone (optional)
3. Backend creates customer with vendorId = req.vendor._id (scoped to store)
4. Branded OTP email sent (store name, theme colors)
5. Customer enters OTP → email verified
6. Redirected to /login (stays on subdomain)
7. Logs in → redirected to / (storefront)
```

### Frontend Auth Architecture
- **AuthProvider**: Runs on app mount, silently calls `/api/auth/me` to restore session. Does NOT block rendering.
- **RouteGuard**: Wraps protected pages, shows loading spinner, redirects to `/login` if unauthenticated.
- **StoreProvider**: Wraps all subdomain pages, provides store data (theme, branding) via React context.
- **Vendor Dashboard Guard**: In subdomain dashboard layout, checks `user.role === "vendor"`, redirects to `/login` if not.
- **Old Vendor Layout**: Deprecated — redirects to vendor's subdomain automatically.
- **Zustand Store**: Holds `user` (with optional `vendor` field), `isAuthenticated`, `isLoading`.
- **Main Domain Login**: Superadmin-only "Admin Portal" branding. No registration link.

---

## Database Models

### User (`users` collection)
| Field | Type | Description |
|---|---|---|
| name | String | User's full name (2-50 chars) |
| email | String | Unique, lowercase email |
| password | String | bcrypt hashed (select: false) |
| phone | String | Optional phone number |
| age | Number | Optional (13-120) |
| role | Enum | `superadmin`, `vendor`, `customer` (default: customer) |
| vendorId | ObjectId | Ref to Vendor (null for superadmin/customer) |
| isVerified | Boolean | Email verified (customers only) |
| verificationToken | String | OTP for email verification (select: false) |
| isFirstLogin | Boolean | Vendor must change password (vendor only) |
| isActive | Boolean | Account active/deactivated |
| refreshToken | String | JWT refresh token (select: false) |
| lastLogin | Date | Last successful login timestamp |

### Vendor (`vendors` collection)
| Field | Type | Description |
|---|---|---|
| storeName | String | Display name of the store |
| subdomain | String | Unique subdomain (e.g., `my-store`) |
| ownerId | ObjectId | Ref to User (the vendor admin) |
| theme | Enum | One of 10 predefined themes |
| branding.logo | String | Logo URL |
| branding.storeBanner | String | Banner image URL |
| branding.tagline | String | Store tagline |
| contact.email | String | Store contact email |
| contact.phone | String | Store contact phone |
| contact.address | String | Store address |
| subscription.plan | Enum | `basic`, `pro`, `premium` |
| subscription.status | Enum | `active`, `suspended`, `cancelled` |
| isActive | Boolean | Store active status |
| createdBy | ObjectId | Ref to User (superadmin who created it) |

### Product (`products` collection)
| Field | Type | Description |
|---|---|---|
| name | String | Product name (2-100 chars) |
| description | String | Product description (max 2000 chars) |
| price | Number | Current price (required, min: 0) |
| compareAtPrice | Number | Original price (for showing discount) |
| category | String | Product category |
| images | [String] | Array of Cloudinary image URLs (max 5) |
| vendorId | ObjectId | Ref to Vendor |
| stock | Number | Available quantity (default: 0) |
| sku | String | Stock Keeping Unit identifier |
| isActive | Boolean | Product visibility on storefront |

**Index**: `{ vendorId: 1, createdAt: -1 }` for fast vendor product queries.

---

## API Endpoints

### Auth Routes (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public (subdomain only) | Register customer scoped to vendor (sends branded OTP email). Rejected on main domain. |
| POST | `/verify-otp` | Public | Verify email with 6-digit OTP |
| POST | `/resend-otp` | Public | Resend verification OTP (branded if on subdomain) |
| POST | `/login` | Public | Login with domain-context enforcement. Main domain = superadmin only. Subdomain = vendor owner + scoped customers only. |
| POST | `/refresh` | Public | Refresh access token silently |
| POST | `/logout` | Public | Logout (clears cookie + DB token) |
| POST | `/change-password` | Public | Vendor first-login password change |
| GET | `/me` | Protected | Get current authenticated user. Includes vendor store info (subdomain, storeName, theme) for vendor users. |

### Admin Routes (`/api/admin/vendors`)
All routes require: `protect` + `restrictTo("superadmin")`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Create new vendor (generates temp password, sends email) |
| GET | `/` | Get all vendors |
| GET | `/:id` | Get single vendor details |
| PATCH | `/:id/toggle` | Activate/deactivate vendor |
| DELETE | `/:id` | Delete vendor and user account |

### Vendor Routes (`/api/vendor`)
All routes require: `protect` + `restrictTo("vendor")`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/store` | Get vendor's own store info |
| GET | `/orders` | Get vendor's orders (placeholder) |

### Vendor Product Routes (`/api/vendor/products`)
All routes require: `protect` + `restrictTo("vendor")`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get all products (search, pagination) |
| GET | `/:id` | Get single product |
| POST | `/` | Create product (multipart/form-data, up to 5 images) |
| PUT | `/:id` | Update product (multipart/form-data, manage images) |
| DELETE | `/:id` | Delete product + Cloudinary images |
| PATCH | `/:id/toggle` | Toggle product active/inactive |

### Public Store Routes
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/store/:subdomain` | Get store config + theme for storefront |
| GET | `/api/store/:subdomain/products` | Get active products (search, category, pagination) |
| GET | `/api/store/:subdomain/products/:id` | Get single active product |

---

## Frontend Pages & Routes

### Main Domain — Superadmin Only (`localhost:3000`)

#### Auth Pages
- **Login** (`/login`): "Admin Portal" branding. Superadmin-only login. Vendor/customer credentials are rejected by the backend. No registration link.
- **Register** (`/register`): Exists on main domain but backend rejects customer registration without a vendor subdomain context.
- **Change Password** (`/change-password`): Generic password change page (uses `useSearchParams` with Suspense boundary for Next.js 16).

#### Admin Pages (`/admin/*`)
- **Dashboard** (`/admin/dashboard`): Platform overview.
- **Vendors List** (`/admin/vendors`): Table of all vendors with status, plan, theme. Toggle active/inactive, delete.
- **Create Vendor** (`/admin/vendors/create`): Form with name, email, store name, subdomain, plan, theme selector. Auto-generates temp password and sends branded welcome email.

#### Deprecated Vendor Pages (`/vendor/*`)
The old `/vendor/*` routes now redirect vendors to their subdomain automatically. The layout reads the user's `vendor.subdomain` from auth store and does `window.location.href = http://{subdomain}.localhost:3000/dashboard`.

### Subdomain — White-Label Vendor Experience (`{subdomain}.localhost:3000`)

All subdomain pages are wrapped with `StoreProvider` which provides vendor theme colors and branding via React context.

#### Auth Pages (Themed)
- **Login** (`/login`): Dual-role login. Vendor owner → redirected to `/dashboard`. Customer → redirected to `/`. Uses vendor's theme colors. Shows `requiresPasswordChange` redirect to `/change-password`.
- **Register** (`/register`): Customer registration scoped to the vendor. Themed with store branding. Includes OTP verification step. Backend sets `vendorId` on the customer.
- **Change Password** (`/change-password`): Themed password change page. Shows store name/logo. On success, redirects to `/login?passwordChanged=true`.

#### Vendor Dashboard (`/dashboard/*`)
Protected by role guard — only `role: "vendor"` users who own this store can access. Sidebar themed with vendor's colors.

- **Dashboard** (`/dashboard`): Store banner, stat cards (products, orders, revenue), revenue chart, recent orders table, quick action links. "Visit Store" links to `/`.
- **Products** (`/dashboard/products`): Product list placeholder.
- **Create Product** (`/dashboard/products/create`): Create product placeholder.
- **Orders** (`/dashboard/orders`): Orders placeholder.
- **Settings** (`/dashboard/settings`): Store settings placeholder.

#### Storefront
- **Homepage** (`/`): Public store homepage with theme-colored UI, product placeholders.

---

## Multi-Tenancy & Subdomain Routing

### How Subdomain Routing Works

```
Browser: http://my-store.localhost:3000/dashboard
                  │
                  ▼
    Next.js Middleware (middleware.ts)
    ├── Extracts subdomain: "my-store"
    ├── Rewrites URL: /store/my-store/dashboard
    ├── Sets header: x-vendor-subdomain: my-store
    └── Reserved subdomains excluded: www, app, admin, api, localhost
                  │
                  ▼
    Layout: /app/store/[subdomain]/layout.tsx
    ├── Server component: fetches store data, sets page title (generateMetadata)
    └── Wraps children with <StoreProvider subdomain="my-store">
                  │
                  ▼
    Page: /app/store/[subdomain]/dashboard/page.tsx
    ├── Client component: uses useStore() for theme colors
    └── Uses useAuthStore() for vendor user data
```

### Frontend Subdomain Header (Axios Interceptor)
The Axios instance has a **request interceptor** that detects the subdomain from `window.location.hostname` and attaches `x-vendor-subdomain` header to every API call. This ensures all API requests from a subdomain carry vendor context.

### Backend Tenant Resolution
The `resolveTenant` middleware runs on all requests:
- Reads `x-vendor-subdomain` header
- If present: looks up vendor by subdomain, attaches to `req.vendor`
- If absent: sets `req.vendor = null` (platform-level request)
- Auth controller uses `req.vendor` for login enforcement and customer registration scoping

### CORS Configuration
Dynamic origin function allows:
- `http://localhost:3000` (main frontend)
- Any `*.localhost` subdomain pattern (vendor storefronts)

---

## Theme System

10 predefined color themes available for vendor stores. Superadmin selects a theme when creating a vendor.

| Theme | Primary Color | Style |
|---|---|---|
| Sunrise | `#F59E0B` (Amber) | Warm, golden |
| Midnight | `#6366F1` (Indigo) | Deep, professional |
| Forest | `#10B981` (Emerald) | Natural, fresh |
| Ocean | `#0EA5E9` (Sky Blue) | Cool, clean |
| Rose | `#F43F5E` (Pink-Red) | Bold, passionate |
| Violet | `#8B5CF6` (Purple) | Creative, modern |
| Coral | `#F97316` (Orange) | Energetic, vibrant |
| Slate | `#475569` (Gray) | Minimal, elegant |
| Candy | `#EC4899` (Pink) | Fun, playful |
| Gold | `#EAB308` (Yellow) | Premium, luxurious |

Each theme provides: `primaryColor`, `secondaryColor`, `accentColor`, `textColor`, `bgColor`, `navBg`, `navText`, `buttonBg`, `buttonText`, `cardBg`, `borderColor`.

Themes are defined in both:
- `backend/src/config/themes.js` — merged into store API response
- `frontend/src/config/themes.ts` — used for vendor dashboard styling

---

## Image Upload (Cloudinary)

### How It Works
1. Frontend sends images as `FormData` with `Content-Type: multipart/form-data`
2. Multer middleware stores files in memory (`memoryStorage`)
3. Controller uploads each buffer to Cloudinary via streaming
4. Cloudinary returns secure URLs stored in product's `images` array

### Upload Flow
```
Frontend (File Input)
    │
    ▼ FormData with files
Express + Multer (memory buffer)
    │
    ▼ uploadToCloudinary(buffer, folder)
Cloudinary API
    │
    ▼ Returns secure_url + public_id
MongoDB (stores URL in product.images)
```

### Folder Structure on Cloudinary
```
multi-tenant/
└── {vendor-subdomain}/
    └── products/
        ├── image1.jpg
        ├── image2.png
        └── ...
```

### Image Management on Edit
- `existingImages`: JSON string of Cloudinary URLs to keep
- New files uploaded alongside existing images
- Removed images are deleted from Cloudinary via `public_id`
- Maximum 5 images per product

---

## Environment Variables

### Backend (`.env`)
```env
# Database
MONGO_URI=mongodb+srv://...

# Server
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# JWT Secrets (use different values for each!)
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret

# Email (SMTP)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Setup & Running

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account
- (Optional) SMTP server for emails

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd Multi-Tenant-Saas

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Configuration

1. Copy and fill in environment variables:
   - `backend/.env` (see Environment Variables section)
   - `frontend/.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:5000`

2. Seed the superadmin user:
   ```bash
   cd backend
   npm run seed:admin
   ```
   This creates: `superadmin@admin.com` / `Admin@1234`

3. (Optional) Add vendor subdomains to `/etc/hosts` for local testing:
   ```
   127.0.0.1  my-store.localhost
   127.0.0.1  another-store.localhost
   ```

### Running

```bash
# Terminal 1 — Backend
cd backend
npm run dev        # Starts on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev        # Starts on http://localhost:3000
```

---

## User Flows

### 1. Superadmin Creates a Vendor
```
1. Login as superadmin at localhost:3000/login (Admin Portal)
2. Navigate to /admin/vendors/create
3. Fill in: vendor name, email, store name, subdomain, plan, theme
4. Submit → Backend:
   a. Creates User with role "vendor", isFirstLogin: true
   b. Generates random temp password
   c. Creates Vendor store record with theme
   d. Links vendorId back to User
   e. Sends branded welcome email (store name, theme, subdomain login URL, temp password)
5. Vendor appears in /admin/vendors list
```

### 2. Vendor First Login & Setup
```
1. Vendor receives branded email with temp password + store login URL
2. Goes to {subdomain}.localhost:3000/login, enters email + temp password
3. Backend returns 403 (requiresPasswordChange)
4. Redirected to /change-password?userId=xxx (themed page with store branding)
5. Sets new password (8+ chars, uppercase, number)
6. Redirected to /login (stays on subdomain, themed)
7. Logs in with new password → redirected to /dashboard (on subdomain)
8. Sees themed vendor dashboard with store name in sidebar
```

### 3. Vendor Manages Products
```
1. Navigate to /dashboard/products on subdomain
2. Click "Add Product" → /dashboard/products/create
3. (Product creation feature pending implementation)
```

### 4. Customer Registers & Shops
```
1. Go to http://{subdomain}.localhost:3000/register
2. Fill in name, email, password → account created with vendorId scoped to store
3. Branded OTP email sent → verify email
4. Login at /login → redirected to / (storefront)
5. Browse products on themed storefront
```

### 5. Customer Visits Store (No Account)
```
1. Go to http://{subdomain}.localhost:3000
2. Next.js middleware detects subdomain, rewrites to /store/{subdomain}
3. StoreProvider fetches store config (GET /api/store/{subdomain})
4. Store renders with vendor's theme colors
5. Products displayed on themed storefront
```

### 6. Cross-Domain Rejection
```
1. Vendor tries logging in at localhost:3000/login → "Please log in from your store URL"
2. Superadmin tries logging in at vendor1.localhost:3000/login → "Admin accounts cannot log in from a store"
3. Customer of store A tries logging in at store B → "This account does not belong to this store"
```

### 7. Old URL Migration
```
1. Vendor bookmarks localhost:3000/vendor/dashboard
2. Visits the URL → old vendor layout detects vendor.subdomain from auth store
3. Auto-redirects to http://{subdomain}.localhost:3000/dashboard
```

---

## Security Measures

- **httpOnly cookies**: Access token never accessible via JavaScript
- **Refresh token rotation**: New refresh token on every refresh, old one invalidated
- **Password hashing**: bcrypt with 12 salt rounds
- **Rate limiting**: 100 requests/15min general, 20 requests/15min for auth
- **Helmet**: Secure HTTP headers
- **CORS**: Strict origin checking (localhost + subdomain pattern)
- **Role-based access**: `restrictTo()` middleware enforces role permissions
- **Input validation**: express-validator on all mutation routes
- **File upload limits**: 5MB per image, images only, max 5 per product
- **Vendor isolation**: All vendor queries scoped to their vendorId

---

## What's Built vs What's Pending

### Built
- [x] Superadmin authentication + dashboard (main domain only)
- [x] Vendor CRUD (create, list, toggle, delete) by superadmin
- [x] **White-label vendor experience** — subdomain-first architecture
- [x] **Domain-context login enforcement** — superadmin on main domain, vendor+customer on subdomain
- [x] Vendor first-login password change flow (themed, on subdomain)
- [x] Vendor dashboard on subdomain with themed sidebar (`/dashboard/*`)
- [x] **Customer registration scoped to vendor** (subdomain only)
- [x] **StoreProvider** — React context for store theme/branding on all subdomain pages
- [x] **Branded emails** — verification + vendor welcome emails with store name, theme colors, subdomain URL
- [x] **Old vendor route migration** — `/vendor/*` auto-redirects to subdomain
- [x] Product CRUD with Cloudinary image uploads
- [x] Subdomain-based storefront routing (Next.js middleware + Axios interceptor)
- [x] 10 predefined color themes
- [x] Public store config + product APIs
- [x] Token refresh with silent retry
- [x] Role-based route guards (frontend + backend)
- [x] Shopping cart + checkout flow
- [x] Order management (vendor + customer)
- [x] Payment integration (eSewa/Stripe)
- [x] Search & filtering on storefront



### Pending / Future

- [ ] Vendor store settings page (update branding, contact)
- [ ] Email notifications (order confirmation, shipping)
- [ ] Analytics dashboard for vendors
- [ ] Superadmin analytics (platform-wide stats)
- [ ] Product variants (size, color)
- [ ] Vendor subscription billing