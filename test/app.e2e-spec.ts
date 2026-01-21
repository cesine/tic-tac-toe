import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<{ message: string }>;
}

interface HelloQueryResponse {
  hello: string;
}

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let baseUrl: string;

  beforeEach(async () => {
    // If BASE_URL is provided, test against remote deployment
    if (process.env.BASE_URL) {
      baseUrl = process.env.BASE_URL;
    } else {
      // Otherwise, test against local app instance
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = moduleFixture.createNestApplication();
      await app.init();
      baseUrl = '';
    }
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/ (GET)', () => {
    const req = baseUrl ? request(baseUrl) : request(app.getHttpServer());
    return req.get('/').expect(200).expect('Hello World!');
  });

  it('/graphql (POST) - hello query', () => {
    const req = baseUrl ? request(baseUrl) : request(app.getHttpServer());
    return req
      .post('/graphql')
      .set('Content-Type', 'application/json')
      .send({
        query: '{ hello }',
      })
      .expect(200)
      .expect((res) => {
        const body = res.body as GraphQLResponse<HelloQueryResponse>;
        expect(body.data?.hello).toBe('Hello World from GraphQL!');
      });
  });
});
