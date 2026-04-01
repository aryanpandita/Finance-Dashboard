# Finance Dashboard API

REST backend for a finance dashboard: users and roles, financial records, aggregated dashboard data, and JWT-based access control.

## Stack

- Node.js (ESM), Express 5
- MongoDB via Mongoose
- Zod for request and environment validation
- JWT access + refresh tokens (bcrypt-hashed refresh stored on user)

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

## Setup

```bash
npm install
```

Create a `.env` file in the project root (see [Environment variables](#environment-variables)).

```bash
npm run dev
```

Server listens on `PORT` (default `5000`). Health check: `GET /`.

## Environment variables

Validated at startup with Zod (`src/config/env.js`).

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `ACCESS_TOKEN_SECRET` | Yes | Secret for signing access JWTs |
| `REFRESH_TOKEN_SECRET` | Yes | Secret for signing refresh JWTs |
| `ACCESS_TOKEN_EXPIRY` | No | Default `15m` |
| `REFRESH_TOKEN_EXPIRY` | No | Default `7d` |
| `PORT` | No | Default `5000` |
| `NODE_ENV` | No | `development` \| `production` \| `test` (default `development`) |
| `MAIL_FROM` | No | Default `noreply@finance-dashboard.dev` |

### Seed an admin user

Admin accounts are not created through public registration. Use:

```bash
node src/scripts/seedAdmin.js
```

Requires in `.env`: `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`. The script creates or upgrades that user to `admin` / `active`.

## API overview

Base path: `/api`.

### Auth (`/api/auth`)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/register` | Register (role `viewer`) |
| POST | `/login` | Login; blocked if `inactive` |
| POST | `/refresh` | New token pair; blocked if `inactive` |
| POST | `/logout` | Clear refresh token (Bearer required) |

### Users (`/api/users`) — admin only

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | List users (paginated: `page`, `limit`) |
| PATCH | `/:id/role` | Change role |
| PATCH | `/:id/status` | `active` / `inactive` |

### Records (`/api/records`) — Bearer required

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/` | viewer, analyst, admin | List with filters: `type`, `category`, `dateFrom`, `dateTo`, `page`, `limit` |
| GET | `/:id` | viewer, analyst, admin | Single record |
| POST | `/` | admin | Create |
| PATCH | `/:id` | admin | Update |
| DELETE | `/:id` | admin | Soft delete |

### Dashboard (`/api/dashboard`) — Bearer required

| Method | Path | Roles | Description |
|--------|------|-------|-------------|
| GET | `/summary` | viewer, analyst, admin | Totals, net balance, recent activity |
| GET | `/trends` | analyst, admin | Monthly income/expense (last N months, default 6) |
| GET | `/categories` | analyst, admin | Totals by category and type |

## Roles and access control

| Role | Capabilities |
|------|----------------|
| **viewer** | Read financial records; dashboard **summary** only |
| **analyst** | Same as viewer, plus `/dashboard/trends` and `/dashboard/categories` |
| **admin** | Full record CRUD; user listing and role/status updates |

Every authenticated request loads the user from the database: **inactive** accounts get `403` even if the JWT is still valid. **Role** on the token is not trusted alone; `req.user.role` reflects the current DB value after `authenticate`.

## Data model notes

- Amounts are stored in **paise** (integer minor units); adjust the frontend for display.
- Records use **soft delete** (`isDeleted`).

## Assumptions

- Self-registration creates **viewer** users only; promotion is via admin or seed script.
- Weekly trend buckets were omitted; monthly trends cover the “trends” requirement.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start with nodemon |
| `npm start` | Start with Node |
