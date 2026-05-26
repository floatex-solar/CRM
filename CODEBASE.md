# Floatex CRM — Codebase Reference

> Quick-orient doc for future sessions. Read this before grepping the repo.
> Companion to `CLAUDE.md` (which holds the coding-standards skill, not project info).

---

## 1. What this project is

A **CRM for Floatex Solar** (a floating-solar EPC business). Tracks companies → leads
(projects with design configs, mooring, pricing) → sites (water-body characterization
with PDF report uploads) → tasks assigned to users, with notifications and a stats
dashboard.

**Monorepo layout (two independent npm projects, NOT a workspace):**

```
CRM/
├── client/        # Vite + React 19 SPA (user-facing)
├── server/        # Express 5 + Mongoose API (REST, /api prefix)
├── CLAUDE.md      # Senior-dev coding standards (skill)
├── GEMINI.md      # (legacy, similar content)
└── CODEBASE.md    # This file
```

Each side has its own `package.json`, `node_modules`, `.env`, `tsconfig.json`.
Install + run them independently.

---

## 2. Tech stack

### Client (`client/`)

| Concern        | Library                                                           |
| -------------- | ----------------------------------------------------------------- |
| Build          | Vite 7 + `@vitejs/plugin-react-swc` + `@tailwindcss/vite`         |
| Framework      | React 19                                                          |
| Routing        | TanStack Router (file-based, `routeTree.gen.ts` auto-generated)   |
| Data fetching  | TanStack Query v5                                                 |
| Tables         | TanStack Table v8                                                 |
| Forms          | react-hook-form + `@hookform/resolvers` + Zod                     |
| UI library     | **shadcn/ui** (Radix primitives + Tailwind v4) — see `components.json` |
| State          | Zustand (`src/stores/auth-store.ts` is the only store)            |
| HTTP           | Axios (`src/lib/axios.ts`)                                        |
| Icons          | Lucide React (primary), Tabler/Radix (brand icons in `assets/`)   |
| Toasts         | Sonner                                                            |
| Charts         | Recharts                                                          |
| Date utilities | date-fns, react-day-picker                                        |
| Auth (extra)   | Clerk (`@clerk/clerk-react`) — wired but **app uses custom JWT auth**, Clerk routes live under `/clerk/*` and are unused in nav |
| JWT decode     | `jwt-decode`                                                      |
| Country data   | `country-state-city`, `world-countries`                           |
| Path alias     | `@/*` → `./src/*` (vite + tsconfig)                               |

Scripts: `pnpm dev` / `pnpm build` / `pnpm lint` / `pnpm format` / `pnpm knip`.
Use **pnpm** (lockfile is `pnpm-lock.yaml` though `package-lock.json` exists too).

### Server (`server/`)

| Concern        | Library                                                   |
| -------------- | --------------------------------------------------------- |
| Runtime        | Node.js, ES modules (`"type": "module"`)                  |
| Dev runner     | `tsx watch src/server.ts`                                 |
| Framework      | **Express 5** (note: stricter than v4 — see gotchas)      |
| DB             | MongoDB via Mongoose                                      |
| Auth           | `jsonwebtoken` (JWT) + `bcryptjs`                         |
| Validation     | Zod (schemas live inside model files)                     |
| Security       | helmet, cors, express-rate-limit, express-mongo-sanitize, hpp, cookie-parser |
| File uploads   | multer (memory storage) → uploaded to **Google Drive** via `googleapis` |
| Email          | nodemailer (SMTP, configured via env)                     |
| Logging        | morgan                                                    |

Scripts: `npm run dev` / `npm run build` / `npm start`.

---

## 3. Domain model

Seven Mongoose models, all in `server/src/models/`:

| Model          | File                  | Purpose                                                   |
| -------------- | --------------------- | --------------------------------------------------------- |
| `User`         | `user.model.ts`       | Auth users (role: `admin` \| `user`). Soft-deleted via `active=false` (excluded by `pre(/^find/)` hook). |
| `Company`      | `company.model.ts`    | Companies + embedded `Contact[]` (primary/secondary/other, max 1 of each). Holds NDA/MoU status + Drive file URLs + lead-pipeline fields (`leadStatus`, `priority`, `leadSource`, `assignedTo`, etc.). |
| `Lead`         | `lead.model.ts`       | A project. Refs 4 companies (`client`, `developer`, `consultant`, `endCustomer`). Has embedded `designConfigurations[]` (auto-versioned), `mooringTechnique`, `offeredPrice` (auto-summed `total`). |
| `Site`         | `site.model.ts`       | Water-body site with lat/lng, water-body characterization, and up to 4 PDF reports (`bathymetry`, `geotechnical`, `pfr`, `dpr`). `owner` refs Company. |
| `Task`         | `task.model.ts`       | Assigned work. Refs `lead`, `assignedTo` (User), `assignedBy` (User), `watchers[]`. Embedded `updates[]` timeline (status + remarks + attachments/voice/video). Drive-hosted attachments. |
| `Notification` | `notification.model.ts` | Per-recipient `task_assigned` / `task_updated` / `task_completed`. Compound index on `(recipient, isRead, createdAt)`. |
| `Lookup`       | `lookup.model.ts`     | Generic key/value enum store (`type` + `label` + `value`). Used for dropdowns: `INDUSTRY`, `COMPANY_TYPE`, `DESIGNATION`, `LEAD_SOURCE`, `WHO_BROUGHT`, etc. Unique on `(type, value)`. |

**Relationship sketch:**

```
User ─assignedTo/By─ Task ──lead──> Lead ──{client,developer,consultant,endCustomer}──> Company
                                                                                          │
                                                                            Site ─owner──┘
User ─recipient─ Notification ─taskId─> Task
```

---

## 4. API conventions

### URL shape

All routes mounted at `/api/<resource>`. See `server/src/routes/index.ts`:

```
/api/users          (login is public; everything else requires auth; /:id is admin-only)
/api/companies      (auth; supports multipart for ndaFile/mouFile)
/api/leads          (auth; nested /:id/design-versions for new design configs)
/api/sites          (auth; multipart for bathymetry/geotechnical/pfr/dpr)
/api/tasks          (auth; multipart for attachments/voiceNote/videoNote; nested /:id/updates)
/api/notifications  (auth; my-list + unread-count + mark-as-read endpoints)
/api/lookups        (auth; /type/:type to list by type)
/api/dashboard      (auth; /stats with optional global + per-section date ranges)
```

### Response envelope (consistent)

```json
// List
{ "status": "success", "results": N, "totalCount": N, "data": { "<resource>s": [...] } }

// Single
{ "status": "success", "data": { "<resource>": {...} } }

// Delete
204 No Content with { "status": "success", "data": null }

// Validation error (Zod)
400 with { "status": "error", "message": "Validation failed", "errors": [{ field, message, code }] }

// AppError (operational)
4xx/5xx with { "status": "fail"|"error", "message": "..." }
```

### Common list query params

`?page=1&limit=10&sort=-createdAt&search=foo&<facet>=val1&<facet>=val2`

- Sort uses Mongoose syntax (`-createdAt`, `field,-other`).
- Multi-value facets are arrays in the query string → become `$in`.
- `hpp` whitelist allows duplicate params for: `sort`, `page`, `limit`, `fields`, `leadStatus`, `priority`, `search`, `status`, `assignedTo`, `assignedBy`.

### Auth

JWT issued on `POST /api/users/login`. Sent **both** as:
1. `Authorization: Bearer <token>` header (client interceptor attaches it), and
2. `jwt` cookie (httpOnly, secure in prod).

`authController.protect` accepts either. `authController.restrictTo("admin", ...)` for role gates.
Token contains `{ id }` only — server re-fetches the user on every protected request.

Client login flow: `useLogin()` hook calls `/users/login` → stores token in cookie via Zustand
`auth-store`. Token is decoded client-side to populate user (`_id`, `email`, `role`, `exp`).
`useCurrentUser()` runs on every page load (inside `AuthenticatedLayout`) and hydrates the
full profile via `/users/me`.

---

## 5. Server architecture patterns

- **Thin controllers, fat models.** Controllers in `controllers/*.controller.ts` call models directly; no service layer (one exception: `services/upload-to-drive.ts`).
- **Async wrapper.** Every async route handler is wrapped in `catchAsync` (`utils/catchAsync.ts`) so errors propagate to the global handler.
- **Operational errors.** Use `new AppError(message, statusCode)` (`utils/appError.ts`). The global handler in `app.ts` distinguishes operational vs unknown errors.
- **Validation.** Zod schemas live **inside the model file** (e.g. `companySchemaZod` exported from `company.model.ts`). Apply via `validateBody(schema)` middleware on routes. PATCH routes use `.partial()`. For PATCH on schemas with `superRefine`, the refinement must be re-applied to `.partial()`.
- **Filtering helper.** `utils/apiFeatures.ts` (`APIFeatures`) does filter/sort/limitFields/paginate chain — used only by `userController.getAllUsers`. Most other list endpoints (companies, leads, etc.) build filters inline.
- **File uploads.** All file routes use **`multer.memoryStorage`** (no disk writes), then stream the buffer to Google Drive via `services/upload-to-drive.ts`. The Drive file is made public-with-link and a `https://drive.google.com/file/d/<id>/view` URL is stored on the model.
- **Multipart + JSON fields.** When uploading files alongside JSON fields (e.g. company create), nested objects (`address`, `contacts`, `notes`) arrive as JSON-stringified form fields and are parsed by `parseJsonField()` helper in the controller before saving.
- **Dashboard.** `dashboard.controller.ts` runs MongoDB `$facet` aggregations per entity in parallel via `Promise.all`. Date filters: a global `from`/`to` plus per-section overrides (`companiesFrom`, `leadsFrom`, `sitesFrom`, `tasksFrom`).

---

## 6. Client architecture patterns

### Feature-folder layout

Every domain entity is a self-contained feature under `client/src/features/<name>/`:

```
features/<name>/
├── index.tsx              # Page component (e.g. <Companies />). Mounts Provider, header, table, dialogs.
├── components/
│   ├── <name>-table.tsx           # Wraps TanStack Table with toolbar/filters/pagination
│   ├── <name>-columns.tsx         # Column defs (sortable headers, faceted filters, row actions)
│   ├── <name>-dialogs.tsx         # Routes context.open → add/edit/delete dialog
│   ├── <name>-provider.tsx        # Context: open dialog state + currentRow
│   ├── <name>-primary-buttons.tsx # "Add new" button + bulk actions
│   ├── <name>-row-actions.tsx     # Per-row dropdown (edit/delete/etc.)
│   ├── <entity>-add-dialog.tsx    # Dialogs are split per action
│   ├── <entity>-edit-dialog.tsx
│   ├── <entity>-delete-dialog.tsx
│   └── <entity>-form.tsx          # Shared form for add+edit (RHF + Zod)
├── data/
│   ├── schema.ts          # Zod schemas + inferred TS types (separate input vs response schemas)
│   └── data.tsx           # Static option lists (statuses, priorities, etc.) with icons
└── hooks/
    └── use-<name>-api.ts  # All TanStack Query hooks + queryOptions exports
```

This pattern is followed by: `companies`, `leads`, `sites`, `tasks`, `users`.
`dashboard` is variant (sections, no table). `settings` has its own nested pattern with form sections. `notifications` is a small bell component used in headers.

### Routing (TanStack Router, file-based)

Routes live in `client/src/routes/`. Naming:

- `__root.tsx` — root layout (Toaster, NavigationProgress, devtools, errorComponent, notFoundComponent).
- `(auth)/...` — auth pages (sign-in, sign-up, otp, forgot-password). Parentheses = route group, no path segment.
- `(errors)/{401,403,404,500,503}.tsx` — error pages.
- `_authenticated/route.tsx` — pathless layout that wraps everything authenticated with `AuthenticatedLayout` (sidebar + header). Underscore prefix = layout route.
- `_authenticated/<feature>/index.tsx` — concrete pages. Often have `validateSearch` (Zod) for URL state + `loader` that calls `context.queryClient.ensureQueryData(queryOptions)` for SSR-style prefetching.
- `clerk/*` — Clerk-protected demo routes; **not in the live nav** (commented out in `sidebar-data.ts`).

`routeTree.gen.ts` is auto-generated by `@tanstack/router-plugin` — never edit by hand.

### Data fetching pattern

Every feature exports `<name>QueryOptions(params)` and `use<Name>Query(params)` from `hooks/use-<name>-api.ts`. Mutations follow the pattern:

```ts
function useCreate<Name>Mutation() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input) => { /* api.post(...) */ },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['<name>'] }),
  })
}
```

Global query client config (`main.tsx`):
- 10s staleTime, no refetch-on-focus in dev.
- 401 → toast + `auth.reset()` + navigate to `/sign-in`.
- 500 → in prod, navigate to `/500`.

### Auth store (Zustand)

`src/stores/auth-store.ts` — single store, key methods: `setUser`, `setAccessToken`, `resetAccessToken`, `reset`. Hydrates from `auth-token-v1` cookie + `user-storage-v1` localStorage on init. The cookie name is `import.meta.env.VITE_ACCESS_TOKEN_KEY` or falls back to `auth-token-v1`. The token is stored JSON-stringified in the cookie.

### Forms

react-hook-form + `zodResolver(<inputSchema>)`. Schemas in `features/<name>/data/schema.ts` typically split into:
- `<name>Schema` — full server response shape.
- `<name>InputSchema` — what the create/update form sends (often stricter — e.g. `.min(1)` on required fields).
- `<name>ListResponseSchema`, `<name>ResponseSchema` — API envelope types.

When a form posts files, `onSubmit` builds a `FormData`, mutation sends with `Content-Type: multipart/form-data`.

### UI conventions

- shadcn/ui is the **only** UI library — never mix in MUI/Chakra/etc.
- Components in `src/components/ui/` are shadcn primitives. **Some are modified** (`scroll-area`, `sonner`, `separator`) or RTL-patched (`alert-dialog`, `calendar`, `command`, `dialog`, `dropdown-menu`, `select`, `table`, `sheet`, `sidebar`, `switch`) — re-adding via shadcn CLI will overwrite local fixes. See `client/README.md`.
- `cn()` helper in `src/lib/utils.ts` (clsx + tailwind-merge) for conditional classes.
- Sidebar nav data: `src/components/layout/data/sidebar-data.ts`. Nav items support `roles?: string[]` to gate by user role (e.g. Users tab is `admin`-only). The sidebar component reads from auth-store user to filter items.

### Page header pattern

Every page mounts `<Header fixed>` with `<Search />`, `<NotificationBell />`, `<ThemeSwitch />`, `<ConfigDrawer />`, `<ProfileDropdown />`. Reuse this exactly when adding new pages.

### Role-based UI

Admin-only is enforced **client-side** by either:
1. Gating the nav item via `roles: ['admin']` in `sidebar-data.ts`, or
2. Redirecting in the page itself (e.g. `features/users/index.tsx` does `<Navigate to='/' />` if `user.role !== 'admin'`).

Server still enforces via `restrictTo("admin")` middleware — never rely on client gating alone.

---

## 7. Environment variables

### `client/.env`

```
VITE_API_URL=http://localhost:3000/api    # axios baseURL
VITE_ACCESS_TOKEN_KEY=auth-token-v1       # optional, cookie name
VITE_CLERK_PUBLISHABLE_KEY=               # only if Clerk routes are used
```

### `server/.env` (all required — `getEnvVar` throws on missing)

```
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

DATABASE=mongodb+srv://...<PASSWORD>...  # <PASSWORD> placeholder replaced by db.ts
DATABASE_PASSWORD=...

JWT_SECRET=...
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90

EMAIL_USERNAME=...
EMAIL_PASSWORD=...
EMAIL_HOST=...
EMAIL_PORT=...

GOOGLE_SERVICE_ACCOUNT_BASE64=...   # base64-encoded service-account JSON
GOOGLE_SHEET_ID=...
DRIVE_FOLDER_ID=...                  # Drive folder all uploads go into

WHATSAPP_API_URL=...                 # required by config but not yet used
WHATSAPP_API_KEY=...
```

---

## 8. Important gotchas / non-obvious things

1. **Express 5** — `req.query` and `req.params` are getter-only. We cannot reassign them.
   - `express-mongo-sanitize` is patched in `app.ts` to skip `req.query`.
   - `validate.middleware.ts` mutates query/params in place (delete keys + `Object.assign`) instead of reassigning.
2. **Rate limit** — 100 req/min per IP on `/api/*` (`app.ts`). Tighten if you add auth-heavy routes.
3. **CORS** — `origin: true` reflects request origin and allows credentials. Fine for internal CRM; tighten before public exposure.
4. **JWT token + cookie both** — clients can use either, but axios attaches Bearer header; cookie is set for SSR/refresh scenarios.
5. **Soft-delete users** — `pre(/^find/)` hook hides `active: false` users from ALL find queries. To include them, use `.find({ active: { $exists: true } })` explicitly or `findById` after disabling middleware.
6. **password fields** — `password`, `passwordChangedAt`, `passwordResetToken`, `passwordResetExpires`, `active` all have `select: false`. Use `.select('+password')` to include.
7. **Lead `offeredPrice.total`** — auto-computed in `pre("save")` from the four cost components. Don't pass `total` from the client; it'll be overwritten.
8. **Lead `designConfigurations[].version`** — auto-assigned in `pre("save")` if missing (index + 1).
9. **Company contacts** — schema limits to 1 primary + 1 secondary (others unlimited). Enforced both client (Zod `superRefine`) and server (`pre("save")` + Zod).
10. **For Zod `.partial()` on superRefined schemas** — apply `.partial()` to the **base** schema, then re-superRefine. See `company.model.ts` `companyUpdateSchemaZod`.
11. **File uploads** — limits: company NDA/MoU 50MB; site reports 25MB PDF/PNG/JPG only; task attachments 50MB (PDF, images, audio webm/ogg/wav/mp3, video webm/mp4/ogg).
12. **TanStack Router `validateSearch`** uses `.catch(default)` to silently fall back on bad URL params instead of throwing.
13. **`AuthenticatedLayout` calls `useCurrentUser()`** which fires `/users/me` on every navigation into the authenticated tree. Cached 5min.
14. **Vite import alias** — always use `@/...` in client code; never relative `../../`.

---

## 9. Where to look first

| Task                                       | Start file(s)                                                              |
| ------------------------------------------ | -------------------------------------------------------------------------- |
| Add a new API resource                     | Copy structure of `server/src/models/site.model.ts` + matching `routes/` + `controllers/` |
| Add a new page                             | Create `client/src/routes/_authenticated/<name>/index.tsx` + feature folder at `client/src/features/<name>/` mirroring `companies/` |
| Change sidebar / nav                       | `client/src/components/layout/data/sidebar-data.ts`                        |
| Add a new role gate                        | `roles: ['admin', ...]` on the nav item; matching `restrictTo()` on server routes |
| Change global toast/error handling         | `client/src/main.tsx` (QueryClient) + `client/src/lib/handle-server-error.ts` |
| Modify auth flow                           | `server/src/controllers/auth.controller.ts` + `client/src/stores/auth-store.ts` + `client/src/hooks/use-login.ts` |
| Add a file-upload field                    | `multer.fields([...])` in route + parse in controller + upload to Drive via `services/upload-to-drive.ts` |
| Add dashboard stat                         | `server/src/controllers/dashboard.controller.ts` (add to relevant `$facet`) + matching client section in `client/src/features/dashboard/components/` |
| Add a dropdown option set                  | Create `Lookup` docs with new `type` + use `useLookups(type)` in form (see `features/companies/hooks/use-lookups.ts`) |
| Tweak shadcn primitive                     | Edit `client/src/components/ui/<name>.tsx` directly — note customizations may be lost if shadcn CLI re-adds |

---

## 10. Things NOT to assume

- **Clerk is not the real auth.** The custom JWT flow is. Clerk files exist but are demo-only.
- **No service layer on the server** (except Drive uploader). Don't add one unless explicitly asked.
- **No tests yet.** `server`'s `npm test` is a placeholder. Client has no test config.
- **`features/apps/` and `features/chats/`** are leftover demo content from the shadcn-admin template; not part of the live nav.
- **`features/errors/`** holds the error page components used by the `(errors)/` route group and `__root.tsx` errorComponent.
- **`GEMINI.md`** is a near-duplicate of `CLAUDE.md` for Gemini — ignore unless updating both.
