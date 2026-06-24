# docs-collab

docs-collab is a real-time collaborative document editor for rich text and code-heavy docs. It is built as an npm workspaces monorepo with a React/Vite frontend, an Express/MongoDB backend, and a shared TypeScript package for validation schemas and types.

The current app supports email/password and Google sign-in, cookie-based sessions with refresh tokens, CSRF protection, document dashboards, live multi-user editing, collaborator presence, read/write sharing, public links, offline local document cache, syntax-highlighted code blocks, in-editor Prettier formatting, pagination, and print output.

## Workspace Layout

```text
docs-collab/
|-- backend/              Express API, Socket.io, MongoDB models
|-- frontend/             React 19 + Vite SPA
|-- shared/               Shared Zod schemas and TypeScript types
|-- .husky/               lint-staged and commitlint hooks
|-- commitlint.config.js  Conventional Commits config
|-- eslint.config.js      Root ESLint flat config
|-- package.json          npm workspace scripts
`-- README.md
```

Generated or local-only folders such as `node_modules/`, `dist/`, `dev-dist/`, and environment files are ignored by git and are not part of the source contract.

## Packages

### Root

The root package only orchestrates the workspace. It does not contain application runtime code.

```bash
npm install
npm run dev
npm run build
npm run lint
npm run format
```

Root scripts:

| Script                 | What it does                                             |
| ---------------------- | -------------------------------------------------------- |
| `npm run dev`          | Starts frontend and backend together with `concurrently` |
| `npm run dev:frontend` | Runs Vite in `frontend/`                                 |
| `npm run dev:backend`  | Runs the Express server with `nodemon` and `tsx`         |
| `npm run build`        | Builds frontend, then backend                            |
| `npm run lint`         | Runs ESLint across the repo                              |
| `npm run lint:fix`     | Runs ESLint fixes across the repo                        |
| `npm run format`       | Formats the repo with Prettier                           |
| `npm run preview`      | Serves the built frontend preview                        |
| `npm run start`        | Starts the compiled backend                              |

Husky runs `lint-staged` before commits and commitlint on commit messages. Commit messages should follow Conventional Commits, for example `feat: add document sharing`.

### `shared/`

`@docs-collab/shared` exports reusable contracts:

- Auth schemas: register, login, Google sign-in
- Document schemas: create document, patch title, share document, set public access
- User and document TypeScript types

Both `frontend` and `backend` import these contracts through the workspace package instead of duplicating validation logic.

### `backend/`

The backend is an Express 5 API with MongoDB/Mongoose persistence and Socket.io for live collaboration.

Important folders:

```text
backend/src/
|-- controllers/    Auth and document controller logic
|-- db/             Mongoose connection
|-- middlewares/    Auth, validation, rate limit, error handling
|-- models/         User, Session, Document
|-- routes/         /api/v1/auth and /api/v1/docs routers
|-- socket/         Socket.io + Yjs room synchronization
|-- csrf.ts         double-submit CSRF configuration
`-- index.ts        Server bootstrap
```

Backend responsibilities:

- Connect to MongoDB with `MONGODB_URL`
- Issue short-lived HTTP-only `accessToken` cookies and rotating `refreshToken` cookies
- Store hashed refresh tokens in `Session` documents with TTL expiry
- Protect mutating requests with `csrf-csrf`
- Rate-limit all API traffic and tighten limits for auth endpoints
- Validate request bodies with shared Zod schemas
- Store document metadata, collaborators, public access settings, and Yjs state
- Authorize document access for owners, collaborators, and public-link users
- Attach Socket.io to the same HTTP server for Yjs updates and awareness

### `frontend/`

The frontend is a Vite SPA using React 19, TanStack Router, TanStack Query, Tailwind CSS 4, MUI icons/components, Tiptap, Yjs, and Socket.io Client.

Important folders:

```text
frontend/src/
|-- api/          Axios clients for auth and docs
|-- components/   Navbar and editor UI
|-- context/      Auth and theme providers
|-- hooks/        Auth, docs, and collaboration hooks
|-- lib/          Socket, Yjs provider, code formatting, user colors
|-- pages/        Home, login, register, dashboard, editor
|-- routes/       TanStack file routes
`-- index.css     Tailwind, editor, pagination, and print styles
```

Frontend responsibilities:

- Render the marketing home page, auth pages, dashboard, and document editor
- Resolve the logged-in user through `/me` before protected routes render
- Add CSRF headers to mutating API requests
- Refresh expired access tokens once on 401 and replay queued requests
- Persist editor state locally with IndexedDB for fast/offline hydration
- Sync Yjs document updates through Socket.io
- Render live collaborator cursors, selections, and mouse pointers
- Support read-only and editable editor modes based on server permissions
- Format code blocks with Prettier in the browser
- Provide print-friendly letter-page layout with visual pagination
- Register a PWA service worker with app icons and SPA fallback

## Features

- Account registration and login with email/password
- Google OAuth sign-in through `@react-oauth/google`
- HTTP-only cookie auth with access and refresh token rotation
- CSRF protection for POST, PUT, PATCH, and DELETE requests
- Dashboard split between owned documents and documents shared with the user
- Create, rename, list, open, and delete documents
- Owner-only sharing modal
- Invite collaborators by email with `read` or `write` permission
- Revoke collaborator access
- Public link access: restricted, anyone signed in can view, or anyone signed in can edit
- Real-time collaborative editing with Tiptap, Yjs, and Socket.io
- MongoDB persistence of encoded Yjs document state
- Local IndexedDB cache for editor state
- Live collaborator caret labels, selections, and pointer presence
- Rich text controls: headings, bold, italic, underline, strike, alignment, lists, quote
- Code tools: inline code, syntax-highlighted code blocks, Prettier formatting
- Page breaks, visual pagination, and print styles
- Dark/light theme stored in localStorage
- Vite PWA manifest, app icons, and service worker precache

## Environment Variables

Create local environment files; do not commit them.

`backend/.env`:

```env
MONGODB_URL=
PORT=5000
FRONTEND_URL=http://localhost:5173
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
CSRF_SECRET=
NODE_ENV=development
```

`frontend/.env.development`:

```env
VITE_DEV_BACKEND_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=
```

`frontend/.env.production`:

```env
VITE_DEV_BACKEND_URL=https://your-production-api.example.com
VITE_GOOGLE_CLIENT_ID=
```

Use long random values for token and CSRF secrets. For example:

```bash
openssl rand -hex 32
```

The backend validates Google access tokens by calling Google's userinfo endpoint. The frontend provides the Google client ID to `GoogleOAuthProvider`.

## Local Development

1. Install dependencies from the repo root.

```bash
npm install
```

2. Add the environment files shown above.

3. Start both apps.

```bash
npm run dev
```

Default local URLs:

| Service      | URL                            |
| ------------ | ------------------------------ |
| Frontend     | `http://localhost:5173`        |
| Backend      | `http://localhost:5000`        |
| Health check | `http://localhost:5000/health` |

The Vite server is configured with `strictPort: true`, so it fails if port `5173` is already in use.

## API Overview

All REST endpoints are mounted under `/api/v1`.

Auth routes:

| Method | Path               | Purpose                                                         |
| ------ | ------------------ | --------------------------------------------------------------- |
| `GET`  | `/auth/csrf-token` | Creates/uses a session id cookie and returns a CSRF token       |
| `GET`  | `/auth/me`         | Returns the current user from the access cookie                 |
| `POST` | `/auth/register`   | Creates a local account and issues cookies                      |
| `POST` | `/auth/login`      | Signs in a local account and issues cookies                     |
| `POST` | `/auth/google`     | Signs in or creates a Google account from a Google access token |
| `POST` | `/auth/logout`     | Deletes the current refresh session and clears cookies          |
| `POST` | `/auth/refresh`    | Rotates refresh/access tokens                                   |

Document routes:

| Method   | Path                      | Purpose                                             |
| -------- | ------------------------- | --------------------------------------------------- |
| `POST`   | `/docs`                   | Create a document                                   |
| `GET`    | `/docs`                   | List owned and shared documents                     |
| `GET`    | `/docs/:id`               | Fetch document metadata and current user permission |
| `DELETE` | `/docs/:id`               | Delete a document, owner only                       |
| `PATCH`  | `/docs/:id/title`         | Rename a document, owner or write collaborator      |
| `POST`   | `/docs/:id/share`         | Share with a registered user by email, owner only   |
| `DELETE` | `/docs/:id/share/:userId` | Remove collaborator access, owner only              |
| `PATCH`  | `/docs/:id/public-access` | Update public link access, owner only               |

Mutating requests need the `x-csrf-token` header. The frontend Axios layer fetches and attaches this automatically.

## Collaboration Flow

The document body is not sent through normal REST updates. REST stores document metadata; the editor body flows through Yjs and Socket.io.

1. The editor route loads document metadata with `GET /docs/:id`.
2. `useCollaboration` hydrates a local `Y.Doc` from IndexedDB.
3. The client opens a credentialed Socket.io connection and emits `join-doc`.
4. The server verifies the `accessToken` cookie and checks document access.
5. The server loads the persisted Yjs state from MongoDB when needed.
6. The joining client receives `doc-state`.
7. Local edits emit `doc-update`; the server applies, broadcasts, and debounces persistence.
8. Awareness updates carry cursors, selections, and pointer positions without being persisted.

The server limits update payload sizes and only accepts document or awareness updates from sockets that have joined the target room.

## Build and Deployment

Build everything from the root:

```bash
npm run build
```

This runs:

- `npm run build -w frontend`: TypeScript build plus Vite build into `frontend/dist/`
- `npm run build -w backend`: TypeScript build into `backend/dist/`

Deployment shape:

- Deploy `frontend/dist/` to a static host such as Vercel, Netlify, or another CDN/static platform.
- Deploy `backend/dist/` to a Node.js host such as Render, Railway, Fly.io, or a VM.
- Set `FRONTEND_URL` on the backend to the deployed frontend origin.
- Set `VITE_DEV_BACKEND_URL` before building the frontend so API and socket traffic target the deployed backend.
- Use MongoDB Atlas or another MongoDB instance for `MONGODB_URL`.
- `shared/` is consumed through npm workspaces and is not deployed by itself.

## Notes for Contributors

- Do not edit `frontend/src/routeTree.gen.ts` by hand; TanStack Router regenerates it.
- Keep request/response validation in `shared/` when both frontend and backend depend on the shape.
- Keep secrets in local env files or a secrets manager. Never put credential values in README examples.
- The source currently uses some non-ASCII UI copy/icons in React files; new docs and config should stay ASCII unless there is a product reason otherwise.
