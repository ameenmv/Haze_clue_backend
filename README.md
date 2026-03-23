# Haze Clue - Backend API

**Haze Clue** is a web-based EEG attention monitoring platform that allows instructors and students to track cognitive attention levels in real time through connected BCI (Brain-Computer Interface) devices. This repository contains the backend API built on NestJS with MongoDB.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Database Schemas](#database-schemas)
- [API Endpoints](#api-endpoints)
- [Authentication](#authentication)
- [WebSocket Gateway](#websocket-gateway)
- [Coding Conventions](#coding-conventions)

---

## Tech Stack

| Category            | Technology                                                    |
| ------------------- | ------------------------------------------------------------- |
| Framework           | NestJS 11.x (Express)                                        |
| Language            | TypeScript 5.x (strict mode)                                 |
| Database            | MongoDB 7.x via Mongoose 8.x (@nestjs/mongoose)              |
| Authentication      | JWT (passport-jwt, @nestjs/jwt, @nestjs/passport)            |
| Password Hashing    | bcrypt 6.x                                                   |
| Validation          | class-validator + class-transformer                          |
| Configuration       | @nestjs/config (dotenv-based)                                |
| WebSocket           | @nestjs/websockets + Socket.IO (@nestjs/platform-socket.io)  |
| Package Manager     | pnpm 10.x                                                    |
| Runtime             | Node.js 22.x                                                 |

---

## Architecture Overview

The backend follows NestJS's modular architecture with a clean separation of concerns:

```
Client Request (HTTP / WebSocket)
     |
     v
Guards (JWT Authentication)
     |
     v
Controllers (route handlers, request validation)
     |
     v
Services (business logic)
     |
     v
Mongoose Models (database operations)
     |
     v
MongoDB
```

All HTTP endpoints are served under the `/api` prefix. The Nuxt frontend proxies `/api/**` requests to this server, avoiding CORS issues entirely.

---

## Project Structure

```
haze_clue_backend/
├── src/
│   ├── main.ts                          # Application bootstrap (CORS, prefix, port)
│   ├── app.module.ts                    # Root module (Config, Mongoose, feature modules)
│   │
│   ├── common/                          # Shared infrastructure
│   │   ├── decorators/                  # Custom decorators (@CurrentUser, etc.)
│   │   ├── guards/                      # Auth guards (JwtAuthGuard)
│   │   ├── pipes/                       # Global validation pipe config
│   │   ├── filters/                     # Global exception filter
│   │   └── dto/                         # Shared DTOs (ApiResponse, PaginatedResponse)
│   │
│   ├── auth/                            # Authentication module
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts           # POST /auth/login, /auth/register, etc.
│   │   ├── auth.service.ts              # Business logic (hashing, JWT, OTP)
│   │   ├── strategies/                  # Passport JWT strategy
│   │   └── dto/                         # Login, Register, ForgotPassword DTOs
│   │
│   ├── users/                           # User management module
│   │   ├── users.module.ts
│   │   ├── users.controller.ts          # GET/PATCH/DELETE /users/me
│   │   ├── users.service.ts
│   │   └── schemas/
│   │       └── user.schema.ts           # Mongoose User schema
│   │
│   ├── sessions/                        # Session management module
│   │   ├── sessions.module.ts
│   │   ├── sessions.controller.ts       # CRUD + start/end live session
│   │   ├── sessions.service.ts
│   │   └── schemas/
│   │       └── session.schema.ts        # Mongoose Session schema
│   │
│   ├── devices/                         # Device management module
│   │   ├── devices.module.ts
│   │   ├── devices.controller.ts        # CRUD for EEG/BCI devices
│   │   ├── devices.service.ts
│   │   └── schemas/
│   │       └── device.schema.ts         # Mongoose Device schema
│   │
│   ├── reports/                         # Reports module
│   │   ├── reports.module.ts
│   │   ├── reports.controller.ts        # List, details, generate
│   │   ├── reports.service.ts
│   │   └── schemas/
│   │       └── report.schema.ts         # Mongoose Report schema
│   │
│   ├── dashboard/                       # Dashboard statistics module
│   │   ├── dashboard.module.ts
│   │   ├── dashboard.controller.ts      # GET /dashboard/stats, /dashboard/recent-activity
│   │   └── dashboard.service.ts
│   │
│   └── gateway/                         # WebSocket gateway (live monitoring)
│       ├── gateway.module.ts
│       └── eeg.gateway.ts               # Real-time EEG data broadcasting
│
├── .env                                 # Environment config (gitignored)
├── .env.example                         # Environment template
├── package.json
├── tsconfig.json
└── nest-cli.json
```

---

## Getting Started

### Prerequisites

- **Node.js** 22.x
- **pnpm** 10.x+
- **MongoDB** 7.x (local or Atlas)

### Installation

```bash
# Clone the repository
git clone https://github.com/HazeClue/Haze_clue_backend.git
cd Haze_clue_backend

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start development server
pnpm run start:dev
```

The API server starts at `http://localhost:3001/api` by default.

---

## Environment Variables

Create a `.env` file in the project root. Reference `.env.example` for all available variables:

| Variable         | Required | Description                        | Default                                  |
| ---------------- | -------- | ---------------------------------- | ---------------------------------------- |
| `MONGODB_URI`    | Yes      | MongoDB connection string          | `mongodb://localhost:27017/haze_clue`    |
| `JWT_SECRET`     | Yes      | Secret key for JWT signing         | --                                       |
| `JWT_EXPIRES_IN` | No       | JWT token expiration duration      | `7d`                                     |
| `PORT`           | No       | API server port                    | `3001`                                   |

---

## Available Scripts

| Command                | Description                                          |
| ---------------------- | ---------------------------------------------------- |
| `pnpm run start:dev`   | Start development server with hot-reload (watch mode)|
| `pnpm run start:debug` | Start with debugger attached                         |
| `pnpm run build`       | Compile TypeScript to JavaScript                     |
| `pnpm run start:prod`  | Run the compiled production build                    |
| `pnpm run lint`        | Run ESLint across the project                        |
| `pnpm run test`        | Run unit tests with Jest                             |
| `pnpm run test:e2e`    | Run end-to-end tests                                 |

---

## Database Schemas

### User

| Field        | Type                                      | Description                        |
| ------------ | ----------------------------------------- | ---------------------------------- |
| `fullName`   | `string`                                  | Required, trimmed                  |
| `email`      | `string`                                  | Unique, lowercase, trimmed         |
| `password`   | `string`                                  | bcrypt hashed (excluded from JSON) |
| `phone`      | `string?`                                 | Optional phone number              |
| `avatar`     | `string?`                                 | Optional avatar URL                |
| `status`     | `number`                                  | `0` = unverified, `1` = active     |
| `otp`        | `{ code: string, expiresAt: Date }`       | Excluded from JSON                 |
| `resetToken` | `{ token: string, expiresAt: Date }`      | Excluded from JSON                 |
| `deletedAt`  | `Date?`                                   | Soft-delete timestamp              |
| `createdAt`  | `Date`                                    | Auto-generated                     |
| `updatedAt`  | `Date`                                    | Auto-generated                     |

**Indexes:** `email` (unique), `resetToken.token` (sparse)

### Session

| Field                | Type                                         | Description                    |
| -------------------- | -------------------------------------------- | ------------------------------ |
| `user`               | `ObjectId → User`                            | Required, indexed              |
| `title`              | `string`                                     | Required                       |
| `className`          | `string`                                     | Class/group name               |
| `subject`            | `string`                                     | Subject being taught           |
| `duration`           | `number`                                     | Duration in minutes            |
| `students`           | `number`                                     | Number of students             |
| `status`             | `draft \| scheduled \| active \| completed`  | Default: `draft`               |
| `monitoringSettings` | `{ attentionTracking, alerts, recording }`   | Boolean flags                  |
| `notes`              | `string?`                                    | Optional notes                 |
| `startedAt`          | `Date?`                                      | When session was started       |
| `endedAt`            | `Date?`                                      | When session was ended         |

**Indexes:** `(user, createdAt)` compound, `status`

### Device

| Field          | Type                                    | Description                        |
| -------------- | --------------------------------------- | ---------------------------------- |
| `user`         | `ObjectId → User`                       | Required, indexed                  |
| `name`         | `string`                                | Device display name                |
| `type`         | `EEG \| BCI`                            | Device type                        |
| `serialNumber` | `string`                                | Required                           |
| `status`       | `connected \| disconnected \| error`    | Default: `disconnected`            |
| `lastSeen`     | `Date?`                                 | Last communication timestamp       |

**Indexes:** `(user, serialNumber)` unique compound, `(user, status)`

### Report

| Field         | Type                                                  | Description                    |
| ------------- | ----------------------------------------------------- | ------------------------------ |
| `user`        | `ObjectId → User`                                     | Required, indexed              |
| `session`     | `ObjectId → Session`                                  | Required, indexed              |
| `title`       | `string`                                              | Report title                   |
| `data`        | `{ avgAttention, peakAttention, timeline[], distribution }` | EEG analytics data       |
| `generatedAt` | `Date`                                                | Default: current timestamp     |

**Indexes:** `(user, generatedAt)` compound, `session`

---

## API Endpoints

### Auth (`/api/auth`)

| Method | Route               | Description                        | Auth |
| ------ | ------------------- | ---------------------------------- | ---- |
| POST   | `/auth/register`    | Register with email + password     | No   |
| POST   | `/auth/login`       | Login, returns JWT token           | No   |
| POST   | `/auth/forgot-password` | Send OTP to email              | No   |
| POST   | `/auth/verify-otp`  | Verify 6-digit OTP code           | No   |
| POST   | `/auth/resend-otp`  | Resend OTP to email               | No   |
| POST   | `/auth/reset-password` | Reset password with token       | No   |
| POST   | `/auth/logout`      | Invalidate JWT token               | Yes  |

### Users (`/api/users`)

| Method | Route                | Description               | Auth |
| ------ | -------------------- | ------------------------- | ---- |
| GET    | `/users/me`          | Get current user profile  | Yes  |
| PATCH  | `/users/me`          | Update profile            | Yes  |
| PATCH  | `/users/me/password` | Change password           | Yes  |
| DELETE | `/users/me`          | Soft-delete account       | Yes  |

### Sessions (`/api/sessions`)

| Method | Route                  | Description               | Auth |
| ------ | ---------------------- | ------------------------- | ---- |
| GET    | `/sessions`            | List sessions (paginated) | Yes  |
| POST   | `/sessions`            | Create new session        | Yes  |
| GET    | `/sessions/:id`        | Get session details       | Yes  |
| PATCH  | `/sessions/:id`        | Update session            | Yes  |
| DELETE | `/sessions/:id`        | Delete session            | Yes  |
| POST   | `/sessions/:id/start`  | Start live session        | Yes  |
| POST   | `/sessions/:id/end`    | End live session          | Yes  |

### Devices (`/api/devices`)

| Method | Route           | Description             | Auth |
| ------ | --------------- | ----------------------- | ---- |
| GET    | `/devices`      | List user's devices     | Yes  |
| POST   | `/devices`      | Register new device     | Yes  |
| GET    | `/devices/:id`  | Get device details      | Yes  |
| PATCH  | `/devices/:id`  | Update device           | Yes  |
| DELETE | `/devices/:id`  | Remove device           | Yes  |

### Reports (`/api/reports`)

| Method | Route               | Description                    | Auth |
| ------ | ------------------- | ------------------------------ | ---- |
| GET    | `/reports`          | List reports (paginated)       | Yes  |
| GET    | `/reports/:id`      | Get report details             | Yes  |
| POST   | `/reports/generate` | Generate report from session   | Yes  |

### Dashboard (`/api/dashboard`)

| Method | Route                      | Description                              | Auth |
| ------ | -------------------------- | ---------------------------------------- | ---- |
| GET    | `/dashboard/stats`         | Device count, sessions, avg attention    | Yes  |
| GET    | `/dashboard/recent-activity` | Recent user actions list               | Yes  |

---

## Authentication

The API uses JWT Bearer token authentication:

1. **Login/Register** returns a flat `{ id, fullName, email, token }` response
2. Clients send the token via `Authorization: Bearer <token>` header
3. Protected routes use `JwtAuthGuard`
4. The `@CurrentUser()` decorator extracts `userId` from the JWT payload

### Response Format

All responses follow a consistent envelope:

```json
{
  "data": { ... },
  "status": 200,
  "message": "Success"
}
```

Paginated responses add:

```json
{
  "data": [ ... ],
  "status": 200,
  "message": "Success",
  "links": {
    "first": "/api/sessions?page=1",
    "last": "/api/sessions?page=5",
    "prev": null,
    "next": "/api/sessions?page=2"
  },
  "meta": {
    "current_page": 1,
    "from": 1,
    "last_page": 5,
    "per_page": 10,
    "to": 10,
    "total": 50,
    "links": [ ... ],
    "path": "/api/sessions"
  }
}
```

---

## WebSocket Gateway

Real-time EEG monitoring uses Socket.IO:

| Event              | Direction        | Description                           |
| ------------------ | ---------------- | ------------------------------------- |
| `session:join`     | Client → Server  | Join a live session room              |
| `eeg:data`         | Client → Server  | Device sends raw EEG data            |
| `attention:update` | Server → Client  | Broadcast computed attention levels   |
| `session:end`      | Server → Client  | Notify session has ended             |

---

## Coding Conventions

### General

- **TypeScript** strict mode is enforced
- **NestJS decorators** for dependency injection, routing, and validation
- **class-validator** decorators for DTO validation
- **Mongoose schemas** use the `@nestjs/mongoose` decorator pattern

### File Naming

| Type          | Convention                          | Example                    |
| ------------- | ----------------------------------- | -------------------------- |
| Modules       | `{feature}.module.ts`               | `sessions.module.ts`       |
| Controllers   | `{feature}.controller.ts`           | `sessions.controller.ts`   |
| Services      | `{feature}.service.ts`              | `sessions.service.ts`      |
| Schemas       | `{model}.schema.ts`                 | `session.schema.ts`        |
| DTOs          | `{action}-{feature}.dto.ts`         | `create-session.dto.ts`    |
| Guards        | `{name}.guard.ts`                   | `jwt-auth.guard.ts`        |
| Strategies    | `{name}.strategy.ts`                | `jwt.strategy.ts`          |
| Decorators    | `{name}.decorator.ts`               | `current-user.decorator.ts`|

### Module Organization

Each feature module follows this structure:

```
{feature}/
├── {feature}.module.ts        # Module definition
├── {feature}.controller.ts    # Route handlers
├── {feature}.service.ts       # Business logic
├── schemas/                   # Mongoose schemas
│   └── {model}.schema.ts
└── dto/                       # Data Transfer Objects
    ├── create-{model}.dto.ts
    └── update-{model}.dto.ts
```

---

## License

This project is proprietary software. All rights reserved by Haze Clue.
