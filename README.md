# docs-collab

A real-time collaborative document editor. Users can create and join documents using a PIN, edit simultaneously, and authenticate via email/password or Google OAuth.

---

## Project Structure

```
docs-collab/
├── backend/          Express API server
├── frontend/         React + Vite SPA
├── shared/           Shared TypeScript types (@docs-collab/shared)
├── constants/        (legacy — superseded by shared/)
├── package.json      Monorepo root: workspaces, scripts, dev tooling
├── eslint.config.js
├── .prettierrc
└── commitlint.config.js
```

This is an **npm workspaces monorepo**. All three sub-packages (`frontend`, `backend`, `shared`) live in one repository and are managed together. The root `package.json` is the orchestrator — it does not ship any application code itself.

---

## Why a Monorepo?

- Frontend and backend can share TypeScript types (via `shared/`) without publishing to npm
- One `npm install` from the root installs everything
- One lint/format/commit pipeline covers the entire codebase
- `npm run dev` starts both servers with a single command

---

## Root Level

The root is the **workspace orchestrator and tooling host**. Nothing here is imported by application code.

| File                              | Purpose                                                                                                |
| --------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `package.json`                    | Declares workspaces, runs `concurrently` for dev, wires build/lint scripts                             |
| `eslint.config.js`                | Single ESLint flat config for the whole repo                                                           |
| `.prettierrc` / `.prettierignore` | Formatting rules                                                                                       |
| `commitlint.config.js`            | Enforces [Conventional Commits](https://www.conventionalcommits.org/) (e.g. `feat:`, `fix:`, `chore:`) |
| `.husky/pre-commit`               | Runs lint-staged before every commit (lint + format changed files only)                                |
| `.husky/commit-msg`               | Runs commitlint to reject malformed commit messages                                                    |

**Key root scripts:**

```bash
npm run dev          # starts frontend + backend concurrently
npm run build        # builds frontend, then backend
npm run lint         # lints all workspaces
npm run format       # formats everything with Prettier
```

---

## `shared/` — @docs-collab/shared

```
shared/
└── src/
    ├── index.ts     re-exports everything
    └── user.ts      IUser interface
```

**Why it exists:** TypeScript interfaces need to be identical on both sides of the wire. Rather than duplicating them or using a hack like `../../../constants/user` (which breaks `rootDir` and deployment), `shared/` is a proper npm workspace package.

Both `frontend` and `backend` declare `"@docs-collab/shared": "*"` as a dependency. npm workspaces creates a symlink: `node_modules/@docs-collab/shared → ../../shared`. Neither package needs to know where the other lives on disk.

**Usage:**

```ts
import type { IUser } from '@docs-collab/shared';
```

**Rule of thumb for what goes here:** if you write `import` from it in app code, it belongs in `shared/`. If it only runs in a terminal or git hook, it belongs at the root.

---

## `backend/` — Express API

```
backend/
├── src/
│   ├── index.ts           Express app bootstrap, middleware, route mounting
│   ├── db/
│   │   └── db.ts          MongoDB connection via Mongoose
│   ├── models/
│   │   └── User.ts        Mongoose schema + model (typed against IUser)
│   ├── controllers/
│   │   └── auth.ts        registerController, loginController, googleSignInController
│   ├── routes/
│   │   └── auth.ts        Mounts controllers at POST /register /login /google
│   └── utils/
│       └── helper.ts      signToken (JWT), sanitizeUsername
├── .env                   MONGODB_URL, PORT, JWT_SECRET, GOOGLE_CLIENT_ID
├── tsconfig.json          target: ES2022, module: NodeNext, rootDir: ./src
└── package.json           type: commonjs
```

**Tech choices:**

| Choice              | Reason                                                         |
| ------------------- | -------------------------------------------------------------- |
| Express 5           | Stable, minimal, async error propagation built-in              |
| Mongoose            | Schema validation + TypeScript generics on top of MongoDB      |
| bcrypt-ts           | Password hashing, pure TypeScript (no native bindings)         |
| jsonwebtoken        | Signs 7-day JWTs returned to the client                        |
| google-auth-library | Verifies Google ID tokens (OAuth credential from the frontend) |
| tsx                 | Runs TypeScript directly in dev — no compile step needed       |
| nodemon             | Watches `src/` and restarts on file changes                    |

**Auth flow:**

```
Email/password:
  POST /api/auth/register  →  hash password  →  create User  →  return JWT
  POST /api/auth/login     →  verify hash    →  return JWT

Google OAuth:
  POST /api/auth/google    →  verify ID token with Google
                           →  find or create User (provider: 'google')
                           →  return JWT
```

The backend never redirects to Google — the frontend handles the Google button and sends back the `credential` (ID token). The backend only verifies it.

**Environment variables (`.env`):**

```
MONGODB_URL=      MongoDB Atlas connection string
PORT=5000
JWT_SECRET=       Long random secret (use: openssl rand -hex 32)
GOOGLE_CLIENT_ID= From Google Cloud Console → APIs & Services → Credentials
```

---

## `frontend/` — React SPA

```
frontend/
├── src/
│   ├── main.tsx               React entry, router setup
│   ├── routes/                File-based routing (TanStack Router)
│   │   ├── __root.tsx         Root layout (Navbar, ThemeProvider wrapper)
│   │   ├── index.tsx          / → renders Home page
│   │   ├── login.tsx          /login → renders Login page
│   │   └── register.tsx       /register → renders Register page
│   ├── routeTree.gen.ts       AUTO-GENERATED — do not edit manually
│   ├── pages/                 Full-page components rendered by routes
│   │   ├── Home.tsx
│   │   ├── Login.tsx
│   │   └── Register.tsx
│   ├── components/
│   │   └── Navbar.tsx         Sticky header with theme toggle
│   ├── context/
│   │   └── ThemeContext.tsx   Dark/light mode (persisted in localStorage)
│   ├── api/
│   │   ├── axios.ts           Axios instance pre-configured with base URL
│   │   └── auth.ts            API call functions (register, login, google)
│   └── utils/
│       └── zod/               Zod validation schemas for forms
│           ├── login-schema.ts
│           └── register-schema.ts
├── .env.development           VITE_DEV_BACKEND_URL=http://localhost:5000
├── .env.production            VITE_DEV_BACKEND_URL=<production API URL>
├── vite.config.ts
└── tsconfig.app.json
```

**Tech choices:**

| Choice            | Reason                                                                                                                   |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Vite              | Fast HMR, native ES modules, much faster than CRA                                                                        |
| TanStack Router   | Type-safe file-based routing; auto-generates `routeTree.gen.ts` from the `routes/` folder structure                      |
| MUI (Material-UI) | Component library with built-in theming and dark mode                                                                    |
| Tailwind CSS 4    | Utility classes alongside MUI for layout/spacing                                                                         |
| react-hook-form   | Uncontrolled form inputs — minimal re-renders                                                                            |
| Zod               | Schema-first validation; schemas in `utils/zod/` are shared between form resolvers and (eventually) API response parsing |

**Routing:** TanStack Router scans `src/routes/` at build time and generates `routeTree.gen.ts`. The file structure directly maps to URL structure. Never edit `routeTree.gen.ts` by hand — it regenerates on every save.

**Environment variable pattern:** Vite exposes only variables prefixed with `VITE_`. The axios base URL reads `import.meta.env.VITE_DEV_BACKEND_URL` so it automatically points to localhost in dev and the production server in production builds.

---

## Deployment (Intended)

No deployment config exists yet. The intended setup:

```
┌─────────────────────┐        ┌──────────────────────┐
│   Vercel / Netlify  │        │  Render / Railway    │
│   (frontend/)       │──API──▶│  (backend/)          │
│   Static SPA        │        │  Node.js + Express   │
└─────────────────────┘        └──────────┬───────────┘
                                           │
                                ┌──────────▼───────────┐
                                │   MongoDB Atlas      │
                                │   (cloud DB)         │
                                └──────────────────────┘
```

**Frontend** (`npm run build -w frontend`): outputs a `frontend/dist/` folder of static HTML/JS/CSS. Deploy that folder to any static host. Set `VITE_DEV_BACKEND_URL` to the backend's production URL before building.

**Backend** (`npm run build -w backend`): compiles TypeScript to `backend/dist/`. The host runs `node dist/index.js`. Set all four environment variables (`MONGODB_URL`, `PORT`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`) as secrets on the host platform. The `shared/` package is resolved via the workspace symlink during build — it is not a separate deploy artifact.

**`shared/`** is never deployed on its own. It only exists to satisfy the TypeScript compiler and has no runtime output (interfaces are erased at compile time).

---

## Local Development

```bash
# From repo root:
npm install          # installs all workspaces + links @docs-collab/shared

npm run dev          # starts both servers:
                     #   backend  → http://localhost:5000
                     #   frontend → http://localhost:5173
```

Commit messages must follow Conventional Commits or the pre-commit hook will reject them:

```
feat: add google sign in
fix: handle duplicate email on register
chore: update dependencies
```
