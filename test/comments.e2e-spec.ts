import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('Comments (e2e)', () => {
    let app: INestApplication;
    let prismaService: PrismaService;
    let jwtService: JwtService;
    let authToken: string;
    let testUserId: string;
    let testPostId: string;
    let testCommentId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        prismaService = moduleFixture.get<PrismaService>(PrismaService);
        jwtService = moduleFixture.get<JwtService>(JwtService);

        // Create a test user
        const testUser = await prismaService.user.create({
            data: {
                email: 'testcomment@example.com',
                password: await bcrypt.hash("password123", 10)
            },
        });
        testUserId = testUser.id;

        // Create a test post
        const testPost = await prismaService.post.create({
            data: {
                title: 'Test Post',
                content: 'This is a test post content',
                authorId: testUserId,
            },
        });
        testPostId = testPost.id;

        // Generate JWT token for authentication
        const payload = { email: testUser.email, sub: testUser.id };
        authToken = jwtService.sign(payload);
    });

    it('should create a new comment', () => {
        return request(app.getHttpServer())
            .post('/comments')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ postId: testPostId, content: 'This is a test comment' })
            .expect(HttpStatus.CREATED)
            .expect((res) => {
                expect(res.body.message).toBe('Comment created successfully');
                expect(res.body.data).toBeDefined();
                expect(res.body.data.content).toBe('This is a test comment');
                expect(res.body.data.postId).toBe(testPostId);
                expect(res.body.data.authorId).toBe(testUserId);
                testCommentId = res.body.data.id;
            });
    });

    it('should get comments by post id', () => {
        return request(app.getHttpServer())
            .get(`/comments/post/${testPostId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(HttpStatus.OK)
            .expect((res) => {
                expect(res.body.message).toBe('Comments retrieved successfully');
                expect(Array.isArray(res.body.data)).toBe(true);
                expect(res.body.data.length).toBeGreaterThan(0);
                expect(res.body.data[0].id).toBe(testCommentId);
                expect(res.body.data[0].content).toBe('This is a test comment');
            });
    });

    it('should update a comment', () => {
        return request(app.getHttpServer())
            .put(`/comments/${testCommentId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .send({ content: 'This is an updated test comment' })
            .expect(HttpStatus.OK)
            .expect((res) => {
                expect(res.body.message).toBe('Comment updated successfully');
                expect(res.body.data.id).toBe(testCommentId);
                expect(res.body.data.content).toBe('This is an updated test comment');
            });
    });

    it('should delete a comment', () => {
        return request(app.getHttpServer())
            .delete(`/comments/${testCommentId}`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(HttpStatus.OK)
            .expect((res) => {
                expect(res.body.message).toBe('Comment deleted successfully');
                expect(res.body.data.id).toBe(testCommentId);
            });
    });

    it('should return 400 for empty Post Id or content when creating comment', () => {
        return request(app.getHttpServer())
            .post('/comments')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ postId: '', content: '' })
            .expect(HttpStatus.BAD_REQUEST)
            .expect((res) => {
                expect(res.body.message).toBe('Post Id and content are required and cannot be empty');
                expect(res.body.data).toEqual([]);
            });
    });

    it('should return 404 for non-existent post when creating comment', () => {
        return request(app.getHttpServer())
            .post('/comments')
            .set('Authorization', `Bearer ${authToken}`)
            .send({ postId: 'nonexistentid', content: 'This is a test comment' })
            .expect(HttpStatus.NOT_FOUND)
            .expect((res) => {
                expect(res.body.message).toBe('Post not found');
                expect(res.body.data).toEqual([]);
            });
    });

    it('should return 404 for non-existent comment', () => {
        return request(app.getHttpServer())
            .get(`/comments/post/nonexistentid`)
            .set('Authorization', `Bearer ${authToken}`)
            .expect(HttpStatus.NOT_FOUND)
            .expect((res) => {
                expect(res.body.message).toBe('No comments found for this post');
                expect(res.body.data).toEqual([]);
            });
    });

    afterAll(async () => {
        await prismaService.post.delete({ where: { id: testPostId } });
        await prismaService.user.delete({ where: { id: testUserId } });
        await app.close();
    });
});