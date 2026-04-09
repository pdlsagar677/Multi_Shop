# Multi-Tenant SaaS E-Commerce Platform

A full-stack multi-tenant e-commerce platform where a **superadmin** manages vendor stores, each **vendor** gets their own white-label subdomain storefront, and **customers** browse and shop from individual stores. Built with Next.js 16, Express 5, and MongoDB.

---

## How It Works

```
Main Domain (localhost:3000)          Subdomain (my-store.localhost:3000)
┌─────────────────────────┐           ┌──────────────────────────────────┐
│   Superadmin Portal     │           │   White-Label Vendor Store       │
│   - Create vendors      │           │   - Vendor dashboard             │
│   - Manage platform     │           │   - Customer storefront          │
│   - Preview templates   │           │   - Shopping & checkout          │
└─────────────────────────┘           └──────────────────────────────────┘
            │                                        │
            └──────────── Express API ───────────────┘
                              │
                     MongoDB + Cloudinary
```

**Superadmin** creates a vendor → vendor gets a unique subdomain → customers register and shop on that subdomain. Each store has its own theme, layout template, products, orders, and customer base — completely isolated.

---

## Features

### Platform Management (Superadmin)
- Create, manage, activate/deactivate vendor stores
- Assign color themes and layout templates per vendor
- Live template + theme preview before assigning
- Platform-wide vendor overview dashboard

### Vendor Store Management
- **Product Management** — CRUD with up to 5 Cloudinary images per product
- **Inline Stock Control** — Add stock directly from the product table
- **Discounts** — Percentage-based with optional expiry dates
- **Featured Products** — Toggle up to 10 featured products for storefront showcase
- **Order Management** — View, update status (pending → confirmed → shipped → delivered), cancel
- **Customer Management** — View and manage store customers
- **Payment Settings** — Configure eSewa and Khalti payment gateways (password-protected)
- **Themed Dashboard** — Sidebar and UI styled with the store's color theme

### Customer Shopping Experience
- **Themed Storefront** — Hero banner, category navigation, featured products, sale section
- **Product Browsing** — Search, filter by category/price/stock, sort by newest/price/name
- **Shopping Cart** — Server-side cart with real-time stock validation
- **Saved Addresses** — Up to 3 addresses per store with default selection
- **Checkout** — Choose saved address or enter new, select payment method
- **Payment** — eSewa, Khalti, or Cash on Delivery
- **Account Management** — Profile editing, order history, address management

### Template & Theme System
**10 color themes** x **5 layout templates** = **50 unique store looks**

| Themes | Style |
|--------|-------|
| Sunrise, Gold | Warm, premium |
| Midnight, Violet | Deep, creative |
| Forest, Ocean | Fresh, clean |
| Rose, Coral, Candy | Bold, vibrant |
| Slate | Minimal, elegant |

| Template | Layout Style |
|----------|-------------|
| Template 1 | Clean Grid — centered hero, 4-column cards |
| Template 2 | Full-Width Modern — gradient hero, glass navbar |
| Template 3 | Minimal — no hero banner, horizontal 2-column cards |
| Template 4 | Bold & Dynamic — split hero, hover overlay cards |
| Template 5 | Elegant Showcase — carousel hero, masonry grid cards |

Each template provides 6 swappable components: `HeroSection`, `NavbarLayout`, `ProductCard`, `FooterLayout`, `FeaturedSection`, `SaleSection`.

### Authentication & Security
- **Domain-context enforcement** — superadmin on main domain only, vendors/customers on their subdomain only
- **Vendor first-login flow** — temp password → forced password change on first login
- **Customer registration** — scoped to vendor store with OTP email verification
- **JWT auth** — httpOnly cookies + refresh token rotation
- **Role-based access** — three roles with strict route guards on both frontend and backend
- Rate limiting, Helmet headers, CORS, bcrypt hashing, input validation

### Payment Integration
- **eSewa** — HMAC-SHA256 signature generation, redirect flow, double-verification
- **Khalti** — API-based initiation, redirect flow, lookup API verification
- **COD** — Cash on Delivery support
- Per-vendor payment configuration with independent enable/disable

---

## Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express 5 | REST API server |
| MongoDB + Mongoose 9 | Database & ODM |
| JWT | Access + refresh token authentication |
| Cloudinary + Multer | Image storage & upload |
| Nodemailer | Branded transactional emails |
| Winston | Structured logging |
| Helmet, CORS, express-rate-limit | Security |
| express-validator | Input validation |

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 16 (App Router) | React framework with SSR |
| React 19 + TypeScript | UI with type safety |
| Tailwind CSS 4 | Styling |
| Zustand 5 | State management |
| Axios | HTTP client with interceptors |
| Lucide React | Icons |

---

## Project Structure

```
backend/src/
├── server.js
├── config/         # MongoDB, Cloudinary, themes, templates
├── controllers/    # Auth, vendor, product, order, cart, address
├── middleware/      # JWT auth, file upload, tenant resolution, validation
├── models/         # User, Vendor, Product, Order, Cart, Address
├── routes/         # All API route definitions
├── seeds/          # Superadmin seeder
└── utils/          # Token generation, email, logging, pagination

frontend/src/
├── middleware.ts    # Subdomain detection & URL rewriting
├── config/         # Theme & template definitions
├── lib/axios.ts    # Axios with subdomain header & token refresh
├── store/          # Zustand stores (auth, cart, address)
├── components/
│   ├── providers/  # AuthProvider, StoreProvider
│   ├── guards/     # RouteGuard for protected pages
│   └── store/
│       └── templates/  # 5 layout templates (6 components each)
└── app/
    ├── (auth)/         # Main domain login
    ├── (admin)/        # Superadmin dashboard & vendor management
    └── store/[subdomain]/  # All subdomain pages (storefront, dashboard, etc.)
```

---

## Database Models

| Model | Key Fields |
|-------|-----------|
| **User** | name, email, password, role (superadmin/vendor/customer), vendorId, isVerified, isFirstLogin |
| **Vendor** | storeName, subdomain, theme, template, branding (logo, banner, tagline), payment config, subscription plan |
| **Product** | name, price, images (max 5), stock, discountPercent, discountValidUntil, isFeatured, effectivePrice (virtual) |
| **Order** | orderNumber (ORD-00001), items with effectivePrice, payment (eSewa/Khalti/COD), status flow |
| **Cart** | One per user per vendor, server-side with stock validation |
| **Address** | Max 3 per user per vendor, with default selection |

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (Atlas or local)
- Cloudinary account

### Installation

```bash
git clone <repo-url>
cd Multi-Tenant-Saas

# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Configuration

**Backend** — create `backend/.env`:
```env
MONGO_URI=mongodb+srv://...
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# JWT (min 32 chars each)
JWT_ACCESS_SECRET=your-access-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (optional — uses Ethereal test accounts if empty)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

# eSewa (sandbox)
ESEWA_LIVE=false
ESEWA_PAYMENT_URL=https://rc-epay.esewa.com.np/api/epay/main/v2/form
ESEWA_STATUS_URL=https://uat.esewa.com.np/api/epay/transaction/status/

# Khalti (sandbox)
KHALTI_LIVE=false
KHALTI_INITIATE_URL=https://dev.khalti.com/api/v2/epayment/initiate/
KHALTI_LOOKUP_URL=https://dev.khalti.com/api/v2/epayment/lookup/

CLIENT_BASE_DOMAIN=localhost:3000
```

**Frontend** — create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Seed Superadmin

```bash
cd backend
npm run seed:admin
# Creates: superadmin@admin.com / Admin@1234
```

### Run

```bash
# Terminal 1 — Backend
cd backend
npm run dev        # http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev        # http://localhost:3000
```

### Local Subdomain Setup (Optional)

Add to `/etc/hosts` for testing vendor subdomains:
```
127.0.0.1  my-store.localhost
127.0.0.1  another-store.localhost
```

---

## User Flows

### Superadmin
1. Login at `localhost:3000` → Go to `/admin/vendors/create`
2. Fill vendor details, pick a theme + template → Submit
3. Vendor receives branded welcome email with temp password

### Vendor
1. Login at `{subdomain}.localhost:3000` with temp password
2. Forced to change password on first login
3. Access dashboard → Add products, manage orders, configure payments

### Customer
1. Register at `{subdomain}.localhost:3000/register` → Verify email via OTP
2. Browse storefront → Add to cart → Checkout with saved address
3. Pay via eSewa, Khalti, or COD → Track orders in account page

---

## API Overview

| Group | Base Path | Description |
|-------|-----------|-------------|
| Auth | `/api/auth` | Register, login, logout, refresh, OTP, password reset |
| Admin | `/api/admin/vendors` | Vendor CRUD (superadmin only) |
| Vendor | `/api/vendor` | Store info, orders, customers, payment settings |
| Products | `/api/vendor/products` | Product CRUD, stock, featured, discounts |
| Store (Public) | `/api/store/:subdomain` | Store config, products, categories, search |
| Cart | `/api/cart` | Server-side cart (customer only) |
| Orders | `/api/orders` | Create, pay, verify payment |
| Addresses | `/api/addresses` | Saved addresses CRUD (max 3) |
| Customer | `/api/customer` | Customer order history |

---

## Security

- **httpOnly cookies** for access tokens — never exposed to JavaScript
- **Refresh token rotation** — new token on every refresh, old one invalidated
- **bcrypt** password hashing (12 rounds)
- **Rate limiting** — general + stricter limits on auth and payment endpoints
- **Helmet** security headers + strict **CORS** policy
- **Role-based access control** on both frontend and backend
- **Vendor isolation** — all queries scoped by vendorId
- **Server-computed pricing** — orders use effectivePrice, not client-sent values
- **Payment signature verification** — HMAC-SHA256 for eSewa, lookup API for Khalti
- **JWT secret validation** — server won't start with weak secrets (< 32 chars)
- **Input validation** via express-validator on all mutation routes
- **Stock validation** on cart additions and order creation

---

## License

This project is proprietary. All rights reserved.
