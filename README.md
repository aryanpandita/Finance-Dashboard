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

## API documentation (Swagger UI)

The app serves interactive OpenAPI docs at **`/api-docs`**. The machine-readable spec lives in `src/docs/openapi.json`.

### For reviewers: use Swagger locally

`http://localhost` only runs on **your** computer. A reviewer must clone the repo, configure the environment, and start the server on **their** machine—then Swagger works in **their** browser.

1. **Clone the repository** and open a terminal in the project root.

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start MongoDB** (local instance or use a MongoDB Atlas connection string).

4. **Create `.env`** in the project root. Copy from `.env.example` and set at minimum:

   - `MONGODB_URI`
   - `ACCESS_TOKEN_SECRET`
   - `REFRESH_TOKEN_SECRET`

5. **Seed an admin user** (required to test admin-only routes). Add to `.env`: `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, then run:

   ```bash
   node src/scripts/seedAdmin.js
   ```

6. **Start the API**

   ```bash
   npm run dev
   ```

   Wait until the console shows the server listening (default port **5000**).

7. **Open Swagger UI** in a browser:

   `http://localhost:5000/api-docs`

   If `PORT` in `.env` is not `5000`, use `http://localhost:<PORT>/api-docs`.

8. **Get a JWT and call protected routes**

   - Open **`POST /api/auth/register`** or **`POST /api/auth/login`**.
   - Click **Try it out**, fill the body, click **Execute**.
   - In the response, copy the **`accessToken`** value from `data`.
   - Click the green **Authorize** button at the top of the page.
   - In the value field, paste **only the token** (Swagger adds the `Bearer` prefix for you in many versions; if it asks for the full header, use: `Bearer <your-access-token>`).
   - Click **Authorize**, then **Close**.
   - You can now **Try it out** on routes that need authentication (e.g. `/api/records`, `/api/dashboard/summary`). Use the **admin** account from the seed script for admin-only endpoints.

9. **If the access token expires**, call **`POST /api/auth/refresh`** with the `refreshToken` from login/register, or log in again.

**Deployed API:** If this project is hosted publicly, use **`https://<your-domain>/api-docs`** instead—no local setup required beyond having the URL.

**Without running the server:** You can still read the contract in `src/docs/openapi.json` on GitHub (raw file or blob view).

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
