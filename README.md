# @hexakomp/hexbase-ncore

[![npm version](https://img.shields.io/github/package-json/v/hexakomp/hexbase-ncore)](https://github.com/hexakomp/hexbase-ncore/packages)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

> Production-grade NestJS core framework package — a reusable modular backend kernel for building SaaS applications.

---

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Quick Start](#quick-start)
- [Modules](#modules)
  - [HexbaseNCoreModule](#hexbasencoremodule)
  - [AuthModule](#authmodule)
  - [UsersModule](#usersmodule)
  - [RBACModule](#rbacmodule)
  - [TableAccessModule](#tableaccessmodule)
  - [AdminModule](#adminmodule)
  - [DatabaseModule](#databasemodule)
- [Guards](#guards)
- [Decorators](#decorators)
- [Admin API Reference](#admin-api-reference)
- [Entities](#entities)
- [Database Schema](#database-schema)
- [Publishing](#publishing)
- [Development](#development)

---

## Features

- **JWT Authentication** — login endpoint, bcrypt password hashing, token signing & validation
- **Role-Based Access Control (RBAC)** — `module:action` permission model checked per-route
- **Table-Level CRUD Access** — row-level can_create / can_read / can_update / can_delete flags per role
- **Guard Chain** — `JwtAuthGuard → RBACGuard → TableAccessGuard` applied in order
- **TypeORM** — PostgreSQL entities with relationships, ready for migrations
- **Modular Architecture** — each concern is an isolated NestJS module
- **`forRoot` pattern** — single configuration entry point for the whole kernel

---

## Installation

### 1. Authenticate with GitHub Packages

Create or update your project-level `.npmrc`:

```
@hexakomp:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

### 2. Install the package and its peer dependencies

```bash
npm install @hexakomp/hexbase-ncore \
  @nestjs/common @nestjs/core @nestjs/jwt @nestjs/passport @nestjs/typeorm \
  typeorm pg passport passport-jwt bcrypt \
  class-validator class-transformer reflect-metadata rxjs
```

---

## Configuration

| Option        | Type     | Description                                   |
|---------------|----------|-----------------------------------------------|
| `databaseUrl` | `string` | PostgreSQL connection URL                     |
| `jwtSecret`   | `string` | Secret used to sign and verify JWT tokens     |

---

## Quick Start

### 1. Import in your root `AppModule`

**Basic setup** (auth + guards only):

```typescript
import { Module } from '@nestjs/common';
import { HexbaseNCoreModule } from '@hexakomp/hexbase-ncore';

@Module({
  imports: [
    HexbaseNCoreModule.forRoot({
      databaseUrl: process.env.DATABASE_URL!,
      jwtSecret:   process.env.JWT_SECRET!,
    }),
  ],
})
export class AppModule {}
```

**With Admin management endpoints** (`/admin/roles`, `/admin/permissions`, `/admin/table-access`):

```typescript
import { Module } from '@nestjs/common';
import { HexbaseNCoreModule, AdminModule } from '@hexakomp/hexbase-ncore';

@Module({
  imports: [
    HexbaseNCoreModule.forRoot({
      databaseUrl: process.env.DATABASE_URL!,
      jwtSecret:   process.env.JWT_SECRET!,
    }),
    AdminModule,  // <-- add this to enable /admin/* endpoints
  ],
})
export class AppModule {}
```

### 2. Enable validation pipe in `main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(3000);
}
bootstrap();
```

---

## Manual Testing Guide

The guard chain requires the database to contain seeded data **before** any authenticated request is made. Follow these steps in order.

### Prerequisites

- PostgreSQL running locally (or a hosted URL)
- The consumer app started with `npm run start:dev`
- A PostgreSQL client (`psql`, DBeaver, TablePlus, etc.) connected to your database

---

### Step 1 — Create the database schema

Run the SQL from the [Database Schema](#database-schema) section of this README, **or** temporarily enable `synchronize: true` in your `AppModule` so TypeORM auto-creates the tables:

```typescript
// Only for local dev — NEVER in production
HexbaseNCoreModule.forRoot({
  databaseUrl: process.env.DATABASE_URL!,
  jwtSecret: process.env.JWT_SECRET!,
  // override synchronize per environment in your own wrapper if needed
})
```

> If you need `synchronize` for local testing, patch `src/database/database.module.ts` in the library temporarily to `synchronize: true`, rebuild, and repack.

---

### Step 2 — Import `AdminModule` in your `AppModule`

The `/admin/*` endpoints are **not registered automatically** by `HexbaseNCoreModule`. You must opt in:

```typescript
import { HexbaseNCoreModule, AdminModule } from '@hexakomp/hexbase-ncore';

@Module({
  imports: [
    HexbaseNCoreModule.forRoot({
      databaseUrl: process.env.DATABASE_URL!,
      jwtSecret:   process.env.JWT_SECRET!,
    }),
    AdminModule,  // <-- required for /admin/* routes
  ],
})
export class AppModule {}
```

> Without this import, any request to `/admin/*` will return `404 Not Found` regardless of database state or permissions.

Restart the app after making this change.

---

### Step 3 — Seed a role

```sql
INSERT INTO roles (name, description)
VALUES ('admin', 'Full access administrator')
RETURNING id;
-- Note the returned id, e.g. 1
```

---

### Step 4 — Seed permissions

To use the `AdminModule` endpoints, the `admin:manage` permission **must** exist in the database and be linked to the user's role.

```sql
INSERT INTO permissions (name, description) VALUES
  ('admin:manage',   'Full access to Role/Permission/TableAccess management'),
  ('product:read',   'Can list and view products'),
  ('product:create', 'Can create products'),
  ('product:update', 'Can update products'),
  ('product:delete', 'Can delete products');
```

---

### Step 5 — Link permissions to the role

```sql
-- Replace 1 with your actual role id if different
INSERT INTO role_permissions (role_id, permission_id)
SELECT 1, id FROM permissions
WHERE name IN ('admin:manage', 'product:read','product:create','product:update','product:delete');
```

---

### Step 6 — Grant table-level CRUD access to the role

```sql
INSERT INTO table_access (role_id, table_name, can_create, can_read, can_update, can_delete)
VALUES (1, 'products', true, true, true, true);
```

---

### Step 7 — Create a user and assign the role

```bash
curl -X POST http://localhost:3000/test/users \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@test.com","password":"admin123","role_id":1}'
```

Expected response:

```json
{
  "id": 1,
  "email": "admin@test.com",
  "role_id": 1,
  "status": "active",
  "created_at": "2026-03-16T..."
}
```

> **Important:** the `role_id` field **must** be set when creating the user, otherwise the JWT will carry `roleId: null` and `RBACGuard` will reject every request with `403 Access denied: no role assigned to user`.

---

### Step 8 — Login to obtain a JWT

```bash
curl -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@test.com","password":"admin123"}'
```

Expected response:

```json
{ "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

Export the token for subsequent requests:

```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

### Step 9 — Call a guarded route

```bash
# GET — requires product:read permission + can_read on 'products' table
curl http://localhost:3000/test/products \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:

```json
{ "ok": true, "requestedBy": "admin@test.com" }
```

```bash
# POST — requires product:create permission + can_create on 'products' table
curl -X POST http://localhost:3000/test/products \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Widget","price":9.99}'
```

---

### Step 10 — Call the Admin API

```bash
# List all permissions — requires admin:manage
curl http://localhost:3000/admin/permissions \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:
```json
[
  { "id": 1, "name": "admin:manage", "description": "Full access to Role/Permission/TableAccess management" },
  { "id": 2, "name": "product:read",  "description": "Can list and view products" }
]
```

```bash
# Create a new permission
curl -X POST http://localhost:3000/admin/permissions \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"crm:contacts:read","description":"Read CRM contacts"}'
```

```bash
# List all roles (with their permissions)
curl http://localhost:3000/admin/roles \
  -H "Authorization: Bearer $TOKEN"
```

```bash
# Create a new role
curl -X POST http://localhost:3000/admin/roles \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"crm-reader","description":"CRM read-only"}'
```

```bash
# Assign permissions 1,2 to role 2
curl -X POST http://localhost:3000/admin/roles/2/permissions \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"permissionIds":[1,2]}'
```

```bash
# Set table-level CRUD flags
curl -X POST http://localhost:3000/admin/table-access \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"role_id":1,"table_name":"products","can_read":true,"can_create":true}'
```

> **404 on any `/admin/*` route?** Check that `AdminModule` is imported in your `AppModule` — see Step 2.

> **403 Forbidden?** Check that the logged-in user's role has the `admin:manage` permission linked in `role_permissions`.

---

### Step 11 — Verify guard rejections

**No token → 401 Unauthorized**

```bash
curl http://localhost:3000/test/products
# {"statusCode":401,"message":"Unauthorized"}
```

**Valid token but missing permission → 403 Forbidden**

```sql
-- Remove product:read from the role
DELETE FROM role_permissions
WHERE role_id = 1
  AND permission_id = (SELECT id FROM permissions WHERE name = 'product:read');
```

```bash
curl http://localhost:3000/test/products \
  -H "Authorization: Bearer $TOKEN"
# {"statusCode":403,"message":"Access denied: missing permission(s): product:read"}
```

**Valid token + permission but no table access → 403 Forbidden**

```sql
-- Remove table-level read access
UPDATE table_access SET can_read = false
WHERE role_id = 1 AND table_name = 'products';
```

```bash
curl http://localhost:3000/test/products \
  -H "Authorization: Bearer $TOKEN"
# {"statusCode":403,"message":"Access denied: role does not have \"GET\" access on table \"products\""}
```

---

## Modules

### HexbaseNCoreModule

The root module. Import **once** in the application root with `forRoot`.

```typescript
HexbaseNCoreModule.forRoot({ databaseUrl, jwtSecret })
```

Registers and globally exports: `AuthModule`, `UsersModule`, `RBACModule`,
`TableAccessModule`, and `DatabaseModule`.

---

### AuthModule

Provides the `/auth/login` POST endpoint, `JwtAuthGuard`, `JwtStrategy`, and `AuthService`.

```typescript
// POST /auth/login
// Body: { email: string; password: string }
// Returns: { access_token: string }
```

`AuthService` methods:

| Method                                | Description                            |
|---------------------------------------|----------------------------------------|
| `login(dto: LoginDto)`                | Validates credentials, returns token   |
| `hashPassword(password: string)`      | Bcrypt hash with salt rounds = 12      |
| `validateUser(userId: number)`        | Finds a user by ID                     |

---

### UsersModule

`UsersService` exposes full CRUD for `User` records.

```typescript
import { UsersService } from '@hexakomp/hexbase-ncore';
```

| Method                                    | Description                  |
|-------------------------------------------|------------------------------|
| `create(dto: CreateUserDto)`              | Creates and persists a user  |
| `findAll()`                               | Returns all users (no hash)  |
| `findOne(id: number)`                     | Returns one user (no hash)   |
| `findByEmail(email: string)`              | Lookup including hash        |
| `update(id, dto: UpdateUserDto)`          | Partial update               |
| `remove(id: number)`                      | Hard delete                  |

---

### RBACModule

Exports `RBACGuard` and the `@Roles` decorator.

Permissions are stored as `module:action` strings in the `permissions` table and linked to roles via the `role_permissions` join table.

```typescript
@Roles('product:create')
@Post()
create() {}
```

---

### TableAccessModule

Exports `TableAccessGuard` and the `@TableAccess` decorator.

HTTP method → CRUD flag mapping:

| HTTP Method   | Flag checked  |
|---------------|---------------|
| `GET`         | `can_read`    |
| `POST`        | `can_create`  |
| `PUT`/`PATCH` | `can_update`  |
| `DELETE`      | `can_delete`  |

```typescript
@TableAccess('products')
@Get()
findAll() {}
```

### AdminModule

Provides the management API. To enable, import `AdminModule` along with `HexbaseNCoreModule.forRoot()` in your `AppModule`.

All endpoints are protected by `JwtAuthGuard` and `RBACGuard`, requiring the user to have the `admin:manage` permission.

---

### DatabaseModule

Registers `TypeOrmModule.forRoot` with the PostgreSQL connection URL. Entities are automatically registered: `User`, `Role`, `Permission`, `TableAccess`.

> `synchronize` is `false` by default. Run migrations in production.

---

## Guards

Apply all three guards in order to get the full security chain:

```typescript
import {
  JwtAuthGuard,
  RBACGuard,
  TableAccessGuard,
  Roles,
  TableAccess,
} from '@hexakomp/hexbase-ncore';

@Controller('products')
@UseGuards(JwtAuthGuard, RBACGuard, TableAccessGuard)
export class ProductsController {

  @Get()
  @Roles('product:read')
  @TableAccess('products')
  findAll() {}

  @Post()
  @Roles('product:create')
  @TableAccess('products')
  create(@Body() dto: CreateProductDto) {}

  @Patch(':id')
  @Roles('product:update')
  @TableAccess('products')
  update(@Param('id') id: string, @Body() dto: UpdateProductDto) {}

  @Delete(':id')
  @Roles('product:delete')
  @TableAccess('products')
  remove(@Param('id') id: string) {}
}
```

---

## Decorators

### `@Roles(...permissions: string[])`

Sets the required permissions for a route. Used by `RBACGuard`.

```typescript
@Roles('product:create', 'inventory:write')
```

### `@TableAccess(tableName: string)`

Sets the table name for CRUD access validation. Used by `TableAccessGuard`.

```typescript
@TableAccess('products')
```

### `@CurrentUser()`

Parameter decorator that extracts the authenticated `JwtPayload` from the request.

```typescript
@Get('me')
getProfile(@CurrentUser() user: JwtPayload) {
  return { id: user.sub, email: user.email };
}
```

---

## Admin API Reference

All Admin endpoints are prefixed with `/admin/*`. Requires `admin:manage` permission on user's role.

### Permissions

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/permissions` | List all permissions |
| `GET` | `/admin/permissions/:id` | Get individual details |
| `POST` | `/admin/permissions` | Create a single permission |
| `POST` | `/admin/permissions/bulk` | Bulk-seeding tool (upserts on conflict) |
| `DELETE` | `/admin/permissions/:id` | Remove permission |

**Create Permission Body:**
```json
{
  "name": "crm:contacts:read",
  "description": "Optional text"
}
```

**Bulk Create Body:**
```json
{
  "permissions": [
    { "name": "crm:contacts:read" },
    { "name": "crm:contacts:create" },
    { "name": "crm:leads:delete" }
  ]
}
```

---

### Roles

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/roles` | List all roles (with permissions) |
| `GET` | `/admin/roles/:id` | Get individual details |
| `POST` | `/admin/roles` | Create role |
| `PATCH` | `/admin/roles/:id` | Update metadata |
| `DELETE` | `/admin/roles/:id` | Remove role |
| `POST` | `/admin/roles/:id/permissions` | Add permission IDs (additive) |
| `PUT` | `/admin/roles/:id/permissions` | Replace entire permission set |
| `DELETE` | `/admin/roles/:id/permissions/:permId` | Unlink a permission |

**Add Permissions to Role Body:**
```json
{
  "permissionIds": [1, 2, 3]
}
```

---

### Table Access (Row-level flags)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/admin/table-access` | List all table access records |
| `GET` | `/admin/table-access?roleId=1` | Filter for a specific role |
| `POST` | `/admin/table-access` | Upsert flags by role_id + table_name |
| `PATCH` | `/admin/table-access/:id` | Partial update of flags |

**Upsert Table Access Body:**
```json
{
  "role_id": 1,
  "table_name": "products",
  "can_read": true,
  "can_create": true
}
```

---

## Entities

### `User`

| Column          | Type        | Notes                        |
|-----------------|-------------|------------------------------|
| `id`            | int PK      | Auto-generated               |
| `email`         | varchar     | Unique                       |
| `password_hash` | varchar     | Bcrypt hash                  |
| `role_id`       | int FK      | References `roles.id`        |
| `status`        | enum        | `active` \| `inactive` \| `suspended` |
| `created_at`    | timestamptz | Auto-set on creation         |

### `Role`

| Column        | Type    | Notes    |
|---------------|---------|----------|
| `id`          | int PK  |          |
| `name`        | varchar | Unique   |
| `description` | varchar | Nullable |

### `Permission`

| Column        | Type    | Notes                              |
|---------------|---------|------------------------------------|
| `id`          | int PK  |                                    |
| `name`        | varchar | Unique — format: `module:action`   |
| `description` | varchar | Nullable                           |

### `TableAccess`

| Column       | Type    | Notes                         |
|--------------|---------|-------------------------------|
| `id`         | int PK  |                               |
| `role_id`    | int FK  | References `roles.id`         |
| `table_name` | varchar |                               |
| `can_create` | boolean | Default `false`               |
| `can_read`   | boolean | Default `false`               |
| `can_update` | boolean | Default `false`               |
| `can_delete` | boolean | Default `false`               |

> Unique constraint on `(role_id, table_name)`.

---

## Database Schema

```sql
CREATE TABLE roles (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) UNIQUE NOT NULL,
  description VARCHAR(255)
);

CREATE TABLE permissions (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) UNIQUE NOT NULL,  -- e.g. product:create
  description VARCHAR(255)
);

CREATE TABLE role_permissions (
  role_id       INTEGER REFERENCES roles(id) ON DELETE CASCADE,
  permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');

CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255)        NOT NULL,
  role_id       INTEGER REFERENCES roles(id) ON DELETE SET NULL,
  status        user_status DEFAULT 'active',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE table_access (
  id          SERIAL PRIMARY KEY,
  role_id     INTEGER     NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  table_name  VARCHAR(100) NOT NULL,
  can_create  BOOLEAN DEFAULT FALSE,
  can_read    BOOLEAN DEFAULT FALSE,
  can_update  BOOLEAN DEFAULT FALSE,
  can_delete  BOOLEAN DEFAULT FALSE,
  UNIQUE (role_id, table_name)
);
```

---

## Publishing

The package is published to [GitHub Packages](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry).

```bash
# Build the package
npm run build

# Publish to https://npm.pkg.github.com
npm run publish:github
```

Ensure the `NODE_AUTH_TOKEN` environment variable (or `.npmrc` entry) contains a GitHub PAT with `write:packages` scope.

---

## Development

```bash
# Install dependencies
npm install

# Build (outputs to dist/)
npm run build

# Build in watch mode
npm run build:watch

# Run tests
npm test

# Run tests with coverage
npm run test:cov
```
