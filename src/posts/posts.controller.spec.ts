import { Test, TestingModule } from '@nestjs/testing';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('PostsController', () => {
  let postsController: PostsController;
  let postsService: PostsService;
  const timestamp = 1690543200000;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostsController],
      providers: [
        {
          provide: PostsService,
          useValue: {
            createPost: jest.fn(),
            getAllPosts: jest.fn(),
            getPostById: jest.fn(),
            updatePost: jest.fn(),
            deletePost: jest.fn(),
          },
        },
      ],
    }).compile();

    postsController = module.get<PostsController>(PostsController);
    postsService = module.get<PostsService>(PostsService);
  });

  describe('createPost', () => {
    it('should create a post successfully', async () => {
      const postData = { title: 'Test Post', content: 'This is a test post' };
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const createdPost = {
        id: '0c78cb48-f8dd-4df1-a794-b301bae2a593',
        title: 'post 1',
        content: 'content 1',
        published: false,
        createdAt: new Date(timestamp),
        updatedAt: new Date(timestamp),
        authorId: userId,
      };

      jest.spyOn(postsService, 'createPost').mockResolvedValue(createdPost);

      const result = await postsController.createPost(
        { user: { userId } },
        postData,
      );

      expect(result).toEqual({
        message: 'Post created successfully',
        data: createdPost,
      });
      expect(postsService.createPost).toHaveBeenCalledWith(
        userId,
        postData.title,
        postData.content,
      );
    });

    it('should throw BadRequestException if title or content is empty', async () => {
      const postData = { title: '', content: '' };
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      await expect(
        postsController.createPost({ user: { userId } }, postData),
      ).rejects.toThrow(
        new HttpException(
          {
            message: 'Title and content are required and cannot be empty',
            data: [],
          },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });

  describe('getAllPosts', () => {
    it('should return all posts', async () => {
      const posts = [
        {
          id: '098f6bcd-4621-3373-8ade-4e832627b4f6',
          title: 'Post 1',
          content: 'Content 1',
          published: false,
          createdAt: new Date(timestamp),
          updatedAt: new Date(timestamp),
          authorId: 'a87ff679-a2f3-4e61-9ff1-2b7b3f3b6281',
        },
        {
          id: 'a87ff679-a2f3-4e61-9ff1-2b7b3f3b6281',
          title: 'Post 2',
          content: 'Content 2',
          published: true,
          createdAt: new Date(timestamp),
          updatedAt: new Date(timestamp),
          authorId: 'a87ff679-a2f3-4e61-9ff1-2b7b3f3b6281',
        },
      ];

      jest.spyOn(postsService, 'getAllPosts').mockResolvedValue(posts);

      const result = await postsController.getAllPosts();

      expect(result).toEqual({
        message: 'Posts retrieved successfully',
        data: posts,
      });
    });
  });

  describe('getPostById', () => {
    it('should return a post by id', async () => {
      const postId = '098f6bcd-4621-3373-8ade-4e832627b4f6';
      const post = {
        id: postId,
        title: 'Test Post',
        content: 'This is a test post',
        published: false,
        createdAt: new Date(timestamp),
        updatedAt: new Date(timestamp),
        authorId: '123e4567-e89b-12d3-a456-426614174000',
        comments: [
          {
            id: 'a87ff679-a2f3-4e61-9ff1-2b7b3f3b6281',
            content: 'Comment 1',
            postId: postId,
            authorId: 'a87ff679-a2f3-4e61-9ff1-2b7b3f3b6281',
            createdAt: new Date(timestamp),
            updatedAt: new Date(timestamp),
          },
          {
            id: 'a87ff679-a2f3-4e61-9ff1-2b7b3f3b6281',
            content: 'Comment 2',
            postId: postId,
            authorId: 'a87ff679-a2f3-4e61-9ff1-2b7b3f3b6281',
            createdAt: new Date(timestamp),
            updatedAt: new Date(timestamp),
          },
        ],
      };

      jest.spyOn(postsService, 'getPostById').mockResolvedValue(post);

      const result = await postsController.getPostById(postId);

      expect(result).toEqual({
        message: 'Post retrieved successfully',
        data: post,
      });
    });

    it('should throw NotFoundException if post is not found', async () => {
      const postId = '098f6bcd-4621-3373-8ade-4e832627b4f6';

      jest.spyOn(postsService, 'getPostById').mockResolvedValue(null);

      await expect(postsController.getPostById(postId)).rejects.toThrow(
        new HttpException(
          { message: 'Post not found', data: [] },
          HttpStatus.NOT_FOUND,
        ),
      );
    });
  });

  describe('updatePost', () => {
    it('should update a post successfully', async () => {
      const postId = '098f6bcd-4621-3373-8ade-4e832627b4f6';
      const postData = {
        title: 'Updated Post',
        content: 'This is an updated post',
        published: true,
      };
      const existingPost = {
        id: postId,
        title: 'Original Post',
        content: 'This is the original post',
        published: false,
        authorId: '123e4567-e89b-12d3-a456-426614174000',
        createdAt: new Date(timestamp),
        updatedAt: new Date(timestamp),
        comments: [],
      };
      const updatedPost = { ...existingPost, ...postData };

      jest.spyOn(postsService, 'getPostById').mockResolvedValue(existingPost);
      jest.spyOn(postsService, 'updatePost').mockResolvedValue(updatedPost);

      const result = await postsController.updatePost(postId, postData);

      expect(result).toEqual({
        message: 'Post updated successfully',
        data: updatedPost,
      });
    });

    it('should throw NotFoundException if post to update is not found', async () => {
      const postId = '098f6bcd-4621-3373-8ade-4e832627b4f6';
      const postData = {
        title: 'Updated Post',
        content: 'This is an updated post',
        published: true,
      };

      jest.spyOn(postsService, 'getPostById').mockResolvedValue(null);

      await expect(
        postsController.updatePost(postId, postData),
      ).rejects.toThrow(
        new HttpException(
          { message: 'Post not found', data: [] },
          HttpStatus.NOT_FOUND,
        ),
      );
    });
  });

  describe('deletePost', () => {
    it('should delete a post successfully', async () => {
      const postId = '098f6bcd-4621-3373-8ade-4e832627b4f6';
      const existingPost = {
        id: postId,
        title: 'Post to Delete',
        content: 'This post will be deleted',
        published: false,
        authorId: '123e4567-e89b-12d3-a456-426614174000',
        createdAt: new Date(timestamp),
        updatedAt: new Date(timestamp),
        comments: [],
      };

      jest.spyOn(postsService, 'getPostById').mockResolvedValue(existingPost);
      jest.spyOn(postsService, 'deletePost').mockResolvedValue(existingPost);

      const result = await postsController.deletePost(postId);

      expect(result).toEqual({
        message: 'Post deleted successfully',
        data: existingPost,
      });
    });

    it('should throw NotFoundException if post to delete is not found', async () => {
      const postId = '098f6bcd-4621-3373-8ade-4e832627b4f6';

      jest.spyOn(postsService, 'getPostById').mockResolvedValue(null);

      await expect(postsController.deletePost(postId)).rejects.toThrow(
        new HttpException(
          { message: 'Post not found', data: [] },
          HttpStatus.NOT_FOUND,
        ),
      );
    });
  });
});
