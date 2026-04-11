import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Patch,
  Post,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as bcrypt from 'bcrypt';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ── GET /users/me ────────────────────────────────────────────
  @Get('me')
  async getProfile(@CurrentUser() userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return user.toJSON();
  }

  // ── PATCH /users/me ──────────────────────────────────────────
  @Patch('me')
  async updateProfile(
    @CurrentUser() userId: string,
    @Body() dto: UpdateUserDto,
  ) {
    const updatePayload: any = { ...dto };
    
    if (dto.firstName !== undefined || dto.lastName !== undefined) {
      const currentUser = await this.usersService.findById(userId);
      const currentDesc = (currentUser?.fullName || '').split(' ');
      const currentFirst = currentDesc[0] || '';
      const currentLast = currentDesc.slice(1).join(' ');
      
      const newFirst = dto.firstName !== undefined ? dto.firstName : currentFirst;
      const newLast = dto.lastName !== undefined ? dto.lastName : currentLast;
      
      updatePayload.fullName = `${newFirst} ${newLast}`.trim();
      delete updatePayload.firstName;
      delete updatePayload.lastName;
    }

    const user = await this.usersService.update(userId, updatePayload);
    if (!user) throw new NotFoundException('User not found');
    return user.toJSON();
  }

  // ── POST /users/me/avatar ────────────────────────────────────
  @Post('me/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (_req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          cb(new BadRequestException('Only image files are allowed'), false);
        } else {
          cb(null, true);
        }
      },
      limits: { fileSize: 800 * 1024 }, // 800KB max
    }),
  )
  async uploadAvatar(
    @CurrentUser() userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');

    const avatarUrl = `/uploads/avatars/${file.filename}`;
    const user = await this.usersService.update(userId, { avatar: avatarUrl });
    if (!user) throw new NotFoundException('User not found');

    return { avatar: avatarUrl };
  }

  // ── PATCH /users/me/password ─────────────────────────────────
  @Patch('me/password')
  async changePassword(
    @CurrentUser() userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    const user = await this.usersService.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const isValid = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.usersService.update(userId, { password: hashed });

    return { message: 'Password changed successfully' };
  }

  // ── DELETE /users/me ─────────────────────────────────────────
  @Delete('me')
  async deleteAccount(@CurrentUser() userId: string) {
    const user = await this.usersService.softDelete(userId);
    if (!user) throw new NotFoundException('User not found');
    return { message: 'Account deactivated' };
  }
}
