import * as bcrypt from 'bcryptjs';

import { User } from '@prisma/client';

import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from 'src/database/database.service';

import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private db: DatabaseService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.db.user.findUnique({
      where: {
        email: dto.email,
      },
    });
    if (!user) throw new ForbiddenException('هذا المستخدم غير متواجد.');

    const comparePasswords = await bcrypt.compare(dto.password, user.password);
    if (!comparePasswords)
      throw new ForbiddenException('هذا المستخدم غير متواجد..');

    const token = await this.signToken(user);
    const { password, ...main } = user;

    return {
      message: 'تم تسجيل الدخول بنجاح',
      statusCode: 201,
      data: { main, token },
    };
  }

  async register(dto: RegisterDto) {
    const hashed = await bcrypt.hash(dto.password, 10);

    const emailExists = await this.db.user.findUnique({
      where: { email: dto.email },
    });
    if (emailExists) throw new ConflictException('البريد الالكتروني متواجد.');

    const usernameExists = await this.db.user.findUnique({
      where: { username: dto.username },
    });
    if (usernameExists) throw new ConflictException('اسم المستخدم متواجد.');

    const user = await this.db.user.create({
      data: { ...dto, password: hashed, createdAt: new Date() },
    });

    const { password, ...rest } = user;

    return {
      message: 'تم تسجيل مستخدم جديد بنجاح!',
      statusCode: 201,
      data: rest,
    };
  }

  async updateUser(dto: RegisterDto) {
    const hashed = await bcrypt.hash(dto.password, 10);

    const emailExists = await this.db.user.findUnique({
      where: { email: dto.email },
    });
    if (emailExists) throw new ConflictException('البريد الالكتروني متواجد.');

    const usernameExists = await this.db.user.findUnique({
      where: { username: dto.username },
    });
    if (usernameExists) throw new ConflictException('اسم المستخدم متواجد.');

    const user = await this.db.user.create({
      data: { ...dto, password: hashed, createdAt: new Date() },
    });

    const { password, ...rest } = user;

    return {
      message: 'تم تسجيل مستخدم جديد بنجاح!',
      statusCode: 201,
      data: rest,
    };
  }

  async signToken(data: User): Promise<string> {
    const payload = {
      sub: data.id,
      ...data,
    };
    const { password, ...withoutPassword } = payload;
    return this.jwt.signAsync(withoutPassword, {
      expiresIn: '30d',
      secret: this.config.get('USER_SECERT'),
    });
  }
}
