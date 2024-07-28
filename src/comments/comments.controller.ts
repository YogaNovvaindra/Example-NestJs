import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private commentsService: CommentsService) { }

  @Post()
  async createComment(@Request() req, @Body() commentData: { postId: string; content: string }) {
    if (!commentData.postId || commentData.postId.trim() === '' || !commentData.content || commentData.content.trim() === '') {
      throw new HttpException(
        { message: 'Post Id and content are required and cannot be empty', data: [] },
        HttpStatus.BAD_REQUEST
      );
    }
    try {
      const authorId = req.user.userId;
      const createdComment = await this.commentsService.createComment(commentData.postId, authorId, commentData.content);
      return { message: 'Comment created successfully', data: createdComment };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        { message: 'Failed to create comment' },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get('post/:postId')
  async getCommentsByPostId(@Param('postId') postId: string) {
    try {
      const comments = await this.commentsService.getCommentsByPostId(postId);
      if (!comments || comments.length === 0) {
        throw new HttpException({ message: 'No comments found for this post', data: [] }, HttpStatus.NOT_FOUND);
      }
      return { message: 'Comments retrieved successfully', data: comments };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({ message: 'Failed to retrieve comments', data: [] }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async updateComment(@Param('id') id: string, @Body() commentData: { content: string }) {
    try {
      const updatedComment = await this.commentsService.updateComment(id, commentData.content);
      if (!updatedComment) {
        throw new HttpException({ message: 'Comment not found', data: [] }, HttpStatus.NOT_FOUND);
      }
      return { message: 'Comment updated successfully', data: updatedComment };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({ message: 'Failed to update comment', data: [] }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async deleteComment(@Param('id') id: string) {
    try {
      const deletedComment = await this.commentsService.deleteComment(id);
      if (!deletedComment) {
        throw new HttpException({ message: 'Comment not found', data: [] }, HttpStatus.NOT_FOUND);
      }
      return { message: 'Comment deleted successfully', data: deletedComment };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({ message: 'Failed to delete comment', data: [] }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}