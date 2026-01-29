import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<{ message: string }>;
}

describe('Game (e2e)', () => {
  let app: INestApplication<App>;
  let baseUrl: string;
  let restGameId: string;
  let gqlGameId: string;

  beforeAll(async () => {
    if (process.env.BASE_URL) {
      baseUrl = process.env.BASE_URL;
    } else {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.listen(0, '127.0.0.1');
      const address = app.getHttpServer().address();
      if (!address || typeof address === 'string') {
        throw new Error('Failed to start HTTP server for e2e tests.');
      }
      baseUrl = `http://127.0.0.1:${address.port}`;
    }
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  const httpRequest = () => request(baseUrl);
  const gqlRequest = (query: string, variables?: Record<string, unknown>) =>
    httpRequest()
      .post('/graphql')
      .set('Content-Type', 'application/json')
      .send({ query, variables });

  it('/game (POST) creates a game', () => {
    return httpRequest()
      .post('/game')
      .send({ humanSymbol: 'X', aiSymbol: 'O', label: 'rest-game' })
      .expect(201)
      .expect((res) => {
        expect(res.body).toMatchObject({
          status: 'IN_PROGRESS',
          humanSymbol: 'X',
          aiSymbol: 'O',
          nextTurn: 'X',
          moveNumber: 0,
          label: 'rest-game',
        });
        expect(typeof res.body.id).toBe('string');
        restGameId = res.body.id as string;
      });
  });

  it('/game (GET) lists games', () => {
    return httpRequest()
      .get('/game')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
      });
  });

  it('/game/:id (GET) returns a game', () => {
    return httpRequest()
      .get(`/game/${restGameId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body?.id).toBe(restGameId);
      });
  });

  it('/game/:id (PATCH) updates a game', () => {
    return httpRequest()
      .patch(`/game/${restGameId}`)
      .send({ label: 'rest-updated' })
      .expect(200)
      .expect((res) => {
        expect(res.body?.label).toBe('rest-updated');
      });
  });

  it('/game/:id (PATCH) returns null for unknown game', () => {
    return httpRequest()
      .patch('/game/unknown')
      .send({ label: 'missing' })
      .expect(404)
      .expect((res) => {
        expect(res.body?.message).toBe('Game not found');
      });
  });

  it('/game/:id (DELETE) removes a game', () => {
    return httpRequest()
      .delete(`/game/${restGameId}`)
      .expect(200)
      .expect((res) => {
        expect(res.body?.id).toBe(restGameId);
      });
  });

  it('/game/:id (DELETE) returns null for unknown game', () => {
    return httpRequest()
      .delete('/game/unknown')
      .expect(404)
      .expect((res) => {
        expect(res.body?.message).toBe('Game not found');
      });
  });

  it('/graphql (POST) - createGame mutation', () => {
    return gqlRequest(
      'mutation CreateGame($input: CreateGameDto!) { createGame(input: $input) { id status humanSymbol aiSymbol nextTurn moveNumber label } }',
      { input: { humanSymbol: 'X', aiSymbol: 'O', label: 'gql-game' } },
    )
      .expect(200)
      .expect((res) => {
        const body = res.body as GraphQLResponse<{ createGame: { id: string; label?: string } }>;
        expect(body.errors).toBeUndefined();
        expect(body.data?.createGame.label).toBe('gql-game');
        gqlGameId = body.data?.createGame.id ?? '';
        expect(gqlGameId.length).toBeGreaterThan(0);
      });
  });

  it('/graphql (POST) - games query', () => {
    return gqlRequest('{ games { id label } }')
      .expect(200)
      .expect((res) => {
        const body = res.body as GraphQLResponse<{ games: Array<{ id: string }> }>;
        expect(body.errors).toBeUndefined();
        expect(body.data?.games.length).toBeGreaterThan(0);
      });
  });

  it('/graphql (POST) - game query', () => {
    return gqlRequest('query Game($id: String!) { game(id: $id) { id label } }', {
      id: gqlGameId,
    })
      .expect(200)
      .expect((res) => {
        const body = res.body as GraphQLResponse<{ game: { id: string } | null }>;
        expect(body.errors).toBeUndefined();
        expect(body.data?.game?.id).toBe(gqlGameId);
      });
  });

  it('/graphql (POST) - updateGame mutation', () => {
    return gqlRequest(
      'mutation UpdateGame($id: String!, $input: UpdateGameDto!) { updateGame(id: $id, input: $input) { id label } }',
      { id: gqlGameId, input: { label: 'gql-updated' } },
    )
      .expect(200)
      .expect((res) => {
        const body = res.body as GraphQLResponse<{ updateGame: { label?: string } | null }>;
        expect(body.errors).toBeUndefined();
        expect(body.data?.updateGame?.label).toBe('gql-updated');
      });
  });

  it('/graphql (POST) - updateGame mutation returns error for unknown game', () => {
    return gqlRequest(
      'mutation UpdateGame($id: String!, $input: UpdateGameDto!) { updateGame(id: $id, input: $input) { id } }',
      { id: 'missing', input: { label: 'none' } },
    )
      .expect(200)
      .expect((res) => {
        const body = res.body as GraphQLResponse<{ updateGame: { id: string } | null }>;
        expect(body.data?.updateGame).toBeNull();
        expect(body.errors?.[0]?.message).toBe('Game not found');
      });
  });

  it('/graphql (POST) - removeGame mutation', () => {
    return gqlRequest('mutation RemoveGame($id: String!) { removeGame(id: $id) { id } }', {
      id: gqlGameId,
    })
      .expect(200)
      .expect((res) => {
        const body = res.body as GraphQLResponse<{ removeGame: { id: string } | null }>;
        expect(body.errors).toBeUndefined();
        expect(body.data?.removeGame?.id).toBe(gqlGameId);
      });
  });

  it('/graphql (POST) - removeGame mutation returns error for unknown game', () => {
    return gqlRequest('mutation RemoveGame($id: String!) { removeGame(id: $id) { id } }', {
      id: 'missing',
    })
      .expect(200)
      .expect((res) => {
        const body = res.body as GraphQLResponse<{ removeGame: { id: string } | null }>;
        expect(body.data?.removeGame).toBeNull();
        expect(body.errors?.[0]?.message).toBe('Game not found');
      });
  });
});
