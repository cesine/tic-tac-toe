# AGENTS.md — Agent Contribution Guide (NestJS + REST/GraphQL + Firebase)

This repository is a **NestJS** backend that exposes **REST** and/or **GraphQL** APIs and uses **Firebase** (typically Firestore + Firebase Auth via `firebase-admin`) for persistence/auth.

Agents must keep changes **small, reviewable, well-tested**, and aligned with the API contract(s) and long-term maintainability.

---

## 1) Non-negotiables (read before coding)

### Contract-first (REST + GraphQL)
- REST contract is defined by **OpenAPI/Swagger** (via `@nestjs/swagger`) and must stay accurate.
- GraphQL contract is defined by the **GraphQL schema** (usually code-first decorators via `@nestjs/graphql`).
- If you change observable behavior:
  - update **Swagger decorators / OpenAPI** for REST, and/or
  - update **GraphQL types/resolvers** (and schema) for GraphQL, and
  - update **tests + README examples** in the same PR.

### Clean architecture boundaries
Keep a clear separation of concerns:
- **API layer**
  - REST: controllers, route DTOs, pipes/guards/interceptors
  - GraphQL: resolvers, input types, guards/interceptors
- **Application layer**: use-cases/services orchestrating domain + persistence
- **Domain layer**: pure business rules (no Nest, no Firebase SDK)
- **Infrastructure layer**: Firebase (Firestore/Auth), external integrations, repositories

> Controllers/Resolvers should be thin. Most logic belongs in application services + domain.

### Determinism & reliability
- Avoid non-deterministic behavior in core logic unless explicitly required.
- Every bug fix requires a regression test.
- Do not introduce “clever” patterns that reduce readability or testability.

### Security hygiene
- Never commit Firebase secrets, service account JSON, or emulator data.
- Use environment variables and secret managers for credentials.
- Always validate/verify auth tokens in guards (REST + GraphQL).

---

## 2) Firebase best practices (Auth, Firestore, Emulators)

### Firebase Admin initialization (MUST)
- Initialize `firebase-admin` **once** via a Nest provider.
- Never call `admin.initializeApp()` inside request handlers.
- Prefer a dedicated module: `FirebaseModule` exporting:
  - `FIREBASE_ADMIN_APP`
  - `FIRESTORE`
  - `FIREBASE_AUTH`

### Emulator-first development (recommended)
- If the repo supports Firebase Emulator Suite:
  - use emulators for integration/e2e tests
  - ensure tests never touch production projects
- Agents should default to emulator configs when `FIREBASE_EMULATOR_HOST` / related env vars are present.

### Firestore modeling guidelines
- Use consistent collection names and document schemas.
- Store timestamps as server timestamps (or ISO strings) consistently.
- Avoid unbounded collection scans; always query with indexes and limits.
- Prefer batched writes / transactions for multi-document changes.
- When concurrency matters:
  - use Firestore transactions, OR
  - implement optimistic concurrency (version fields), OR
  - enforce uniqueness constraints via deterministic document IDs.

### Auth guidelines
- Verify Firebase ID tokens in a guard:
  - REST: `AuthGuard` reading `Authorization: Bearer <token>`
  - GraphQL: `GqlAuthGuard` using `GqlExecutionContext`
- Normalize user identity into a `RequestUser` object placed on `req.user` / GraphQL context.
- Never trust client-provided user IDs without verification.

---

## 3) NestJS structure & conventions (recommended)

### Modules
- Prefer feature modules (`GameModule`, `UsersModule`, etc.).
- Each feature module typically contains:
  - `*.controller.ts` (REST)
  - `*.resolver.ts` (GraphQL)
  - `*.service.ts` (application service)
  - `*.repository.ts` (Firestore access)
  - `dto/` (REST DTOs)
  - `graphql/` (GraphQL input/output types if separated)
  - `domain/` (pure rules/value objects)

### DTOs and validation
- REST DTOs:
  - must use `class-validator` + `class-transformer`
  - must be validated via a global `ValidationPipe` (whitelist + forbidNonWhitelisted)
- GraphQL input types:
  - use `@InputType()` + `@Field()` and can also use `class-validator` decorators
- Do not reuse persistence models as API DTOs. Map explicitly.

### Error handling
- REST:
  - use `HttpException` subclasses (400/404/409/500)
  - keep an `ExceptionFilter` to normalize error response shape
- GraphQL:
  - throw Nest exceptions or `GraphQLError` consistently
  - ensure sensitive details are not leaked
- Prefer a shared error code enum (e.g., `INVALID_MOVE`, `NOT_FOUND`, `CONFLICT`) and map to REST/GraphQL appropriately.

### Observability
- Structured logging (prefer `pino` via `nestjs-pino` if already used)
- Add request IDs (middleware/interceptor)
- Health checks via `@nestjs/terminus` if available (`/health`)

---

## 4) REST + GraphQL together (how to avoid duplication)

### Single source of business logic
- Controllers and resolvers must call the **same application services**.
- Any “rules” must live in domain/application layers, never duplicated across REST and GraphQL.

### DataLoader for GraphQL (avoid N+1)
- If resolvers fetch many related docs, add DataLoader in GraphQL context.
- Keep batching/caching scoped to a single request.

---

## 5) Configuration (12-factor)

- Use `@nestjs/config` for all config.
- Validate env vars at startup (e.g., Joi/Zod schema).
- Separate configs for:
  - local dev
  - test
  - staging/prod
  - emulator vs real Firebase

Common env vars (names may vary; follow repo conventions):
- `NODE_ENV`
- `PORT`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_EMULATOR_HOST` / `FIRESTORE_EMULATOR_HOST`
- credential sourcing (ADC / service account via secret manager)

---

## 6) Testing strategy (required)

### Unit tests (fast)
- Pure domain logic (no Nest container)
- Application services with mocked repositories
- Validation edge cases for DTOs (optional)

### Integration tests (Firebase emulator recommended)
- Repository against Firestore emulator
- Transaction behavior / concurrency-sensitive operations
- Index/query correctness

### E2E tests
- REST: `supertest` against Nest app instance
- GraphQL: POST to `/graphql` with queries/mutations
- Auth: test with mocked token verification OR emulator-based auth if supported

**Rule:** tests must not depend on production Firebase projects.

---

## 7) Code changes checklist (agents must follow)

Before opening a PR:
- [ ] Lint + format clean (`npm/yarn/pnpm run lint`, `format`)
- [ ] Unit tests pass
- [ ] Integration/e2e tests pass (emulator if used)
- [ ] Swagger/OpenAPI updated if REST behavior changed
- [ ] GraphQL schema/types updated if GraphQL behavior changed
- [ ] README/docs updated for any user-visible change
- [ ] No secrets committed; env changes documented in `.env.example` (if used)

---

## 8) PR style & scope

### Small PRs
- Prefer a single feature or ticket per PR.
- Avoid drive-by refactors unless required to safely implement the change.

### PR description template
Include:
- Ticket/issue reference
- What changed (behavior + internals)
- How to test (commands + example curl/GraphQL query)
- Any contract changes (REST/GraphQL)
- Any migrations / index requirements (Firestore index notes)

---

## 9) Common patterns (use these, don’t reinvent)

### Firestore repository pattern
- `Repository` exposes typed methods:
  - `create(...)`
  - `getById(...)`
  - `list(...)`
  - `update(...)`
  - `runTransaction(...)`
- Repository owns Firestore query details; services should not build raw queries.

### Transaction wrapper
- Provide a `FirestoreTransactionRunner` that:
  - runs a transaction
  - retries on contention if appropriate
  - standardizes error handling/logging

### Auth guard pattern
- REST: `@UseGuards(FirebaseAuthGuard)`
- GraphQL: `@UseGuards(GqlFirebaseAuthGuard)` (extract headers via `GqlExecutionContext`)

---

## 10) When uncertain (decision discipline)

If you hit ambiguity (API shape, auth, data model, error codes, etc.):
1. Check:
   - `docs/decisions.md` (or equivalent)
   - OpenAPI decorators / Swagger docs
   - GraphQL schema/types
2. If still unclear:
   - add a short “Decision Needed” note in the PR
   - implement the safest minimal behavior consistent with existing patterns
3. Do not introduce breaking changes without an explicit versioning plan.

---

## 11) Deployment notes (Firebase hosting options)

This codebase may be deployed as:
- Cloud Functions (HTTP function running Nest)
- Cloud Run (container)
- Other Node hosting

Agents must:
- keep startup fast (especially for Cloud Functions)
- avoid per-request initialization
- keep config externalized

If the repo includes deployment scripts, do not modify them without updating docs and validating a deploy in CI/staging.

---

## 12) Project-specific updates (TODO for maintainers)
After this file is added, update these sections to match the repo:
- “How to run” commands (package manager, scripts)
- Emulator instructions + ports
- Where OpenAPI lives (auto-generated vs committed)
- Where GraphQL schema is generated (code-first output path)
- Logging library choice and conventions
