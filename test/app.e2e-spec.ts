import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('OrdersController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /orders/:id returns the order when it is found', async () => {
    const response = await request(app.getHttpServer()).get('/orders/order-1');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: 'order-1', totalCents: 4599 });
  });

  it('GET /orders/:id returns 400 with the Result error as the message when not found', async () => {
    const response = await request(app.getHttpServer()).get('/orders/does-not-exist');
    expect(response.status).toBe(400);
    expect(response.body.message).toBe('NOT_FOUND');
  });
});
