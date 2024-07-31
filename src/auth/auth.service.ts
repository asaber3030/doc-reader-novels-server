import { ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { LoginDto, RegisterDto } from './dto';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcryptjs'
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
 
  constructor(
    private db: DatabaseService,
    private jwt: JwtService,
    private config: ConfigService
  ) {}

  async login(dto: LoginDto) {
    const userExists = await this.db.user.findUnique({ where: { email: dto.email } })
    if (!userExists) throw new ForbiddenException("Credientials Incorrect")

    const comparePasswords = await bcrypt.compare(dto.password, userExists.password)
    if (!comparePasswords) throw new ForbiddenException("Credientials Incorrect.")

    const token = await this.signToken(userExists)

    return { message: "User Loggedin Successfully.", statusCode: 201, data: { token } }
  }

  async register(dto: RegisterDto) {
    const hashed = await bcrypt.hash(dto.password, 10)
   
    const userExists = await this.db.user.findUnique({ where: { email: dto.email } })
    if (userExists) throw new ConflictException("E-mail already exists.")
   
    const user = await this.db.user.create({
      data: { ...dto, password: hashed }
    })

    const { password, ...rest } = user
    
    return { message: "User Registered Successfully.", statusCode: 201, data: rest }
  }

  async signToken(data: User): Promise<string> {
    const payload = {
      sub: data.id,
      ...data
    }
    const { password, ...withoutPassword } = payload
    return this.jwt.signAsync(withoutPassword, {
      expiresIn: "30d",
      secret: this.config.get('USER_SECERT')
    })
  }

}
