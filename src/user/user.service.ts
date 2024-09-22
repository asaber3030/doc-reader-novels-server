import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateNovelDto, UpdateNovelDto } from './dto/novels.dto';
import { ChangePasswordDto, FollowDto, UpdateUserDto } from './dto/user.dto';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PaginationType } from 'types';

import { DatabaseService } from 'src/database/database.service';

import { createPagination } from '../../utils/pagination';

import * as bcrypt from 'bcryptjs';
import { v4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';
import supabase from 'src/supabase';

@Injectable()
export class UserService {
  constructor(
    private db: DatabaseService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // Filtering users
  async allUsers({
    searchParam,
    pageParam,
    skipLimitParam,
    limitParam,
    orderByParam,
    orderTypeParam,
  }: PaginationType) {
    const { orderBy, orderType, skip, limit } = createPagination(
      pageParam,
      limitParam,
      orderByParam,
      orderTypeParam,
      skipLimitParam,
    );

    const totalNovels = await this.db.novel.count();
    const totalPages = Math.ceil(totalNovels / limitParam ?? 10);
    const hasNextPage = pageParam < totalPages;
    const hasPreviousPage = pageParam > 1;

    const users = await this.db.user.findMany({
      where: {
        OR: [
          {
            name: {
              contains: searchParam,
            },
          },
          {
            username: {
              contains: searchParam,
            },
          },
        ],
      },
      orderBy: { [orderBy]: orderType },
      take: limit,
      skip,
    });

    return {
      message: 'Novel Data',
      statusCode: 200,
      data: users,
      pagination: {
        totalPages,
        hasNextPage,
        hasPreviousPage,
        page: pageParam,
      },
    };
  }

  // Update User Details
  async updateMe(
    userId: number,
    data: UpdateUserDto,
    file: Express.Multer.File,
  ) {
    if (data.username) {
      const isUsernameAvailable = await this.db.user.findUnique({
        where: {
          username: data.username,
          AND: [{ id: { not: userId } }],
        },
      });

      if (isUsernameAvailable)
        throw new ConflictException('اسم المستخدم متواجد بالفعل.');
    }

    if (data.email) {
      const isEmailAvailable = await this.db.user.findUnique({
        where: {
          email: data.email,
          AND: [{ id: { not: userId } }],
        },
      });

      if (isEmailAvailable)
        throw new ConflictException('البريد الالكتروني متواجد بالفعل.');
    }

    const userDefaultPicture = await this.db.user.findUnique({
      where: { id: userId },
      select: { picture: true },
    });

    const fileName = v4() + '-' + file.originalname;

    await supabase.storage.from('users').upload(fileName, file.buffer, {
      upsert: true,
      contentType: file.mimetype,
    });

    const url = supabase.storage.from('users').getPublicUrl(fileName);

    const updatedUser = await this.db.user.update({
      where: { id: userId },
      data: {
        ...data,
        picture: file ? url.data.publicUrl : userDefaultPicture.picture,
      },
    });

    const { password, ...user } = updatedUser;

    const refreshToken = await this.signToken(updatedUser);

    return {
      message: 'تم تعديل البيانات بنجاح',
      data: {
        user,
        refreshToken,
      },
      statusCode: 200,
    };
  }

  // Change Password
  async changePassword(userId: number, data: ChangePasswordDto) {
    const user = await this.db.user.findUnique({ where: { id: userId } });
    const comparePassword = await bcrypt.compare(
      data.currentPassword,
      user.password,
    );
    if (!comparePassword) throw new UnauthorizedException('كلمة المرور خاطئة');

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    await this.db.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return {
      message: 'تم تغيير كلمة المرور بنجاح',
      statusCode: 200,
    };
  }

  // Create token
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

  // Current Loggined User
  async userNovels(user: User) {
    const novels = await this.db.novel.findMany({
      where: { userId: user.id },
    });
    return {
      statusCode: 200,
      message: 'User Novels',
      data: novels,
    };
  }

  // Follow
  async follow(currentUser: User, data: FollowDto) {
    const user = await this.db.user.findUnique({
      where: { id: data.userId },
      select: { id: true, followersCount: true, followingsCount: true },
    });
    if (!user)
      throw new NotFoundException('المستخدم الذي تحاول متابعته غير متواجد');

    const current = await this.db.user.findUnique({
      where: { id: currentUser.id },
    });

    const checkIfFollowers = await this.db.follower.findFirst({
      where: {
        userId: data.userId,
        followerId: currentUser.id,
      },
    });
    if (checkIfFollowers)
      throw new ConflictException('لا يمكنك متابعته مره اخرى');

    const newFollower = await this.db.follower.create({
      data: {
        userId: user.id,
        followerId: currentUser.id,
        createdAt: new Date(),
      },
    });

    const newFollowing = await this.db.following.create({
      data: {
        userId: currentUser.id,
        followingId: user.id,
        createdAt: new Date(),
      },
    });

    await this.db.user.update({
      where: { id: currentUser.id },
      data: { followingsCount: current.followingsCount + 1 },
    });

    await this.db.user.update({
      where: { id: user.id },
      data: { followersCount: user.followersCount + 1 },
    });

    return {
      message: 'Followed',
      status: 201,
    };
  }

  // Unfollow User
  async unfollow(currentUser: User, data: FollowDto) {
    const user = await this.db.user.findUnique({
      where: { id: data.userId },
      select: { id: true, followersCount: true, followingsCount: true },
    });
    if (!user)
      throw new NotFoundException(
        'المستخدم الذي تحاول ان تزيل متابعتك له لم يعد موجود.',
      );

    const current = await this.db.user.findUnique({
      where: { id: currentUser.id },
    });

    const checkIfFollowing = await this.db.following.findFirst({
      where: {
        userId: current.id,
        followingId: user.id,
      },
    });
    if (!checkIfFollowing)
      throw new ConflictException('انت لست تتابع هذا المستخدم.');

    const removeFollower = await this.db.follower.deleteMany({
      where: {
        followerId: current.id,
        userId: user.id,
      },
    });

    const removeFollowing = await this.db.following.deleteMany({
      where: {
        userId: currentUser.id,
        followingId: user.id,
      },
    });

    await this.db.user.update({
      where: { id: currentUser.id },
      data: {
        followingsCount:
          current.followingsCount - 1 === 0 ? 0 : current.followingsCount - 1,
      },
    });

    await this.db.user.update({
      where: { id: user.id },
      data: {
        followersCount:
          user.followersCount - 1 === 0 ? 0 : user.followersCount - 1,
      },
    });

    return {
      message: 'Unfollowed',
      status: 201,
    };
  }

  // Get User Novel ID
  async getNovel(id: number) {
    const novel = await this.db.novel.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!novel) throw new NotFoundException('هذه الرواية غير موجوده');
    return {
      statusCode: 200,
      message: 'User Novels',
      data: novel,
    };
  }

  // Create Novel
  async createNovel(
    userId: number,
    dto: CreateNovelDto,
    file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('يجب اضافة صورة للرواية!');

    const fileName = v4() + '-' + file.originalname;

    await supabase.storage.from('novels').upload(fileName, file.buffer, {
      upsert: true,
      contentType: file.mimetype,
    });

    const url = supabase.storage.from('novels').getPublicUrl(fileName);

    const findCategory = await this.db.category.findUnique({
      where: { id: dto.categoryId },
    });
    if (!findCategory) throw new NotFoundException('هذه القسم غير متواجد!');

    const newNovel = await this.db.novel.create({
      data: {
        ...dto,
        userId,
        image: url.data.publicUrl,
        createdAt: new Date(),
      },
    });

    await this.db.user.update({
      where: { id: userId },
      data: { novelsCount: { increment: 1 } },
    });

    return {
      statusCode: 201,
      message: 'تم اضافة رواية جديده!',
      data: newNovel,
    };
  }

  // Update Novel
  async updateNovel(userId: number, novelId: number, dto: UpdateNovelDto) {
    const novel = await this.db.novel.findUnique({
      where: { id: novelId },
    });

    if (!novel) throw new NotFoundException('هذه الرواية غير موجوده');
    if (novel.userId !== userId) throw new UnauthorizedException();

    const updatedNovel = await this.db.novel.update({
      where: { id: novelId },
      data: dto,
    });

    return {
      statusCode: 200,
      message: 'تم تعديل الرواية.',
      data: updatedNovel,
    };
  }

  // Delete Novel
  async deleteNovel(userId: number, novelId: number) {
    const novel = await this.db.novel.findUnique({
      where: { id: novelId },
    });
    if (!novel) throw new NotFoundException('هذه الرواية غير موجوده');
    if (novel.userId !== userId) throw new UnauthorizedException();

    const deletedNovel = await this.db.novel.delete({ where: { id: novelId } });

    return {
      statusCode: 200,
      message: 'تم مسح الرواية.',
      data: deletedNovel,
    };
  }
}
