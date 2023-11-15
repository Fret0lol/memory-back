import { JwtService } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthDto } from './dto';
import { Test } from '@nestjs/testing';
import { PrismaModule } from '../prisma/prisma.module';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [PrismaModule],
      controllers: [AuthController],
      providers: [AuthService, JwtService],
    }).compile();

    authService = moduleFixture.get<AuthService>(AuthService);
    authController = moduleFixture.get<AuthController>(AuthController);
  });

  describe('Register', () => {
    const dto: AuthDto = {
      email: 'test@test.fr',
      password: 'test',
    };

    it('Should call authService.register with correct parameter', async () => {
      const result = 'test';
      jest
        .spyOn(authService, 'register')
        .mockImplementation(async () => result);

      await authController.register(dto);

      expect(authService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('Login', () => {
    const dto: AuthDto = {
      email: 'test@test.fr',
      password: 'test',
    };

    it('Should call authService.login with correct parameter', async () => {
      const result = 'test';
      jest.spyOn(authService, 'login').mockImplementation(async () => result);

      await authController.login(dto);

      expect(authService.login).toHaveBeenCalledWith(dto);
    });
  });

  describe('Login with Google', () => {
    it('Should call authService.loginGoogle with correct parameter', async () => {
      const token: { access_token: string } = { access_token: 'test' };
      jest
        .spyOn(authService, 'loginGoogle')
        .mockImplementation(async () => token);

      await authController.loginGoogle('test');

      expect(authService.loginGoogle).toHaveBeenCalledWith('test');
    });
  });
});
