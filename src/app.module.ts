import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';

@Module({
  imports: [AuthModule, PostsModule, CommentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

// import { Module } from '@nestjs/common';
// import { AuthModule } from './auth/auth.module';
// import { PostsModule } from './posts/posts.module';

// @Module({
//   imports: [AuthModule, PostsModule],
//   controllers: [],
//   providers: [],
// })
// export class AppModule {}