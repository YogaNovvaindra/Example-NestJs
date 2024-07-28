import { Controller, Post, Body, HttpStatus, ConflictException, HttpException, UnauthorizedException, UseGuards, Headers } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    try {
      const user = await this.authService.validateUser(loginDto.email, loginDto.password);
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }
      const result = await this.authService.login(user);
      throw new HttpException(result, HttpStatus.OK);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new HttpException(
          { message: error.message, data: [] },
          HttpStatus.UNAUTHORIZED
        );
      }
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        { message: 'An error occurred', data: [] },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('register')
  async register(@Body() registerDto: { email: string; password: string }) {
    try {
      const result = await this.authService.register(registerDto.email, registerDto.password);
      return result;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new HttpException(
          { message: 'User already exists', data: [] },
          HttpStatus.CONFLICT
        );
      }
      throw new HttpException(
        { message: 'An error occurred', data: [] },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Headers('authorization') auth: string) {
    try {
      const token = auth.split(' ')[1];
      const result = await this.authService.logout(token);
      throw new HttpException(result, HttpStatus.OK);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        { message: 'An error occurred', data: [] },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}