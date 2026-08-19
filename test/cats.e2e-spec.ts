import { Test, TestingModule } from '@nestjs/testing';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ZodValidationPipe } from 'nestjs-zod';
import request from 'supertest';
import { CatsModule } from './../src/cats/cats.module';

describe('Cats (e2e)', () => {
  let mongod: MongoMemoryServer;
  let app: NestFastifyApplication;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [MongooseModule.forRoot(mongod.getUri()), CatsModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    app.useGlobalPipes(new ZodValidationPipe());
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  it('POST /cats creates a cat', async () => {
    const res = await request(app.getHttpServer())
      .post('/cats')
      .send({ name: 'Whiskers', age: 3 })
      .expect(201);

    expect(res.body).toMatchObject({ name: 'Whiskers', age: 3 });
    expect(res.body._id).toBeDefined();
  });

  it('POST /cats rejects an invalid payload', async () => {
    await request(app.getHttpServer())
      .post('/cats')
      .send({ name: '', age: -1 })
      .expect(400);
  });

  it('GET /cats returns all cats', async () => {
    await request(app.getHttpServer())
      .post('/cats')
      .send({ name: 'Tom', age: 5 })
      .expect(201);

    const res = await request(app.getHttpServer()).get('/cats').expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(
      res.body.some((cat: { name: string }) => cat.name === 'Tom'),
    ).toBe(true);
  });

  it('GET /cats/:id returns a cat', async () => {
    const created = await request(app.getHttpServer())
      .post('/cats')
      .send({ name: 'Garfield', age: 7 })
      .expect(201);

    const res = await request(app.getHttpServer())
      .get(`/cats/${created.body._id}`)
      .expect(200);

    expect(res.body).toMatchObject({ name: 'Garfield', age: 7 });
  });

  it('GET /cats/:id returns 404 when the cat is missing', async () => {
    await request(app.getHttpServer())
      .get('/cats/507f1f77bcf86cd799439011')
      .expect(404);
  });

  it('PATCH /cats/:id updates a cat', async () => {
    const created = await request(app.getHttpServer())
      .post('/cats')
      .send({ name: 'Felix', age: 2 })
      .expect(201);

    const res = await request(app.getHttpServer())
      .patch(`/cats/${created.body._id}`)
      .send({ age: 3 })
      .expect(200);

    expect(res.body).toMatchObject({ name: 'Felix', age: 3 });
  });

  it('DELETE /cats/:id removes a cat', async () => {
    const created = await request(app.getHttpServer())
      .post('/cats')
      .send({ name: 'Sylvester', age: 4 })
      .expect(201);

    await request(app.getHttpServer())
      .delete(`/cats/${created.body._id}`)
      .expect(200);

    await request(app.getHttpServer())
      .get(`/cats/${created.body._id}`)
      .expect(404);
  });
});
