## Overview
- This repository is a NestJS-based Tic-Tac-Toe app.
- Keep changes small, focused, and consistent with existing patterns.

## Common Commands
- Install deps: `npm install`
- Run dev: `npm run start:dev`
- Lint: `npm run lint`
- Format: `npm run format`
- Test: `npm test`
- E2E: `npm run test:e2e`

## Project Layout
- App code: `src`
- E2E tests: `test-e2e`
- Config: `tsconfig*.json`, `nest-cli.json`, `eslint.config.mjs`

## Agent Workflow
- Prefer `rg` for search.
- Use `apply_patch` for single-file edits when practical.
- Avoid touching unrelated files; do not reformat broadly.

## ExecPlans
- Use ExecPlans for complex or tricky work, following the ExecPlans guidance in `PLANS.md`.
- Treat ExecPlans as living documents and keep them updated as work progresses.

## Proving Changes Work
- Run the smallest relevant checks for your change.
- Typical options:
  - Unit tests: `npm test`
  - E2E tests: `npm run test:e2e`
  - Lint: `npm run lint`
- If no automated check fits, note the manual verification steps performed.

## E2E Coverage
- Add or update E2E cases for new behaviors and edge conditions.
- Avoid reducing coverage; if unavoidable, explain why and add follow-up tasks.
- Prefer end-to-end assertions that validate full request/response flow.

## TDD Expectations
- Start with a test that captures the requirement before implementing.
- Keep the test minimal and focused on the behavior under change.
- Use the failing test to guide implementation; stop when it passes.

## Design Decisions
- Consider at least two implementation options before coding.
- Record the decision in the README for the relevant directory (e.g.,
  persistence, models, OpenAPI). Include links to supporting sources
  (docs, articles, blogs, or similar).
