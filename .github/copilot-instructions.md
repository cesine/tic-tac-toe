# GitHub Copilot Instructions for Tic-Tac-Toe

This repository is a NestJS-based Tic-Tac-Toe application with both REST and GraphQL APIs. These instructions help GitHub Copilot provide better assistance tailored to this project.

## Project Overview

- **Framework**: NestJS (TypeScript)
- **API Styles**: REST and GraphQL (Apollo Server)
- **Testing**: Jest for unit tests, Supertest for E2E tests
- **Code Quality**: ESLint + Prettier
- **Deployment**: Vercel with GitHub Actions CI/CD

## Project Structure

```
src/              # Application source code
test-e2e/         # End-to-end tests
.github/          # GitHub workflows and configurations
  workflows/      # CI/CD workflow definitions
  commands/       # Custom GitHub commands
nest-cli.json     # NestJS CLI configuration
tsconfig*.json    # TypeScript configurations
eslint.config.mjs # ESLint configuration
```

## Development Workflow

### Common Commands

```bash
# Installation
npm install

# Development
npm run start:dev    # Run in development mode with watch
npm run start:debug  # Run in debug mode

# Testing
npm test            # Run unit tests
npm run test:e2e    # Run E2E tests
npm run test:cov    # Run tests with coverage

# Code Quality
npm run lint        # Run ESLint with auto-fix
npm run format      # Format code with Prettier

# Build
npm run build       # Build for production
```

### Test-Driven Development (TDD)

**Always follow TDD practices:**

1. **Red**: Write a failing test first
   - For REST endpoints: Use `supertest` in `test-e2e/`
   - For GraphQL: Use `supertest` to send queries/mutations to `/graphql`
   - For units: Create `.spec.ts` files alongside source files

2. **Green**: Implement minimal code to make the test pass

3. **Refactor**: Clean up while keeping tests green

### Code Changes

**Keep changes minimal and focused:**

- Make the smallest possible changes to achieve the goal
- Don't fix unrelated bugs or broken tests
- Update documentation only when directly related to changes
- Always validate changes don't break existing behavior
- Never delete working code unless absolutely necessary

### Testing Requirements

**Coverage Thresholds:**

Unit Tests (via `package.json`):
- Statements: 37%
- Branches: 50%
- Functions: 50%
- Lines: 33%

Integration Tests (via `test-e2e/jest-e2e.json`):
- Statements: 100%
- Branches: 75%
- Functions: 100%
- Lines: 100%

**Test Execution:**
- Run the smallest relevant checks for changes
- Unit tests: `npm test`
- E2E tests: `npm run test:e2e`
- Lint: `npm run lint`
- Don't reduce E2E coverage; if unavoidable, explain why

### API Documentation

**REST:**
- Currently using basic NestJS controllers with `@Controller`, `@Get`, `@Post`, etc.
- No Swagger/OpenAPI integration yet (consider adding `@nestjs/swagger` if API documentation is needed)

**GraphQL (Code-First):**
- Use `@ObjectType`, `@Field`, `@InputType`, `@Args` decorators
- Use `@Query` and `@Mutation` for resolvers
- Schema auto-generates at `src/schema.gql` when the application starts
- GraphQL playground available at `/graphql` endpoint

**Validation:**
- NestJS built-in `ValidationPipe` can be used
- Consider adding `class-validator` and `class-transformer` packages for DTO validation if needed

## Code Style

- Don't add comments unless they match existing style or explain complexity
- Use existing libraries; only add new dependencies if necessary
- Follow existing patterns in the codebase
- Respect TypeScript strict mode settings

## Execution Plans (ExecPlans)

For complex or tricky work, follow guidance in `PLANS.md`:

- Use ExecPlans as living documents
- Keep them updated as work progresses
- Self-contained: include all knowledge needed
- Define every term of art in plain language
- State observable outcomes and validation steps

See `PLANS.md` for comprehensive ExecPlan requirements.

## Design Decisions

Before implementing:
1. Consider at least two implementation options
2. Record decisions in relevant directory READMEs
3. Include links to supporting documentation

## CI/CD

**GitHub Actions Workflows:**
- Lint, build, unit tests run on every push/PR
- E2E tests run against Vercel deployments
- All checks must pass before merge

**Before Committing:**
- Run linter: `npm run lint`
- Run tests: `npm test`
- Verify build: `npm run build`

## Common Patterns

### Creating a New REST Endpoint

1. Write E2E test in `test-e2e/`
2. Create/update controller with appropriate decorators (`@Controller`, `@Get`, `@Post`, etc.)
3. Create/update DTOs if needed (consider adding validation packages like `class-validator` for complex validation)
4. Implement service logic
5. Run tests to verify

### Creating a GraphQL Resolver

1. Write E2E test sending query/mutation to `/graphql`
2. Create/update resolver with `@Query` or `@Mutation`
3. Define `@ObjectType` and `@InputType` classes with `@Field` decorators
4. Implement resolver logic
5. Start the app to verify `src/schema.gql` generates correctly
6. Run tests to verify

### Adding Validation (if needed)

1. Install validation packages: `npm install class-validator class-transformer`
2. Add decorators to DTOs (`@IsString`, `@IsEmail`, `@MinLength`, etc.)
3. Ensure `ValidationPipe` is configured in `main.ts`
4. Test invalid inputs return proper errors
5. Verify GraphQL schema reflects validation rules

## Additional Resources

- **Agent Guidelines**: See `AGENTS.md` for detailed agent workflow
- **Execution Plans**: See `PLANS.md` for ExecPlan requirements
- **NestJS Docs**: https://nestjs.com/
- **GraphQL Docs**: https://graphql.org/
- **Jest Testing**: https://jestjs.io/

## Key Principles

1. **Test-Driven Development**: Always write tests first
2. **Minimal Changes**: Make the smallest change that works
3. **Documentation**: Keep code well-documented and schemas up-to-date
4. **Quality**: Maintain coverage thresholds and pass all checks
5. **Consistency**: Follow existing patterns and conventions
