# TT-0100 ExecPlan: Evaluate Data Models + Persistence for REST and GraphQL

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.

PLANS.md is present at `PLANS.md` and this document must be maintained in accordance with it.

## Purpose / Big Picture

After this work, the project will have a clear, documented choice for how to define data models once and reuse them across both REST and GraphQL endpoints with minimal boilerplate, plus a persistence approach that fits the Tic‑Tac‑Toe domain and the NestJS codebase. The result will be observable through a small proof‑of‑concept that shows a single model flowing through persistence, REST validation, and GraphQL schema generation.

## Progress

- [x] (2026-01-27 14:02Z) Read PLANS.md and existing requirements plan for TT-0100 context.
- [x] (2026-01-27 14:02Z) Create `src/libs/README.md` to host this ExecPlan.
- [x] (2026-01-27 14:05Z) Define evaluation criteria for “minimal boilerplate” and single source of truth.
- [x] (2026-01-27 14:05Z) Gather and summarize concrete integration options with NestJS (schema-first vs code-first).
- [ ] Run a tiny proof‑of‑concept for the top two options (completed: schema-first spike on this branch; remaining: code-first spike in separate branch).
- [ ] Record the decision, tradeoffs, and chosen option in this README.

## Surprises & Discoveries

No discoveries yet.

## Decision Log

No decisions yet.

Sources to consult when making the decision (official docs), embedded here per the requirement to include supporting links in the relevant README:
`https://docs.nestjs.com/graphql/quick-start`
`https://docs.nestjs.com/graphql/cli-plugin`
`https://docs.nestjs.com/graphql/generating-sdl`
`https://docs.nestjs.com/graphql/resolvers`
`https://docs.nestjs.com/graphql/interfaces`

## Outcomes & Retrospective

No outcomes yet.

## Context and Orientation

This repository is a NestJS app, so the solution must integrate with Nest modules, controllers, and (for GraphQL) resolvers. We need a way to define data models once and reuse them for three concerns: REST request/response validation, GraphQL schema generation, and database persistence. “Minimal boilerplate” means fewer duplicated model definitions and fewer hand‑written mappings between layers. The work will live under `src` and should align with existing Nest conventions.

Firestore is the required persistence target (NoSQL), so we will not consider SQL‑centric ORMs as primary options.

## Sources Summary (for schema‑first vs code‑first)

NestJS documents two supported GraphQL approaches: code first and schema first. In code first, decorators on TypeScript classes generate the GraphQL schema, while in schema first, GraphQL SDL files are the source of truth and TypeScript definitions can be generated from the SDL to reduce duplication. The docs describe configuration differences: code first uses `autoSchemaFile`, schema first uses `typePaths` and can generate TS types from the SDL AST. These points establish the official framing for the decision we need to make here. citeturn0search1

The resolvers documentation reinforces that code first centers on TypeScript class decorators for schema generation, while schema first defines types in SDL and Nest aggregates them at runtime. citeturn0search2

The interfaces section shows that some features are applied differently depending on code first vs schema first (for example, how interfaces are declared and registered), which can impact boilerplate in either approach. citeturn0search4

The CLI plugin documentation explains that TypeScript metadata reflection has limitations that can require extra decorators in code first, and the plugin can reduce that boilerplate by enhancing compilation. This is relevant to a “minimal boilerplate” decision. citeturn0search3

The “Generating SDL” section shows code‑first tooling for generating SDL without running a full server, which matters if we want a schema artifact to compare against schema‑first flow. citeturn0search4

## Evaluation Criteria (Minimal Boilerplate + Single Source of Truth)

Minimal boilerplate means that when we add a new attribute to an entity, we edit exactly one definition and the rest of the system updates automatically or via generated artifacts. The acceptance bar for “single source of truth” is:

1) Add one field in exactly one place (the source of truth) and regenerate or recompile to have:
   - REST validation updated to accept/return the field.
   - GraphQL schema updated to expose the field.
   - Persistence mapping updated to store and load the field.
2) No manual, per‑field mapping edits in more than one file per new attribute.
3) The total number of model files touched per new attribute is 1 (plus generated artifacts).

The chosen approach must also be compatible with Firestore persistence via a repository layer (Firebase Admin SDK or emulator) and should keep REST + GraphQL models aligned without extra hand‑written duplication.

## Plan of Work

First, define what “minimal boilerplate” means for this repo by listing the repeated artifacts we want to avoid (for example, separate DTOs for REST and GraphQL, or manual type mapping between persistence models and API models). The user wants a single source of truth for adding new attributes to an entity, so the criteria must explicitly describe where that single source lives and how changes propagate. Then evaluate at least two concrete options that fit NestJS and can be used for both REST and GraphQL. Each option must explain how it handles model definition, validation, GraphQL schema generation, and persistence mapping, plus how the same model type is reused in both REST controllers and GraphQL resolvers.

The options to evaluate are:

Option A: Code‑first GraphQL with shared DTOs and Firestore persistence. This uses NestJS GraphQL code‑first decorators on classes that also serve as REST DTOs with class‑validator. Firestore persistence is handled via the Firebase Admin SDK and a repository layer that maps DTOs to stored documents. The single source of truth is the decorated TypeScript class.

Option B: Schema‑first GraphQL with generated TypeScript types and Firestore persistence. This uses GraphQL SDL files as the source of truth, generates TS definitions from SDL, and uses those definitions in REST DTOs and persistence mapping. The key question is whether the generated types plus REST DTO validation still minimizes duplication and keep SDL as the single source of truth.

If needed, a third option can be included as a comparator (for example, code‑first with generated OpenAPI schema), but only if it materially changes the boilerplate profile.

After comparing options, implement a tiny proof‑of‑concept with the top two. The proof‑of‑concept should include:

1) A minimal “GameSession” model defined once, then extended with one new attribute to prove the single source of truth flow.
2) A REST endpoint that accepts and returns it with validation.
3) A GraphQL query or mutation that exposes it and generates a schema.
4) A persistence layer stub that either writes to an in‑memory store or a local Firestore emulator (preferred) depending on what is feasible for the spike.

Use the proof‑of‑concept to decide and record the final choice in the Decision Log, including the tradeoffs and why this choice best fits the “minimal boilerplate” goal. Update this README with the final decision and keep the Progress checklist accurate.

## Concrete Steps

All commands run from the repository root.

1) Define evaluation criteria in this README. This is a brief paragraph listing the specific kinds of duplication we want to avoid and how we’ll measure effort (for example, number of model files created per domain entity), plus how to verify the single source of truth when adding a new attribute.

2) Summarize the selected options in this README, including a short description of how each option handles:
   - REST validation
   - GraphQL schema generation
   - Persistence mapping
   - Where the single source of truth lives

3) Build a tiny proof‑of‑concept for the top two options in a temporary folder under `src/libs/tt-0100-spikes`. Keep the code minimal and delete it if it is not the chosen approach. If a spike requires extra packages, note them here and add them using `npm install`.
   - Spike A (code‑first): define `GameSession` class once with GraphQL decorators and class‑validator decorators, use the class in a REST controller and a GraphQL resolver, and map it to Firestore documents in a repository. Add one new attribute (for example `label?: string`) only on the class, then regenerate the GraphQL schema and confirm REST + GraphQL both expose the new field.
   - Spike B (schema‑first): define `GameSession` only in SDL under `src/libs/tt-0100-spikes/schema-first/schema.graphql`, generate TS types, then create minimal REST DTOs that use the generated types, and map the same types to Firestore documents in a repository. Add one new attribute only in SDL, re‑generate types, and confirm REST + GraphQL both expose the new field without extra manual edits.

4) Run the smallest relevant checks. At minimum, start the Nest server and verify that both REST and GraphQL endpoints for the spike respond.

5) Record the decision in the Decision Log with the supporting source links (in code formatting), plus a short rationale.

## Validation and Acceptance

Acceptance for TT‑0100 is achieved when:

1) This README contains a clear decision, tradeoffs, and the reason for choosing one option.
2) There is evidence from a proof‑of‑concept demonstrating the model flowing through REST validation, GraphQL schema generation, and persistence access.
3) The approach is consistent with NestJS conventions and minimizes duplicated model definitions.

To validate, run the dev server and confirm:

  - A REST endpoint accepts a valid payload and rejects invalid input with validation errors.
  - A GraphQL endpoint responds and the schema includes the model definition.
  - The persistence stub (or SQLite database) returns or stores the model data.

## Idempotence and Recovery

The steps are additive and can be repeated safely. If a proof‑of‑concept is rejected, delete the spike directory and remove any unused dependencies before finalizing the decision.

## Artifacts and Notes

Keep any short logs or diffs here that demonstrate the proof‑of‑concept behavior (for example, a REST request and GraphQL query that both return the same model).

Game entity spike (schema‑first) notes:
- Schema source: `src/schema.graphql` defines Game types, inputs, queries, and mutations.
- Implementation: `src/game` provides REST controller + GraphQL resolver using schema-first decorators (`@Resolver('Game')`, `@Query('game')`, `@Mutation('createGame')`).
- Testing: `npm test` and `npm run test:e2e` (e2e covers REST + GraphQL game flows and error cases).
- Sources consulted for schema‑first GraphQL:
  `https://docs.nestjs.com/graphql/quick-start`
  `https://docs.nestjs.com/graphql/resolvers`
  `https://docs.nestjs.com/graphql/interfaces`
  `https://docs.nestjs.com/graphql/schema-first`

Schema-first spike generation notes:
- Files were created manually to mirror schema-first requirements (SDL in `src/schema.graphql`, resolver/controller/module in `src/game`), since Nest generators primarily scaffold code-first GraphQL.

---

Plan update note (2026-01-27): Updated TT‑0100 ExecPlan with evaluation criteria focused on single source of truth and outlined concrete proof‑of‑concept spikes for schema‑first vs code‑first.
