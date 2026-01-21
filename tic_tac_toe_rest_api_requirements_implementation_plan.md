# Tic-Tac-Toe REST API – Requirements & Implementation Plan

## 1) Scope and goals
Build a **maintainable, documented REST API** that lets a user:
- Create a new game session (returns game ID)
- Submit the next move (user move)
- Ask the computer to play the next optimal move (AI move)
- View a single game’s move history (chronological)
- View all sessions played (chronological)

Non-goals (unless explicitly added later): UI, multiplayer PvP, realtime websockets.

---

## 2) Functional requirements

### 2.1 Game rules
- Board is **3×3**, coordinates are `{x, y}` with **0–2** bounds (or 1–3; must be consistent and documented).
- Two symbols: **X** and **O**.
- Turn-based:
  - Define which side the human is (default: human = X, AI = O).
  - Enforce correct turn order (cannot play twice).
- Valid move:
  - Cell must be empty.
  - Game must not be finished.
- Game ends when:
  - A player has 3 in a row (horizontal/vertical/diagonal), or
  - Board is full (draw).
- Optimal AI:
  - For tic-tac-toe, implement **perfect play** (minimax with alpha-beta is trivial at 3×3).

### 2.2 API capabilities
Provide endpoints to support:
- **CreateSession** → returns `gameId` and initial board/state
- **Move** → user submits `{x, y}`, returns updated state and whether game finished
- **AI** breaking out as explicit call → server computes and applies best move, returns updated state
- **GameHistory** → all moves for a game, ordered by timestamp/ply number
- **SessionHistory** → all games for a user (or global list if no auth), ordered by created time

### 2.3 Data returned
Every state-changing endpoint should return at minimum:
- `gameId`
- `board` (3×3 array of strings: "." | "X" | "O")
- `nextPlayer` ("HUMAN"/"AI" or "X"/"O")
- `status` (IN_PROGRESS | WON_X | WON_O | DRAW)
- `winner` (optional: X/O/null)
- `lastMove` (optional)
- `moveNumber` (ply count)

### 2.4 Error handling
Standardized error format:
- `code` (machine readable)
- `message` (human readable)
- `details` (optional)

Required error cases:
- Invalid coordinates
- Cell already occupied
- Wrong player’s turn
- Game not found
- Game already finished

### 2.5 Concurrency / idempotency
- Ensure that multiple requests don’t corrupt state.
- Prefer optimistic concurrency (e.g., version field / ETag) or DB transaction-level locking.

---

## 3) Non-functional requirements

### 3.1 Maintainability (5-year horizon)
- Layered architecture: API layer → domain/service layer → persistence layer.
- Strong typing (where possible) and clear domain models.
- High test coverage for:
  - Rules engine
  - AI move selection
  - API validation and error handling
- Linting/formatting and pre-commit hooks.
- Versioned API (`/v1`).

### 3.2 Performance
- Tic-tac-toe compute is tiny; prioritize clarity.
- Must handle typical web service load (100s RPS) with DB-backed persistence.

### 3.3 Observability
- Structured logging with request IDs.
- Health endpoints (`/health`, optionally `/ready`).
- Metrics hooks (optional).

### 3.4 Security
- If no authentication is required, clearly document that **SessionHistory is global**.
- If authentication is required, sessions must be per-user.

---

## 4) API design options (with pros/cons)

### Option A: Classic REST (recommended)
Example routes:
- `POST /v1/sessions` → create
- `POST /v1/sessions/{id}/moves` → user move
- `POST /v1/sessions/{id}/ai-move` → AI move
- `GET /v1/sessions/{id}/moves` → game history
- `GET /v1/sessions` → session history

**Pros**
- Straightforward, easy to document, good separation.
- Works well with standard tooling.

**Cons**
- Two endpoints for moves (human vs AI).

**Missing info to choose**
- Do you want a single endpoint that can accept either human or AI action?

### Option B: Single “advance” endpoint
- `POST /v1/sessions/{id}/advance` with body `{ type: "HUMAN", x, y }` or `{ type: "AI" }`

**Pros**
- One endpoint for state transitions.

**Cons**
- Slightly less “REST pure”.
- More branching logic.

**Missing info**
- Preference for simplicity vs REST semantics.

---

## 5) Storage options (with pros/cons)

### Option 1: In-memory only
**Pros**
- Fast to build; simplest.

**Cons**
- Data lost on restart; no multi-instance scaling.
- Hard to meet “web service” expectations.

**Best for**: demo/prototype.

### Option 2: SQLite (recommended default)
**Pros**
- Persistent, zero external dependencies.
- Works in containers.

**Cons**
- Limited write concurrency vs Postgres.

**Best for**: small deployment, simple ops.

### Option 3: Postgres
**Pros**
- Production-grade concurrency, scaling, standard ops.

**Cons**
- More setup, higher cost.

**Best for**: real production usage.

**Missing info to choose**
- Expected traffic and hosting environment.
- Need for horizontal scaling.

---

## 6) AI implementation options

### Option 1: Minimax + alpha-beta (recommended)
**Pros**
- Guarantees optimal play.
- Small and easy to test.

**Cons**
- Needs careful implementation but trivial at 3×3.

### Option 2: Rule-based heuristics
**Pros**
- Very small.

**Cons**
- Risk of suboptimal play unless very thorough.

**Missing info to choose**
- Requirement explicitly says “optimal move” → minimax strongly preferred.

---

## 7) Domain model (conceptual)

### Entities
- **GameSession**
  - `id`
  - `createdAt`, `updatedAt`
  - `status` (IN_PROGRESS / WON_X / WON_O / DRAW)
  - `nextTurn` (X or O)
  - `humanMark` (X), `aiMark` (O)
  - `board` (derived from moves OR stored snapshot)

- **Move**
  - `id`
  - `sessionId`
  - `moveNumber` (0..8)
  - `player` (X/O)
  - `x`, `y`
  - `createdAt`

### Persistence strategy choices
- **Event-sourced**: store only moves; board is reconstructed.
  - Pros: clean history, immutable, easy audits.
  - Cons: need reconstruction each request (still tiny).
- **Snapshot**: store board state in session plus move list.
  - Pros: fastest reads.
  - Cons: must keep in sync.

Recommendation: **Event-sourced moves + cached reconstruction** (simple, correct).

---

## 8) Tech stack options (language/framework)

### Option A: TypeScript + Node (Fastify or Express)
**Pros**
- Great ecosystem for REST APIs, strong typing.
- Easy JSON handling.

**Cons**
- Need discipline to keep architecture clean.

### Option B: Python (FastAPI)
**Pros**
- Rapid dev, strong validation via Pydantic.

**Cons**
- Typing is good but optional.

### Option C: Go (net/http + chi)
**Pros**
- High performance, strong maintainability.

**Cons**
- More verbose.

**Missing info**
- Team familiarity and existing deployment conventions.

Recommendation for “on time/on budget”: **FastAPI (Python)** or **TypeScript + Fastify**.

---

## 9) Implementation plan (Agentive task breakdown)

### Phase 0 — Project setup
1. **Repo scaffolding**
   - Initialize project, dependency management, standard folders (api/domain/persistence).
   - Add formatter + linter + test runner.
   - Add pre-commit hooks.

2. **CI pipeline**
   - Run lint, tests, and build on PR.

**Acceptance criteria**: `make test` and `make lint` succeed in CI.

---

### Phase 1 — Domain engine
3. **Board + rules module**
   - Coordinate validation.
   - Apply move.
   - Detect win/draw.
   - Determine legal moves.

4. **AI module**
   - Minimax (alpha-beta) returning best move.
   - Tie-break rules (deterministic): center > corners > edges, or earliest in list.

**Acceptance criteria**
- Unit tests cover all win lines and draw.
- AI never loses (tests for known traps).

---

### Phase 2 — Persistence
5. **DB schema + migrations**
   - `sessions` table.
   - `moves` table.

6. **Repository layer**
   - Create session.
   - Add move with moveNumber sequencing.
   - Load session + moves.
   - List sessions.

**Acceptance criteria**
- Integration tests against SQLite.
- Move insertion is atomic and ordered.

---

### Phase 3 — REST API
7. **API endpoints**
   - `POST /v1/sessions`
   - `POST /v1/sessions/{id}/moves`
   - `POST /v1/sessions/{id}/ai-move`
   - `GET /v1/sessions/{id}/moves`
   - `GET /v1/sessions`

8. **Validation + error mapping**
   - Consistent error codes.

9. **OpenAPI documentation**
   - Auto-generate swagger UI.

**Acceptance criteria**
- End-to-end tests for typical flows.
- OpenAPI schema matches behavior.

---

### Phase 4 — Operational readiness
10. **Dockerization**
- Dockerfile + docker-compose (SQLite volume).

11. **Health + logging**
- `/health` endpoint.
- Request ID middleware.

12. **README + examples**
- Run instructions.
- Curl examples.
- Assumptions + tradeoffs.

**Acceptance criteria**
- `docker compose up` starts service.
- README is complete.

---

## 10) Missing product decisions (to stay on spec, time, budget)
These materially impact design:
1. **Authentication / user identity**
   - Is “Session History” per-user or global?
2. **Coordinate convention**
   - 0-based vs 1-based.
3. **Who goes first**
   - Always human first? Configurable?
4. **Draw/win status representation**
   - Strings vs enums; response shape.
5. **Hosting expectations**
   - Local only vs cloud deployment; need for Postgres.
6. **API versioning and backwards compatibility**
   - Required now or later?

If these aren’t specified, the safest default is:
- No auth (global sessions),
- 0-based coordinates,
- human = X goes first,
- SQLite persistence,
- REST Option A routes,
- versioned under `/v1`.

---

## 11) README contents (delivery checklist)
- How to run locally (direct + docker)
- Configuration (PORT, DB_URL)
- API docs location (OpenAPI/Swagger)
- Assumptions
- Trade-offs
- Any extra features (e.g., deterministic AI tie-breaks, idempotency tokens, ETag/versioning)

---

## 12) Suggested “extra but valuable” features
- **ETag/version field** on session to prevent lost updates.
- **Idempotency-Key** header for move endpoints.
- **Pagination** for session listing.
- **Seeded randomness** (optional) for non-optimal mode, *if ever desired*.

