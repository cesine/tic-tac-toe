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

# Run e2e tests
npm run test:e2e
```

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

This project uses GitHub Actions for continuous integration and deployment:

- **Lint**: Runs ESLint and Prettier checks
- **Build**: Compiles the TypeScript code
- **Unit Tests**: Runs unit tests with coverage
- **Integration Tests**: Runs integration tests
- **E2E Tests**: Runs end-to-end tests

The workflow is triggered on push and pull requests to `main` and `develop` branches.

## Deployment

The application is configured for deployment to Vercel. The `vercel.json` configuration file is included in the repository.

To deploy:

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`

Or connect your GitHub repository to Vercel for automatic deployments.

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
