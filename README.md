# Tic-Tac-Toe REST/GraphQL API

A playground for various agents to build features and collaborate towards a tic-tac-toe REST/GraphQL API.

## Description

This project is built with [Nest.js](https://nestjs.com/) framework, providing both REST and GraphQL APIs for a tic-tac-toe game. It includes a complete CI/CD pipeline with GitHub Actions and deployment configuration for Vercel.

## Features

- 🎮 REST API endpoints
- 🚀 GraphQL API with Apollo Server
- ✅ Comprehensive testing (unit, integration, e2e)
- 🔍 ESLint + Prettier for code quality
- 🤖 GitHub Actions CI/CD workflow
- ☁️ Vercel deployment ready

## Project Setup

```bash
# Install dependencies
npm install
```

## Running the Application

```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod

# Debug mode
npm run start:debug
```

The application will be available at:
- REST API: http://localhost:3000
- GraphQL Playground: http://localhost:3000/graphql

## Testing

```bash
# Run unit tests
npm run test

# Run unit tests with coverage
npm run test:cov

# Run unit tests in watch mode
npm run test:watch

# Run integration/e2e tests
npm run test:e2e

# Run integration tests with coverage
npm run test:integration -- --coverage
```

### Coverage Thresholds

The project enforces minimum coverage thresholds to ensure code quality:

**Unit Tests** (enforced via `package.json`):
- Statements: 37%
- Branches: 50%
- Functions: 50%
- Lines: 33%

**Integration Tests** (enforced via `test-e2e/jest-e2e.json`):
- Statements: 100%
- Branches: 75%
- Functions: 100%
- Lines: 100%

Tests will fail if coverage drops below these thresholds. Run tests with `--coverage` flag to check current coverage levels.

## Code Quality

```bash
# Run linter
npm run lint

# Format code
npm run format

# Check formatting
npm run format -- --check
```

## Building

```bash
# Build the project
npm run build
```

The compiled output will be in the `dist/` directory.

## CI/CD

This project uses GitHub Actions for continuous integration:

- **Lint**: Runs ESLint and Prettier checks
- **Build**: Compiles the TypeScript code
- **Unit Tests**: Runs unit tests with coverage
- **Integration Tests**: Runs integration tests locally

The CI workflow is triggered on push and pull requests to the `main` branch.

### E2E Testing

E2E tests run against actual Vercel deployments using a separate workflow triggered by Vercel deployment webhooks:

- Tests run automatically after each successful deployment (both preview and production)
- Tests use the actual deployed URL to validate the live application
- PR preview deployments receive automatic test result comments

## Deployment

The application deploys automatically to Vercel via GitHub integration:

1. **Connect Repository to Vercel**:
   - Import your GitHub repository in Vercel
   - Vercel will automatically deploy on every push

2. **Configure Deployment Webhook** (for E2E tests):
   - Go to your Vercel project settings
   - Navigate to "Git" → "Deploy Hooks"
   - Create a webhook that triggers GitHub Actions on deployment
   - Configure it to send `repository_dispatch` events to trigger the E2E workflow

3. **Local Development**:
   - Install Vercel CLI: `npm i -g vercel`
   - Run: `vercel` for preview deployments

### Environment Variables

For local development and testing, you can set:
- `BASE_URL`: The URL to run e2e tests against (defaults to local test instance)

## Technology Stack

- **Framework**: Nest.js
- **Language**: TypeScript
- **API**: REST + GraphQL (Apollo Server)
- **Testing**: Jest + Supertest
- **Linting**: ESLint + Prettier
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel

## License

This project is licensed under the ISC License.
