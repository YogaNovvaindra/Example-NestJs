import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HttpException, HttpStatus, UnauthorizedException, ConflictException } from '@nestjs/common';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            validateUser: jest.fn(),
            login: jest.fn(),
            register: jest.fn(),
            logout: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should login successfully and return a JWT token', async () => {
      // Using UUID for user ID
      const user = { id: '123e4567-e89b-12d3-a456-426614174000', email: 'test@example.com' };
      const loginResult = {
        message: 'Login successful',
        token: 'sometoken',
        data: []
      };
      jest.spyOn(authService, 'validateUser').mockResolvedValue(user);
      jest.spyOn(authService, 'login').mockResolvedValue(loginResult);

      await expect(authController.login({ email: 'test@example.com', password: 'password123' }))
        .rejects.toThrow(new HttpException(loginResult, HttpStatus.OK));
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      jest.spyOn(authService, 'validateUser').mockResolvedValue(null);

      await expect(authController.login({ email: 'wrong@example.com', password: 'wrongpassword' }))
        .rejects.toThrow(new HttpException({ message: 'Invalid credentials', data: [] }, HttpStatus.UNAUTHORIZED));
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const registerResult = {
        message: 'Login successful',
        token: 'sometoken',
        data: []
      };
      jest.spyOn(authService, 'register').mockResolvedValue(registerResult);

      expect(await authController.register({ email: 'test@example.com', password: 'password123' })).toBe(registerResult);
    });

    it('should throw ConflictException if user already exists', async () => {
      jest.spyOn(authService, 'register').mockRejectedValue(new ConflictException());

      await expect(authController.register({ email: 'existing@example.com', password: 'password123' }))
        .rejects.toThrow(new HttpException({ message: 'User already exists', data: [] }, HttpStatus.CONFLICT));
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const logoutResult = {
        message: 'Logged out successfully',
        data: []
      };
      jest.spyOn(authService, 'logout').mockResolvedValue(logoutResult);

      const authHeader = 'Bearer sometoken';
      await expect(authController.logout(authHeader))
        .rejects.toThrow(new HttpException(logoutResult, HttpStatus.OK));
    });
  });
});