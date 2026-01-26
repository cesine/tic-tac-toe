## Overview
- This repository is a NestJS-based Tic-Tac-Toe app.
- Keep changes small, focused, and consistent with existing patterns.

## Common Commands
- Install deps: `npm install`
- Run dev: `npm run start:dev`
- Lint: `npm run lint`
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

## Proving Changes Work
- Run the smallest relevant checks for your change.
- Typical options:
  - Unit tests: `npm test`
  - E2E tests: `npm run test:e2e`
  - Lint: `npm run lint`
- If no automated check fits, note the manual verification steps performed.

## TDD Expectations
- Start with a test that captures the requirement before implementing.
- Keep the test minimal and focused on the behavior under change.
- Use the failing test to guide implementation; stop when it passes.
