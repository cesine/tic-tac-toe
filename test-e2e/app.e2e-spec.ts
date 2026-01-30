import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let baseUrl: string;

  beforeAll(async () => {
    // If BASE_URL is provided, test against remote deployment
    if (process.env.BASE_URL) {
      baseUrl = process.env.BASE_URL;
    } else {
      // Otherwise, test against local app instance
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

  it('/ (GET)', () => {
    return httpRequest().get('/').expect(200).expect('Hello World!');
  });

  it('/graphql (POST) - hello query', () => {
    return httpRequest()
      .post('/graphql')
      .set('Content-Type', 'application/json')
      .send({
        query: '{ hello }',
      })
      .expect(200)
      .expect((res) => {
        expect(res.body?.data?.hello).toBe('Hello World from GraphQL!');
      });
  });
});
