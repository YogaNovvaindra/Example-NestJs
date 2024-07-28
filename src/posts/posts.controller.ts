import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private postsService: PostsService) {}

  @Post()
  async createPost(@Request() req, @Body() postData: { title: string; content: string }) {
    if (!postData.title || postData.title.trim() === '' || !postData.content || postData.content.trim() === '') {
      throw new HttpException(
        { message: 'Title and content are required and cannot be empty', data: [] },
        HttpStatus.BAD_REQUEST
      );
    }
    try {
      const authorId = req.user.userId;
      const createdPost = await this.postsService.createPost(authorId, postData.title, postData.content);
      return { message: 'Post created successfully', data: createdPost };
    } catch (error) {
      throw new HttpException({ message: 'Failed to create post', data: [] }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async getAllPosts() {
    try {
      const posts = await this.postsService.getAllPosts();
      return { message: 'Posts retrieved successfully', data: posts };
    } catch (error) {
      throw new HttpException({ message: 'Failed to retrieve posts', data: [] }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async getPostById(@Param('id') id: string) {
    try {
      const post = await this.postsService.getPostById(id);
      if (!post) {
        throw new HttpException({ message: 'Post not found', data: [] }, HttpStatus.NOT_FOUND);
      }
      return { message: 'Post retrieved successfully', data: post };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({ message: 'Failed to retrieve post', data: [] }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async updatePost(@Param('id') id: string, @Body() postData: { title: string; content: string; published: boolean }) {
    try {
      const post = await this.postsService.getPostById(id);
      if (!post) {
        throw new HttpException({ message: 'Post not found', data: [] }, HttpStatus.NOT_FOUND);
      }
      const updatedPost = await this.postsService.updatePost(id, postData.title, postData.content, postData.published);
      return { message: 'Post updated successfully', data: updatedPost };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({ message: 'Failed to update post', data: [] }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async deletePost(@Param('id') id: string) {
    try {
      const post = await this.postsService.getPostById(id);
      if (!post) {
        throw new HttpException({ message: 'Post not found', data: [] }, HttpStatus.NOT_FOUND);
      }
      const deletedPost = await this.postsService.deletePost(id);
      return { message: 'Post deleted successfully', data: deletedPost };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException({ message: 'Failed to delete post', data: [] }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}