import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
  });

  it('should register a new user', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'test@example.com', password: 'password123' })
      .expect(HttpStatus.CREATED)
      .expect((res) => {
        expect(res.body.message).toBe('Login successful');
        expect(res.body.token).toBeDefined();
        expect(res.body.data).toEqual([]);
      });
  });

  it('should login and return a JWT token', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password123' })
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body.message).toBe('Login successful');
        expect(res.body.token).toBeDefined();
        expect(res.body.data).toEqual([]);
      });
  });

  it('should logout successfully', async () => {
    // First, login to get a token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    const token = loginResponse.body.token;

    // Then, use the token to logout
    return request(app.getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body.message).toBe('Logged out successfully');
        expect(res.body.data).toEqual([]);
      });
  });

  it('should return 401 for invalid credentials', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'wrong@example.com', password: 'wrongpassword' })
      .expect(HttpStatus.UNAUTHORIZED)
      .expect((res) => {
        expect(res.body.message).toBe('Invalid credentials');
        expect(res.body.data).toEqual([]);
      });
  });

  it('should return 409 when registering an existing user', async () => {
    // First, register a user
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'existing@example.com', password: 'password123' });

    // Then, try to register the same user again
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'existing@example.com', password: 'password123' })
      .expect(HttpStatus.CONFLICT)
      .expect((res) => {
        expect(res.body.message).toBe('User already exists');
        expect(res.body.data).toEqual([]);
      });
  });

  afterAll(async () => {
    // Delete both test users
    await prismaService.user.deleteMany({
      where: {
        email: {
          in: ['test@example.com', 'existing@example.com'],
        },
      },
    });

    await app.close();
  });
});
