import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../src/prisma/prisma.service';
import { AuthService } from '../src/auth/auth.service';
import * as bcrypt from 'bcrypt';

describe('Posts (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let prismaService: PrismaService;
  let authService: AuthService;
  let authToken: string;
  let createdPostId: string;
  let testUserId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
    authService = moduleFixture.get<AuthService>(AuthService);

    // Create a test user in the database
    const testUser = await prismaService.user.create({
      data: {
        email: 'testposts@example.com',
        password: await bcrypt.hash("password123", 10)
      },
    });
    testUserId = testUser.id;

    // Generate a JWT token for the test user
    const payload = { email: testUser.email, sub: testUser.id };
    authToken = jwtService.sign(payload);
  });

  it('should create a new post', () => {
    return request(app.getHttpServer())
      .post('/posts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Test Post', content: 'This is a test post content' })
      .expect(HttpStatus.CREATED)
      .expect((res) => {
        expect(res.body.message).toBe('Post created successfully');
        expect(res.body.data).toBeDefined();
        expect(res.body.data.title).toBe('Test Post');
        expect(res.body.data.content).toBe('This is a test post content');
        expect(res.body.data.authorId).toBe(testUserId);
        createdPostId = res.body.data.id;
      });
  });

  it('should get all posts', () => {
    return request(app.getHttpServer())
      .get('/posts')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body.message).toBe('Posts retrieved successfully');
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data.length).toBeGreaterThan(0);
      });
  });

  it('should get a post by id', () => {
    return request(app.getHttpServer())
      .get(`/posts/${createdPostId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body.message).toBe('Post retrieved successfully');
        expect(res.body.data.id).toBe(createdPostId);
        expect(res.body.data.title).toBe('Test Post');
        expect(res.body.data.content).toBe('This is a test post content');
      });
  });

  it('should update a post', () => {
    return request(app.getHttpServer())
      .put(`/posts/${createdPostId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Updated Test Post', content: 'This is an updated test post content', published: true })
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body.message).toBe('Post updated successfully');
        expect(res.body.data.id).toBe(createdPostId);
        expect(res.body.data.title).toBe('Updated Test Post');
        expect(res.body.data.content).toBe('This is an updated test post content');
        expect(res.body.data.published).toBe(true);
      });
  });

  it('should delete a post', () => {
    return request(app.getHttpServer())
      .delete(`/posts/${createdPostId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body.message).toBe('Post deleted successfully');
        expect(res.body.data.id).toBe(createdPostId);
      });
  });

  it('should return 404 for non-existent post', () => {
    const nonExistentId = '00000000-0000-0000-0000-000000000000'; // A non-existent UUID
    return request(app.getHttpServer())
      .get(`/posts/${nonExistentId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .expect(HttpStatus.NOT_FOUND)
      .expect((res) => {
        expect(res.body.message).toBe('Post not found');
        expect(res.body.data).toEqual([]);
      });
  });

  it('should return 400 for empty title or content', () => {
    return request(app.getHttpServer())
      .post('/posts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: '', content: '' })
      .expect(HttpStatus.BAD_REQUEST)
      .expect((res) => {
        expect(res.body.message).toBe('Title and content are required and cannot be empty');
        expect(res.body.data).toEqual([]);
      });
  });

  afterAll(async () => {
    // Clean up: delete the test user
    await prismaService.user.delete({ where: { id: testUserId } });
    await app.close();
  });
});