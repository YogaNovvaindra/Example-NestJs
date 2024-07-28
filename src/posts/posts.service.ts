import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostsService {
  static getPostById(postId: string) {
    throw new Error('Method not implemented.');
  }
  constructor(private prisma: PrismaService) {}

  async createPost(authorId: string, title: string, content: string) {
    return this.prisma.post.create({
      data: {
        title,
        content,
        author: { connect: { id: authorId } },
      },
    });
  }

  async getAllPosts() {
    return this.prisma.post.findMany({
      include: { author: true },
    });
  }

  async getPostById(id: string) {
    return this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            email: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  async updatePost(id: string, title: string, content: string, published: boolean) {
    return this.prisma.post.update({
      where: { id },
      data: { title, content, published },
    });
  }

  async deletePost(id: string) {
    return this.prisma.post.delete({
      where: { id },
    });
  }


}