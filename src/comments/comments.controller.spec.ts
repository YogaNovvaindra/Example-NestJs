import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { HttpException, HttpStatus } from '@nestjs/common';

describe('CommentsController', () => {
  let commentsController: CommentsController;
  let commentsService: CommentsService;
  const timestamp = 1690543200000;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: {
            createComment: jest.fn(),
            getCommentsByPostId: jest.fn(),
            updateComment: jest.fn(),
            deleteComment: jest.fn(),
          },
        },
      ],
    }).compile();

    commentsController = module.get<CommentsController>(CommentsController);
    commentsService = module.get<CommentsService>(CommentsService);
  });

  describe('createComment', () => {
    it('should create a comment successfully', async () => {
      const commentData = { postId: 'post123', content: 'Test comment' };
      const userId = '123e4567-e89b-12d3-a456-426614174000';
      const createdComment = {
        id: '0c78cb48-f8dd-4df1-a794-b301bae2a593',
        content: 'Test comment',
        postId: 'post123',
        authorId: userId,
        createdAt: new Date(timestamp),
        updatedAt: new Date(timestamp),
      };

      jest.spyOn(commentsService, 'createComment').mockResolvedValue(createdComment);

      const result = await commentsController.createComment(
        { user: { userId } },
        commentData,
      );

      expect(result).toEqual({
        message: 'Comment created successfully',
        data: createdComment,
      });
      expect(commentsService.createComment).toHaveBeenCalledWith(
        'post123',
        userId,
        'Test comment',
      );
    });

    it('should throw BadRequestException if postId or content is empty', async () => {
      const commentData = { postId: '', content: '' };
      const userId = '123e4567-e89b-12d3-a456-426614174000';

      await expect(
        commentsController.createComment({ user: { userId } }, commentData),
      ).rejects.toThrow(
        new HttpException(
          {
            message: 'Post Id and content are required and cannot be empty',
            data: [],
          },
          HttpStatus.BAD_REQUEST,
        ),
      );
    });
  });

  describe('getCommentsByPostId', () => {
    it('should return comments by post id', async () => {
      const postId = '098f6bcd-4621-3373-8ade-4e832627b4f6';
      const comments = [
        {
          id: 'a87ff679-a2f3-4e61-9ff1-2b7b3f3b6281',
          content: 'Comment 1',
          postId: postId,
          authorId: '123e4567-e89b-12d3-a456-426614174000',
          createdAt: new Date(timestamp),
          updatedAt: new Date(timestamp),
        },
        {
          id: 'b87ff679-a2f3-4e61-9ff1-2b7b3f3b6282',
          content: 'Comment 2',
          postId: postId,
          authorId: '223e4567-e89b-12d3-a456-426614174001',
          createdAt: new Date(timestamp),
          updatedAt: new Date(timestamp),
        },
      ];

      jest.spyOn(commentsService, 'getCommentsByPostId').mockResolvedValue(comments);

      const result = await commentsController.getCommentsByPostId(postId);

      expect(result).toEqual({
        message: 'Comments retrieved successfully',
        data: comments,
      });
    });

    it('should throw NotFoundException if no comments are found', async () => {
      const postId = '098f6bcd-4621-3373-8ade-4e832627b4f6';

      jest.spyOn(commentsService, 'getCommentsByPostId').mockResolvedValue([]);

      await expect(commentsController.getCommentsByPostId(postId)).rejects.toThrow(
        new HttpException(
          { message: 'No comments found for this post', data: [] },
          HttpStatus.OK,
        ),
      );
    });
  });

  describe('updateComment', () => {
    it('should update a comment successfully', async () => {
      const commentId = '098f6bcd-4621-3373-8ade-4e832627b4f6';
      const commentData = { content: 'Updated comment' };
      const updatedComment = {
        id: commentId,
        content: 'Updated comment',
        postId: 'post123',
        authorId: '123e4567-e89b-12d3-a456-426614174000',
        createdAt: new Date(timestamp),
        updatedAt: new Date(timestamp),
      };

      jest.spyOn(commentsService, 'updateComment').mockResolvedValue(updatedComment);

      const result = await commentsController.updateComment(commentId, commentData);

      expect(result).toEqual({
        message: 'Comment updated successfully',
        data: updatedComment,
      });
    });

    it('should throw NotFoundException if comment to update is not found', async () => {
      const commentId = '098f6bcd-4621-3373-8ade-4e832627b4f6';
      const commentData = { content: 'Updated comment' };

      jest.spyOn(commentsService, 'updateComment').mockResolvedValue(null);

      await expect(
        commentsController.updateComment(commentId, commentData),
      ).rejects.toThrow(
        new HttpException(
          { message: 'Comment not found', data: [] },
          HttpStatus.NOT_FOUND,
        ),
      );
    });
  });

  describe('deleteComment', () => {
    it('should delete a comment successfully', async () => {
      const commentId = '098f6bcd-4621-3373-8ade-4e832627b4f6';
      const deletedComment = {
        id: commentId,
        content: 'Comment to delete',
        postId: 'post123',
        authorId: '123e4567-e89b-12d3-a456-426614174000',
        createdAt: new Date(timestamp),
        updatedAt: new Date(timestamp),
      };

      jest.spyOn(commentsService, 'deleteComment').mockResolvedValue(deletedComment);

      const result = await commentsController.deleteComment(commentId);

      expect(result).toEqual({
        message: 'Comment deleted successfully',
        data: deletedComment,
      });
    });

    it('should throw NotFoundException if comment to delete is not found', async () => {
      const commentId = '098f6bcd-4621-3373-8ade-4e832627b4f6';

      jest.spyOn(commentsService, 'deleteComment').mockResolvedValue(null);

      await expect(commentsController.deleteComment(commentId)).rejects.toThrow(
        new HttpException(
          { message: 'Comment not found', data: [] },
          HttpStatus.NOT_FOUND,
        ),
      );
    });
  });
});