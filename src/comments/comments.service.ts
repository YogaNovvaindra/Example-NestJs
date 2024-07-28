import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) { }

  async createComment(postId: string, authorId: string, content: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      throw new HttpException({ message: 'Post not found', data: [] }, HttpStatus.NOT_FOUND);
    }
    return this.prisma.comment.create({
      data: {
        content,
        post: { connect: { id: postId } },
        author: { connect: { id: authorId } },
      },
    });
  }

  async getCommentsByPostId(postId: string) {
    return this.prisma.comment.findMany({
      where: { postId },
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        }
      },
    });
  }

  async updateComment(id: string, content: string) {
    return this.prisma.comment.update({
      where: { id },
      data: { content },
    });
  }

  async deleteComment(id: string) {
    return this.prisma.comment.delete({
      where: { id },
    });
  }
}