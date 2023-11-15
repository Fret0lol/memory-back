import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthDto } from './dto';
import { ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

jest.mock('../prisma/prisma.service');
jest.mock('@nestjs/jwt');

describe('AuthService', () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: { user: { create: jest.fn(), findUnique: jest.fn() } },
        },
        { provide: JwtService, useValue: { signAsync: jest.fn() } },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    authService['client'] = { verifyIdToken: jest.fn() };
  });

  describe('Register', () => {
    it('Should register a new user and return token', async () => {
      // Arrange
      const authDto: AuthDto = { email: 'test@test.com', password: 'test' };

      prismaService.user.create = jest.fn().mockResolvedValue({
        id: '1',
        email: authDto.email,
      });
      jwtService.signAsync = jest.fn().mockResolvedValue('token');

      // Act
      const result = await authService.register(authDto);

      // Assert
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: authDto.email,
          name: expect.any(String),
          password: expect.any(String),
        },
      });
      expect(jwtService.signAsync).toHaveBeenCalled();
      expect(result).toEqual('token');
    });

    it('Should throw ForbiddenException if user registration fails due to duplicate email', async () => {
      // Arrange
      const authDto: AuthDto = { email: 'test@test.com', password: 'test' };
      prismaService.user.create = jest.fn().mockRejectedValue(
        new PrismaClientKnownRequestError('', {
          code: 'P2002',
          meta: { target: ['email'] },
          clientVersion: '1',
        }),
      );

      // Act & Assert
      expect(authService.register(authDto)).rejects.toThrow(ForbiddenException);
    });

    it('Should throw an error if user registration fails for any other reasons', () => {
      // Arrange
      const authDto: AuthDto = { email: 'test@test.com', password: 'test' };
      prismaService.user.create = jest.fn().mockRejectedValue(new Error());

      // Act & Assert
      expect(authService.register(authDto)).rejects.toThrow(new Error());
    });
  });

  describe('Login', () => {
    it('Should login successfully and return a token', async () => {
      // Initialisation
      const authDto: AuthDto = { email: 'test@test.fr', password: 'test' };
      prismaService.user.findUnique = jest.fn().mockResolvedValue({
        id: '1',
        email: authDto.email,
        password: 'hash@test',
      });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jwtService.signAsync = jest.fn().mockResolvedValue('token');

      // Execution
      const result = await authService.login(authDto);

      // Validation
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: authDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(
        authDto.password,
        'hash@test',
      );
      expect(jwtService.signAsync).toHaveBeenCalled();
      expect(result).toEqual(expect.any(String));
    });

    it("Should throw ForbiddenException if user login fails due to user doen't exist", () => {
      // Initialisation
      const authDto: AuthDto = { email: 'test@test.fr', password: 'test' };
      prismaService.user.findUnique = jest.fn().mockResolvedValue(null);

      // Validation
      expect(authService.login(authDto)).rejects.toThrow(ForbiddenException);
    });

    it('Should throw ForbiddenException if user login fails due to incorrect password', () => {
      // Initialisation
      const authDto: AuthDto = { email: 'test@test.fr', password: 'test' };
      prismaService.user.findUnique = jest.fn().mockResolvedValue({
        id: '1',
        email: authDto.email,
        password: 'hash@test',
      });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      expect(authService.login(authDto)).rejects.toThrow(ForbiddenException);
    });
  });
});
