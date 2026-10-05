# Roxiler Systems Full-Stack Coding Challenge

### Store Rating & Management Platform

A modern, production-grade full-stack web application built according to the Roxiler Systems Full-Stack Developer requirements. The application features a unified authentication system with Role-Based Access Control (RBAC) supporting **System Administrators**, **Normal Users**, and **Store Owners**, complete with interactive store ratings, search, filtering, and sorting capabilities.

---

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide React, Axios, React Router v6
- **Backend**: Node.js, Express.js, TypeScript, Prisma ORM, Zod, JWT, bcryptjs
- **Database**: PostgreSQL 16 (running via Docker)
- **Tooling**: Docker Compose, npm, ts-node

---

## 🔑 Key Features & Role Breakdown

### 1. System Administrator
- **Analytics Dashboard**: Real-time statistics showing:
  - Total registered users
  - Total registered stores
  - Total submitted ratings
- **User Management**:
  - Filter users by Name, Email, Address, and Role (`ADMIN`, `USER`, `STORE_OWNER`).
  - Sort table dynamically on all columns (Name, Email, Address, Role, Rating).
  - View individual store ratings for users with the `STORE_OWNER` role.
  - Create new users (`ADMIN`, `USER`, or `STORE_OWNER`) with strict validation.
- **Store Management**:
  - View all stores with Name, Email, Address, and Average Rating.
  - Filter stores by Name, Email, and Address.
  - Sort stores by Name, Email, Address, and Rating.
  - Add new stores and optionally assign registered store owners.
- **Session**: Secure logout and password updates.

### 2. Normal User
- **Self Registration & Login**:
  - Registration form with real-time requirement indicators.
  - Standardized email, address, and strict password enforcement.
- **Store Directory**:
  - Browse all registered stores in responsive card layouts.
  - Search stores by **Name** and **Address**.
  - Sort stores by Name and Overall Rating.
  - View overall store rating alongside personal submitted rating.
- **Rating Submissions**:
  - Rate any store from **1 to 5 stars** using interactive star ratings.
  - Easily modify previously submitted ratings at any time.
- **Account Management**: Update password and logout.

### 3. Store Owner
- **Store Dashboard**:
  - View verified storefront profile (Name, Email, Address).
  - Live aggregate average rating card calculated from real-time customer submissions.
  - Total customer reviews counter.
- **Customer Ratings History**:
  - Table of all customers who rated the store: Customer Name, Email, Address, Submitted Rating (1–5), and Timestamp.
  - Sortable by Customer Name, Email, Rating score, and Date.
- **Account Management**: Update password and logout.

---

## 🔒 Form Validation Rules Enforced

Strict validations are enforced on both the client (live feedback) and backend (Zod schema validation):
- **Name**: Minimum 20 characters, Maximum 60 characters.
- **Address**: Maximum 400 characters.
- **Password**: 8 to 16 characters, must include at least one uppercase letter and one special character (`[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]`).
- **Email**: Standard RFC 5322 email validation.
- **Rating**: Integer between 1 and 5.

---

## 👥 Seeded Demo Accounts

The database comes pre-populated with realistic dummy data and test accounts across all roles:

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **System Administrator** | `admin@roxiler.com` | `Admin@123` | Full administrative control & metrics |
| **Store Owner 1** | `rajesh.owner@store.com` | `Owner@123` | Owner of *TechNova Electronics Superstore* |
| **Store Owner 2** | `sunita.owner@store.com` | `Owner@123` | Owner of *Organic Harvest Market & Cafe* |
| **Normal User 1** | `rahul.sharma@example.com` | `User@123` | User with submitted ratings |
| **Normal User 2** | `ananya.joshi@example.com` | `User@123` | User with submitted ratings |
| **Normal User 3** | `rohan.kulkarni@example.com` | `User@123` | User with submitted ratings |

*(Tip: The login page includes 1-click test account fill buttons for quick review!)*

---

## 🛠️ Getting Started & Local Setup

### Prerequisites
- Node.js (v18+)
- Docker & Docker Compose

### Step 1: Start PostgreSQL Database
From the project root:
```bash
docker compose up -d
```

### Step 2: Set up Backend
```bash
cd backend
npm install

# Push Prisma schema to database and generate client
npx prisma db push

# Seed test data (Admins, Store Owners, Normal Users, Stores, Ratings)
npm run seed

# Start Backend Server (runs on http://localhost:5000)
npm run dev
# or compile and run production:
# npm run build && npm start
```

### Step 3: Set up Frontend
In a new terminal window:
```bash
cd frontend
npm install

# Start Frontend Dev Server (runs on http://localhost:5173)
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 📁 Project Structure

```
store-rating-platform/
├── docker-compose.yml              # PostgreSQL 16 container definition
├── README.md                       # Documentation & evaluation guide
├── backend/
│   ├── .env                        # Port, Database URL, JWT secret
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma           # User, Store, Rating models
│   │   └── seed.ts                 # Database seeder with realistic test data
│   └── src/
│       ├── controllers/
│       │   ├── admin.controller.ts # Admin stats, user/store CRUD & filters
│       │   ├── auth.controller.ts  # Signup, login, password updates
│       │   ├── owner.controller.ts # Store owner dashboard & reviews table
│       │   ├── rating.controller.ts# Submit & modify ratings
│       │   └── store.controller.ts # User store listing with ratings
│       ├── middlewares/
│       │   └── auth.middleware.ts  # JWT verification and RBAC guards
│       ├── routes/                 # API route registrations
│       ├── utils/
│       │   └── validators.ts       # Zod validation schemas
│       ├── prisma.ts               # Prisma client singleton
│       └── server.ts               # Express server entrypoint
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.ts              # Vite config with API proxy
    ├── tailwind.config.js          # Tailwind CSS styling configuration
    └── src/
        ├── components/
        │   ├── DataTable.tsx       # Reusable table with column sorting
        │   ├── Navbar.tsx          # Role badges, password modal, logout
        │   ├── PasswordChangeModal.tsx # Password change with live checklist
        │   └── StarRating.tsx      # Interactive 1-5 star rating component
        ├── context/
        │   └── AuthContext.tsx     # JWT session state & role guards
        ├── pages/
        │   ├── AdminDashboard.tsx  # Admin metrics, users/stores tables
        │   ├── Login.tsx           # Single login with quick demo credentials
        │   ├── Signup.tsx          # User signup with validation feedback
        │   ├── StoreOwnerDashboard.tsx # Store metrics & ratings table
        │   └── UserDashboard.tsx   # Store catalog, search, and rating modal
        ├── services/
        │   └── api.ts              # Axios instance with auth interceptor
        ├── App.tsx                 # Protected route hierarchy
        └── main.tsx
```

---

## 📡 API Endpoints Reference

### Authentication (`/api/auth`)
- `POST /api/auth/signup` - Register a new normal user
- `POST /api/auth/login` - Unified login for all roles
- `PUT /api/auth/update-password` - Change password (authenticated)
- `GET /api/auth/me` - Get current authenticated user profile

### System Administrator (`/api/admin`) *(Requires ADMIN role)*
- `GET /api/admin/stats` - Dashboard counts (users, stores, ratings)
- `GET /api/admin/users` - List users with sorting & filters (Name, Email, Address, Role)
- `POST /api/admin/users` - Create new user (ADMIN, USER, STORE_OWNER)
- `GET /api/admin/stores` - List stores with sorting & filters (Name, Email, Address)
- `POST /api/admin/stores` - Create new store
- `GET /api/admin/available-owners` - List unassigned store owner users

### Stores & Ratings (`/api/stores`, `/api/ratings`)
- `GET /api/stores` - List stores with user-specific submitted ratings and search
- `POST /api/ratings` - Submit or modify store rating (1–5) *(Requires USER role)*

### Store Owner (`/api/owner`) *(Requires STORE_OWNER role)*
- `GET /api/owner/dashboard` - Get store metrics, average rating, and user ratings list
