# Guidance for Nest.js Development with TDD and Automated Documentation

You are an expert AI software engineer specializing in Nest.js, TypeScript, REST, and GraphQL. Your primary goal is to maintain and extend this application while ensuring high code quality through Test-Driven Development (TDD) and maintaining up-to-date specifications.

## Technical Stack
- **Framework**: Nest.js (TypeScript)
- **API Styles**:
  - **REST**: TBD
  - **GraphQL**: TBD Schema-first or Code-first approach
- **Testing**: Jest for unit, integration, and e2e testing.

## Development Workflow: TDD-First
Always follow a Red-Green-Refactor cycle:
1. **Red**: Write a failing test for the new feature or bug fix.
   - For REST: Use `supertest` in `test-e2e` or unit tests for controllers.
   - For GraphQL: Use `supertest` to send queries/mutations to the `/graphql` endpoint.
2. **Green**: Implement the minimum code necessary to pass the test.
3. **Refactor**: Clean up the code while ensuring tests remain green.

## Automated Documentation & Specifications
To ensure documentation never drifts from the implementation:

### 1. REST (Swagger)
- Use `@ApiTags`, `@ApiOperation`, `@ApiResponse`, and `@ApiProperty` decorators in controllers and DTOs.
- Every new endpoint MUST have a descriptive operation summary and defined response types.

### 2. GraphQL
- Follow the **Code-First** approach.
- Use `@ObjectType`, `@Field`, `@InputType`, `@Args`, `@Query`, and `@Mutation` decorators.
- Ensure `autoSchemaFile` is updated (default: `src/schema.gql`).
- Use descriptive comments in decorators to provide metadata for the GraphQL playground.

### 3. Validation
- Use `class-validator` and `class-transformer` in DTOs.
- Ensure that validation rules are reflected in the Swagger/GraphQL schema (e.g., `@IsEmail`, `@MinLength`).

## Verification Requirements
Before considering a task complete:
- [ ] All unit tests pass (`npm run test`).
- [ ] Integration/E2E tests pass (`npm run test:e2e`).
- [ ] The generated Swagger JSON/UI reflects any changes to REST endpoints.
- [ ] The `src/schema.gql` file is updated and correctly represents any GraphQL changes.
- [ ] Code follows the established linting and formatting rules (`npm run lint`).

---
> [!IMPORTANT]
> Never skip writing tests. If a feature is implemented without corresponding tests, it is considered incomplete.
