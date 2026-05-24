# hesapport-api

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines Express and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **Express** - Fast, unopinionated web framework with REST API
- **Node.js** - Runtime environment
- **Drizzle** - TypeScript-first ORM
- **PostgreSQL** - Database engine
- **Authentication** - Better-Auth
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
npm install
```

## Database Setup

This project uses PostgreSQL with Drizzle ORM.

1. Make sure you have a PostgreSQL database set up.
2. Update your `apps/server/.env` file with your PostgreSQL connection details.

3. Apply the schema to your database:

```bash
npm run db:push
```

4. Run migrations (organization tables; drops legacy RBAC if present):

```bash
npm run db:migrate
```

5. Seed platform admin user:

```bash
npm run auth:seed
```

Then, run the development server:

```bash
npm run dev
```

The API is running at [http://localhost:3000](http://localhost:3000).

## API Routes

### App (`/api`)

- `GET /api/health` - Health check
- `GET /api/private` - Authenticated user info
- `GET /api/todos` - List todos
- `POST /api/todos` - Create todo
- `PATCH /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo

### Organization (`/api/organization`)

Requires session (sign up / sign in). Each new user automatically gets an organization (owner).

- `GET /api/organization` - List my organizations
- `GET /api/organization/active` - Active organization with members
- `GET /api/organization/members` - List members
- `POST /api/organization/members/invite` - Invite member (`email`, `role`)
- `PATCH /api/organization/members/role` - Update member role
- `POST /api/organization/members/remove` - Remove member
- `GET /api/organization/invitations` - List pending invitations
- `POST /api/organization/invitations/:id/accept` - Accept invitation

Better Auth also exposes `/api/auth/organization/*` for the same features.

### Admin (`/admin`)

Platform admin uses [Better Auth Admin plugin](https://better-auth.com/docs/plugins/admin) (`user.role = admin`, full user/session permissions).

Default admin: run `npm run auth:seed` (see `ADMIN_*` in `apps/server/.env`).

- `POST /admin/auth/login` - Platform admin login
- `POST /admin/auth/logout` - Logout
- `GET /admin/auth/session` - Session
- `GET /admin/users` - List users
- `POST /admin/users` - Create user
- `PUT /admin/users/:id/role` - Set role (`user` | `admin`)
- `POST /admin/users/:id/ban` - Ban user
- `POST /admin/users/:id/unban` - Unban user
- `DELETE /admin/users/:id` - Remove user
- `GET /admin/organizations` - List all organizations (DB)
- `POST /admin/organizations/check-slug` - Check slug availability (Better Auth)
- `GET /admin/organizations/:id` - Organization detail + members (Better Auth)
- `POST /admin/organizations` - Create organization for a user (Better Auth, `userId` = owner)
- `PATCH /admin/organizations/:id` - Update organization (Better Auth)
- `DELETE /admin/organizations/:id` - Delete organization (Better Auth)

Better Auth admin routes: `/api/auth/admin/*`  
Better Auth organization routes: `/api/auth/organization/*`

### Auth (`/api/auth`)

Better Auth handles authentication at `/api/auth/*`.

## Project Structure

```
hesapport-api/
├── apps/
│   └── server/      # Backend API (Express)
├── packages/
│   ├── api/         # App API routes & shared middleware
│   ├── admin-api/   # Admin dashboard API (`/admin`)
│   ├── auth/        # Authentication configuration & logic
│   └── db/          # Database schema & queries
```

## Available Scripts

- `npm run dev`: Start all applications in development mode
- `npm run build`: Build all applications
- `npm run dev:server`: Start only the server
- `npm run check-types`: Check TypeScript types across all apps
- `npm run db:push`: Push schema changes to database
- `npm run db:generate`: Generate database client/types
- `npm run db:migrate`: Run database migrations
- `npm run db:studio`: Open database studio UI
- `npm run auth:seed`: Seed platform admin user (`user.role = admin`)
