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
- Two symbols: Customizable (any unicode character).
  - Default: **X** and **O** if not specified by user.
  - User can choose their preferred symbol for the humanSymbol (default is "X") and aiSymbol (default is "O") when creating a game.
- Turn-based:
  - At game creation, a coin flip determines which player goes first.
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
- `board` (3×3 array of strings: "." for empty cells or any unicode character representing player symbols)
- `nextPlayer` ("HUMAN"/"AI" or the symbol for next player)
- `status` (IN_PROGRESS | WON_<symbol> | DRAW where <symbol> is the winning player's symbol)
- `winner` (optional: symbol of winning player or null)
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
- **Authentication**: Using `anonymousId` - a UUID generated if missing and stored in the user's browser as a cookie. This enables per-user game history while maintaining simplicity.
- Sessions are per-user, scoped by `anonymousId`.
- The `anonymousId` allows tracking user sessions without requiring traditional login/signup flows.

---

## 4) API design options (with pros/cons)

### Option A: Classic REST (recommended)
Example routes:
- `POST /v1/games` → create
- `POST /v1/games/{id}/moves` → user move
- `POST /v1/games/{id}/ai-move` → AI move
- `GET /v1/games/{id}/moves` → game history
- `GET /v1/games` → game history

**Pros**
- Straightforward, easy to document, good separation.
- Works well with standard tooling.

**Cons**
- Two endpoints for moves (human vs AI).

**Missing info to choose**
- Do you want a single endpoint that can accept either human or AI action?

### Option B: Single “advance” endpoint
- `POST /v1/games/{id}/advance` with body `{ type: "HUMAN", x, y }` or `{ type: "AI" }`

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
- Hard to meet "web service" expectations.

**Best for**: demo/prototype.

### Option 2: SQLite
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

### Option 4: Firebase (chosen)
**Pros**
- Real-time database with excellent scalability.
- Managed service with zero infrastructure maintenance.
- Built-in authentication support.
- Works seamlessly with Vercel deployments.
- Automatic data synchronization.

**Cons**
- Vendor lock-in.
- Requires internet connectivity.
- Pricing based on usage.

**Best for**: cloud-first applications with real-time requirements.

**Decision**: Using Firebase for its managed infrastructure, scalability, and seamless integration with Vercel hosting.

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
  - `gameId`
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
5. **Firebase setup + schema design**
   - `games` collection: stores games with metadata.
   - `moves` subcollection: stores moves for each game.
   - Schema includes `anonymousId` for per-user game tracking.

6. **Repository layer**
   - Create game with coin flip mechanism to determine who goes first.
   - Add move with moveNumber sequencing.
   - Load game + moves.
   - List games filtered by `anonymousId`.

**Acceptance criteria**
- Integration tests against Firebase emulator.
- Move insertion is atomic and ordered.
- Coin flip correctly randomizes starting player.

---

### Phase 3 — REST API
7. **API endpoints**
   - `POST /v1/games`
   - `POST /v1/games/{id}/moves`
   - `POST /v1/games/{id}/ai-move`
   - `GET /v1/games/{id}/moves`
   - `GET /v1/games`

8. **Validation + error mapping**
   - Consistent error codes.

9. **OpenAPI documentation**
   - Auto-generate swagger UI.

**Acceptance criteria**
- End-to-end tests for typical flows.
- OpenAPI schema matches behavior.

---

### Phase 4 — Operational readiness
10. **Deployment configuration**
- Vercel configuration for cloud deployment.
- Firebase credentials and environment setup.
- Local development setup with Firebase emulator.

11. **Health + logging**
- `/health` endpoint.
- Request ID middleware.

12. **README + examples**
- Run instructions.
- Curl examples.
- Assumptions + tradeoffs.

**Acceptance criteria**
- `vercel dev` runs service locally.
- Vercel deployment succeeds.
- README is complete.

---

## 10) Missing product decisions (to stay on spec, time, budget)
These materially impact design:
1. **Authentication / user identity**
   - Is "Session History" per-user or global?
   - **Decision: Use `anonymousId`** - A UUID that is generated if missing and stored in the user's browser as a cookie for authentication. This enables per-user game history while maintaining simplicity.
2. **Coordinate convention**
   - 0-based vs 1-based.
   - **Decision: Use 0-based coordinates** for array/matrix indexing consistency.
3. **Who goes first**
   - Always human first? Configurable?
   - **Decision: Use a coin flip mechanism** to randomly determine who goes first when a new game session is created.
4. **Game symbols**
   - Fixed X/O or customizable?
   - **Decision: Allow user to specify any unicode character as their symbol**. If not specified, defaults to human="X" and AI="O".
5. **Draw/win status representation**
   - Strings vs enums; response shape.
   - **Decision: Use string literals** for status representation (e.g., "IN_PROGRESS", "WON_X", "WON_O", "DRAW").
6. **Hosting expectations**
   - Local only vs cloud deployment; need for Postgres.
   - **Decision: Use Firebase for persistence** and **Vercel for cloud deployments**. Firebase provides real-time database capabilities and scales well, while Vercel offers seamless deployment for Node.js applications.
7. **API versioning and backwards compatibility**
   - Required now or later?
   - **Decision: Version API under `/v1`** from the start to enable future evolution without breaking changes.
8. **API route structure**
   - **Decision: Use REST Option A routes** (see section 4) with separate endpoints for human moves and AI moves for clear separation of concerns.

### Summary of chosen options:
- **Authentication:** `anonymousId` (UUID stored in browser cookie)
- **Coordinates:** 0-based
- **Who goes first:** Coin flip mechanism
- **Symbols:** User-customizable (any unicode), defaults to X and O
- **Persistence:** Firebase
- **Hosting:** Vercel
- **API routes:** REST Option A
- **API versioning:** `/v1`

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


---

## 13) OpenAPI schema draft (OpenAPI 3.0)

>**Decisions made**:
> - Coordinates are **0-based** (`x` and `y` in `0..2`)
> - Player assignments and who goes first determined by **coin flip** at game creation
> - **Symbols are customizable** (any unicode character); defaults to X and O
> - Authentication via **`anonymousId`** (UUID in browser cookie); **game history is per-user**

```yaml
openapi: 3.0.3
info:
  title: Tic-Tac-Toe REST API
  version: 1.0.0
  description: |
    REST API for playing Tic-Tac-Toe (Noughts and Crosses) against an optimal AI.
    Uses 0-based coordinates (x,y in 0..2). Player assignments and first turn determined by coin flip.
    Symbols are customizable (any unicode character), defaulting to X and O.
    Authentication via anonymousId cookie for per-user game tracking.
servers:
  - url: http://localhost:8080
    description: Local development

tags:
  - name: Sessions
  - name: Moves
  - name: Health

paths:
  /health:
    get:
      tags: [Health]
      summary: Health check
      responses:
        '200':
          description: Service is healthy
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: ok

  /v1/games:
    post:
      tags: [Sessions]
      summary: Create a new game session
      requestBody:
        required: false
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateSessionRequest'
      responses:
        '201':
          description: Created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SessionState'
        '400':
          description: Invalid request
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

    get:
      tags: [Sessions]
      summary: List games (chronological, newest last by default)
      parameters:
        - in: query
          name: limit
          schema:
            type: integer
            minimum: 1
            maximum: 200
            default: 50
          description: Maximum number of sessions to return.
        - in: query
          name: cursor
          schema:
            type: string
          description: Optional pagination cursor.
        - in: query
          name: order
          schema:
            type: string
            enum: [asc, desc]
            default: asc
          description: Sort by createdAt.
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SessionList'

  /v1/games/{gameId}:
    get:
      tags: [Sessions]
      summary: Get session state
      parameters:
        - $ref: '#/components/parameters/SessionId'
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SessionState'
        '404':
          description: Not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /v1/games/{gameId}/moves:
    post:
      tags: [Moves]
      summary: Make the next human move
      description: |
        Submits the human player's next move. The server enforces turn order.
      parameters:
        - $ref: '#/components/parameters/SessionId'
        - in: header
          name: Idempotency-Key
          required: false
          schema:
            type: string
          description: Optional idempotency key for safely retrying requests.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/MoveRequest'
            examples:
              center:
                value: { "x": 1, "y": 1 }
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SessionState'
        '400':
          description: Invalid move payload
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '404':
          description: Session not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '409':
          description: Move rejected due to game state (occupied cell, wrong turn, finished)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

    get:
      tags: [Moves]
      summary: Game history (moves for a session)
      parameters:
        - $ref: '#/components/parameters/SessionId'
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/GameHistory'
        '404':
          description: Session not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

  /v1/games/{gameId}/ai-move:
    post:
      tags: [Moves]
      summary: Let the AI make the next optimal move
      description: |
        Applies the AI's optimal move to the session. The server enforces turn order.
      parameters:
        - $ref: '#/components/parameters/SessionId'
        - in: header
          name: Idempotency-Key
          required: false
          schema:
            type: string
          description: Optional idempotency key for safely retrying requests.
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/SessionState'
        '404':
          description: Session not found
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
        '409':
          description: Move rejected due to game state (wrong turn, finished)
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'

components:
  parameters:
    SessionId:
      in: path
      name: gameId
      required: true
      schema:
        type: string
      description: Session identifier

  schemas:
    CreateSessionRequest:
      type: object
      additionalProperties: false
      properties:
        humanSymbol:
          $ref: '#/components/schemas/Mark'
        startingPlayer:
          type: string
          enum: [HUMAN, AI]
      description: |
        Optional configuration. If omitted: humanSymbol=X, startingPlayer=HUMAN.

    MoveRequest:
      type: object
      additionalProperties: false
      required: [x, y]
      properties:
        x:
          type: integer
          minimum: 0
          maximum: 2
        y:
          type: integer
          minimum: 0
          maximum: 2

    SessionState:
      type: object
      additionalProperties: false
      required: [gameId, createdAt, updatedAt, status, board, humanMark, aiMark, nextTurn, moveNumber]
      properties:
        gameId:
          type: string
        createdAt:
          type: string
          format: date-time
        updatedAt:
          type: string
          format: date-time
        status:
          $ref: '#/components/schemas/GameStatus'
        winner:
          $ref: '#/components/schemas/Winner'
        board:
          $ref: '#/components/schemas/Board'
        humanSymbol:
          $ref: '#/components/schemas/Mark'
        aiSymbol:
          $ref: '#/components/schemas/Mark'
        nextTurn:
          $ref: '#/components/schemas/Mark'
          description: Which mark is expected to move next (X or O).
        moveNumber:
          type: integer
          minimum: 0
          maximum: 9
          description: Number of moves already played (ply count).
        lastMove:
          $ref: '#/components/schemas/Move'

    GameList:
      type: object
      additionalProperties: false
      required: [games]
      properties:
        games:
          type: array
          items:
            $ref: '#/components/schemas/GameSummary'
        nextCursor:
          type: string
          nullable: true

    GameSummary:
      type: object
      additionalProperties: false
      required: [gameId, createdAt, status]
      properties:
        gameId:
          type: string
        createdAt:
          type: string
          format: date-time
        status:
          $ref: '#/components/schemas/GameStatus'
        winner:
          $ref: '#/components/schemas/Winner'
        finalBoard:
          $ref: '#/components/schemas/Board'

    GameHistory:
      type: object
      additionalProperties: false
      required: [gameId, moves]
      properties:
        gameId:
          type: string
        moves:
          type: array
          items:
            $ref: '#/components/schemas/Move'

    Move:
      type: object
      additionalProperties: false
      required: [moveNumber, player, x, y, createdAt]
      properties:
        moveNumber:
          type: integer
          minimum: 0
          maximum: 8
        player:
          $ref: '#/components/schemas/Mark'
        x:
          type: integer
          minimum: 0
          maximum: 2
        y:
          type: integer
          minimum: 0
          maximum: 2
        createdAt:
          type: string
          format: date-time

    Board:
      type: array
      minItems: 3
      maxItems: 3
      items:
        type: array
        minItems: 3
        maxItems: 3
        items:
          $ref: '#/components/schemas/Cell'
      example:
        - ['.', '.', '.']
        - ['.', 'X', '.']
        - ['O', '.', 'O']

    Cell:
      type: string
      description: Either '.' for empty or any unicode character representing a player's symbol

    Mark:
      type: string
      description: Any unicode character used as a game symbol. Defaults to 'X' or 'O'.

    Winner:
      type: string
      nullable: true
      description: The winning player's symbol (any unicode character) or null if no winner yet

    GameStatus:
      type: string
      enum:
        - IN_PROGRESS
        - WON_X
        - WON_O
        - DRAW

    ErrorResponse:
      type: object
      additionalProperties: false
      required: [code, message]
      properties:
        code:
          type: string
          example: INVALID_MOVE
        message:
          type: string
          example: Cell already occupied.
        details:
          type: object
          additionalProperties: true
```

### Suggested error codes
- `INVALID_COORDINATES` (400)
- `INVALID_PAYLOAD` (400)
- `SESSION_NOT_FOUND` (404)
- `CELL_OCCUPIED` (409)
- `WRONG_TURN` (409)
- `GAME_FINISHED` (409)

---

## 14) Detailed task list (Agentive tickets)

> Format: **Ticket** — goal, key tasks, acceptance criteria, dependencies.
> 
> **Note**: This list focuses on high-level architecture and non-functional requirements that must be completed first. Detailed functional requirement tasks (domain engine, AI implementation, service layer, specific API endpoints) will be broken down in subsequent planning once the architecture is established.

### A. Product decisions and API contract
**TT-0001 — Confirm product decisions / defaults**
- Decide: auth vs no-auth; coordinate convention; who goes first; session ordering; pagination; response shape.
- Produce: short "decisions.md" capturing defaults.
- **Acceptance**: decisions.md committed; OpenAPI matches decisions.
- **Dependencies**: none.

**TT-0002 — API contract freeze**
- Finalize OpenAPI and example payloads.
- Add mock responses/examples (optional).
- **Acceptance**: OpenAPI validates; examples cover typical flow.
- **Dependencies**: TT-0001.

---

### B. Technology stack and library selection
**TT-0100 — Select core libraries for schema/REST API/types integration**
- Evaluate and select libraries that maintain relationships between:
  - Entity schema definition
  - Firebase Firestore data models
  - TypeScript type definitions
  - REST API route definitions and validation
- Consider options:
  - NestJS with class-validator and class-transformer
  - TypeORM or similar ORM-style tools (if compatible with Firebase)
  - OpenAPI code generation tools (swagger-codegen, openapi-generator)
  - Firebase Admin SDK with custom type definitions
- Document chosen approach and rationale.
- **Acceptance**: Technology decision documented; sample proof-of-concept showing schema-to-API-to-types flow.
- **Dependencies**: TT-0001.

---

### C. Repository scaffold and tooling
**TT-0101 — Repo scaffold + build tooling**
- Create folder structure: `src/` (api/domain/persistence), `tests/`, `migrations/`, `scripts/`.
- Set up chosen framework and libraries from TT-0100.
- Add formatting/linting/test commands and npm scripts.
- Configure TypeScript with strict mode.
- **Acceptance**: `npm run lint` + `npm run test` run successfully.
- **Dependencies**: TT-0100 (library selection).

**TT-0102 — CI pipeline**
- Configure GitHub Actions to run lint + tests on PR.
- Set up build verification.
- **Acceptance**: CI green on main; pipeline runs on every PR.
- **Dependencies**: TT-0101.

---

### D. Infrastructure and deployment setup
**TT-0401 — Firebase project setup**
- Create Firebase project and configure Firestore database.
- Design high-level collection structure: `games` collection with `moves` subcollection.
- Document schema conventions (anonymousId, 0-based coordinates, coin flip mechanism).
- Set up Firebase emulator for local development.
- **Acceptance**: Firebase emulator runs locally; basic read/write operations work.
- **Dependencies**: TT-0101.

**TT-0702 — Vercel deployment configuration**
- Configure Vercel for cloud deployment.
- Set up Firebase credentials as environment variables.
- Configure environment-specific settings (local/staging/production).
- Wire up health check endpoint.
- **Acceptance**: `vercel dev` works locally; health check endpoint returns 200; production deployment succeeds.
- **Dependencies**: TT-0101, TT-0401.

---

### E. Core infrastructure components
**TT-0601 — HTTP server framework setup**
- Set up HTTP framework with routing.
- Implement base middleware: CORS, body parsing, error handling.
- Implement `/health` endpoint.
- Set up versioned API routing under `/v1`.
- **Acceptance**: `/health` returns ok; framework starts and responds to requests.
- **Dependencies**: TT-0101.

**TT-0701 — Structured logging and monitoring**
- Add request ID middleware and structured logging library.
- Configure log levels and output format.
- Add basic request/response logging.
- **Acceptance**: logs include requestId, method, path, status code, duration.
- **Dependencies**: TT-0601.

---

### F. Documentation and development workflow
**TT-0607 — OpenAPI integration and documentation**
- Integrate OpenAPI spec with the application.
- Set up Swagger UI to serve interactive API docs.
- Ensure schema validation is enforced at API boundaries.
- **Acceptance**: Swagger UI loads at `/api-docs`; spec matches implementation.
- **Dependencies**: TT-0002, TT-0601.

**TT-0703 — Developer README and setup guide**
- Document local development setup (prerequisites, installation, configuration).
- Document Firebase emulator usage.
- Document Vercel deployment process.
- Include architecture overview and library choices.
- Provide example curl commands for testing.
- **Acceptance**: new developer can run application locally in <10 minutes.
- **Dependencies**: TT-0101, TT-0401, TT-0702.

---

### G. Next steps (to be broken down after architecture is complete)
Once the above architecture and infrastructure tasks are complete, the following functional areas will be broken down into detailed implementation tickets:

1. **Domain layer**: Game rules, move validation, win/draw detection, legal move generation
2. **AI implementation**: Minimax algorithm with alpha-beta pruning
3. **Persistence layer**: Firebase repository implementations for games and moves
4. **Service layer**: Game orchestration, move processing, concurrency handling
5. **REST API endpoints**: Individual endpoint implementations for game creation, moves, AI moves, game listing
6. **Optional enhancements**: Idempotency support, ETag/versioning, future auth support
