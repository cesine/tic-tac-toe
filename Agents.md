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
