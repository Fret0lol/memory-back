import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import * as bcrypt from 'bcrypt';
import { AuthDto } from './dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { PrismaService } from '../prisma/prisma.service';

const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
);

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(dto: AuthDto) {
    // Generate hash of the password
    const hash = await bcrypt.hash(dto.password, 10);

    // Generate a name by default
    const name = dto.email.split('@')[0];

    try {
      const user = await this.prisma.user.create({
        data: { email: dto.email, name: name, password: hash },
      });

      return this.signToken(user.id, user.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credential taken');
        }
      }
      throw error;
    }
  }

  async login(dto: AuthDto) {
    // Find the user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) {
      throw new ForbiddenException('Crediential incorrect');
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      throw new ForbiddenException('Crediential incorrect');
    }

    return this.signToken(user.id, user.email);
  }

  async loginGoogle(token: string): Promise<{ access_token: string }> {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { email, name, picture } = ticket.getPayload();

    // Unique email
    const user = await this.prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      const newUser = await this.prisma.user.create({
        data: {
          email: email,
          name: name,
          image: picture,
        },
      });
      const token = await this.signToken(newUser.id, newUser.email);

      return { access_token: token };
    } else {
      const token = await this.signToken(user.id, user.email);

      return { access_token: token };
    }
  }

  signToken(userId: string, email: string): Promise<string> {
    const payload = {
      sub: userId,
      email: email,
    };
    return this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: process.env.JWT_SECRET,
    });
  }
}
